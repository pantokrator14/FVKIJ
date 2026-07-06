"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Messages from "@/components/Messages";

interface EquipmentItem {
  _id: string;
  type: string;
  description: string;
  serialNumber: string;
  status: string;
  assignedTo: { name: string } | null;
  dateAssigned: string;
  notes: string;
}

interface KenshinItem {
  _id: string;
  name: string;
  dojo: { _id?: string; name?: string } | undefined;
}

interface EquipmentClientProps {
  equipments: EquipmentItem[];
  kenshins: KenshinItem[];
}

const EQUIPMENT_TYPES = [
  "shinai",
  "bokken",
  "iaito",
  "bogu",
  "uniforme",
  "otros",
] as const;

/**
 * Componente cliente para la gestión de equipos.
 * Réplica exacta del admin/equipos.hbs con todos los modales.
 */
export default function EquipmentClient({
  equipments,
  kenshins,
}: EquipmentClientProps) {
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [assignId, setAssignId] = useState("");
  const [editData, setEditData] = useState({
    _id: "",
    type: "shinai",
    description: "",
    serialNumber: "",
    notes: "",
  });

  const handleNewEquipment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/admin/equipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.get("type"),
          description: formData.get("description"),
          serialNumber: formData.get("serialNumber"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al registrar equipo");
        return;
      }

      setSuccess("Equipo registrado exitosamente");
      closeModal("newEquipmentModal");
      setTimeout(() => router.refresh(), 500);
    } catch {
      setError("Error al registrar equipo");
    }
  };

  const handleAssign = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/admin/equipos/${assignId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kenshinId: formData.get("kenshinId"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al asignar equipo");
        return;
      }

      setSuccess("Equipo asignado exitosamente");
      closeModal("assignModal");
      setTimeout(() => router.refresh(), 500);
    } catch {
      setError("Error al asignar equipo");
    }
  };

  const handleLiberate = async (id: string) => {
    try {
      // PUT en /api/admin/equipos/[id] libera el equipo (asignado → disponible)
      const res = await fetch(`/api/admin/equipos/${id}`, {
        method: "PUT",
      });

      if (res.ok) {
        setSuccess("Equipo liberado");
        setTimeout(() => router.refresh(), 500);
      }
    } catch {
      setError("Error al liberar equipo");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este equipo?")) return;

    try {
      const res = await fetch(`/api/admin/equipos/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      setError("Error al eliminar equipo");
    }
  };

  const openAssignModal = (id: string) => {
    setAssignId(id);
  };

  const openEditModal = (eq: EquipmentItem) => {
    setEditData({
      _id: eq._id,
      type: eq.type,
      description: eq.description,
      serialNumber: eq.serialNumber,
      notes: eq.notes,
    });
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(`/api/admin/equipos/${editData._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.get("type"),
          description: formData.get("description"),
          serialNumber: formData.get("serialNumber"),
          notes: formData.get("notes"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al actualizar equipo");
        return;
      }

      setSuccess("Equipo actualizado exitosamente");
      closeModal("editModal");
      setTimeout(() => router.refresh(), 500);
    } catch {
      setError("Error al actualizar equipo");
    }
  };

  const closeModal = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("show");
      el.style.display = "none";
      document.body.classList.remove("modal-open");
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) backdrop.remove();
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "disponible":
        return "badge-success";
      case "asignado":
        return "badge-primary";
      case "en_reparacion":
        return "badge-warning";
      default:
        return "badge-danger";
    }
  };

  return (
    <>
      <Messages success_msg={success} error_msg={error} />

      <div className="row">
        {equipments.length > 0 ? (
          equipments.map((eq) => (
            <div className="col-md-4 mb-4" key={eq._id}>
              <div className="card h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">
                    {eq.type.charAt(0).toUpperCase() + eq.type.slice(1)}
                  </h5>
                </div>
                <div className="card-body">
                  <p className="card-text">{eq.description}</p>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      <strong>N° Serie:</strong>{" "}
                      {eq.serialNumber || "N/A"}
                    </li>
                    <li className="list-group-item">
                      <strong>Estado:</strong>{" "}
                      <span
                        className={`badge ${getStatusBadgeClass(eq.status)}`}
                      >
                        {eq.status}
                      </span>
                    </li>
                    {eq.assignedTo && (
                      <>
                        <li className="list-group-item">
                          <strong>Asignado a:</strong> {eq.assignedTo.name}
                        </li>
                        <li className="list-group-item">
                          <strong>Fecha asignación:</strong> {eq.dateAssigned}
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                <div className="card-footer">
                  <div className="btn-group">
                    {eq.status === "disponible" && (
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => openAssignModal(eq._id)}
                      >
                        <i className="fas fa-user-check"></i> Asignar
                      </button>
                    )}

                    {eq.status === "asignado" && (
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleLiberate(eq._id)}
                      >
                        <i className="fas fa-undo"></i> Liberar
                      </button>
                    )}

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(eq._id)}
                    >
                      <i className="fas fa-trash"></i> Eliminar
                    </button>

                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => openEditModal(eq)}
                    >
                      <i className="fas fa-edit"></i> Editar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-info">
              No hay equipos registrados
            </div>
          </div>
        )}
      </div>

      {/* Modal Nuevo Equipo */}
      <div
        className="modal fade"
        id="newEquipmentModal"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Registrar Nuevo Equipo</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form onSubmit={handleNewEquipment}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tipo *</label>
                  <select name="type" className="form-control" required>
                    {EQUIPMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Descripción *</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows={3}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Número de Serie</label>
                  <input
                    type="text"
                    name="serialNumber"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Asignar Equipo */}
      <div
        className="modal fade"
        id="assignModal"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Asignar Equipo</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Seleccionar Kenshin *</label>
                  <select name="kenshinId" className="form-control" required>
                    <option value="">Seleccionar...</option>
                    {kenshins.map((k) => (
                      <option key={k._id} value={k._id}>
                        {k.name}
                        {k.dojo?.name ? ` (${k.dojo.name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Editar Equipo */}
      <div
        className="modal fade"
        id="editModal"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar Equipo</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tipo *</label>
                <select
                  name="type"
                  className="form-control"
                  defaultValue={editData.type}
                >
                  {EQUIPMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={3}
                  defaultValue={editData.description}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Número de Serie</label>
                <input
                  type="text"
                  name="serialNumber"
                  className="form-control"
                  defaultValue={editData.serialNumber}
                />
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea
                  name="notes"
                  className="form-control"
                  rows={2}
                  defaultValue={editData.notes}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
