"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface DojoListItem {
  _id: string;
  name: string;
  rif: string;
  contactEmail: string;
  address: string;
  phone?: string;
  foundationDate: string;
  arts: string[];
  isSolvent: boolean;
}

interface PaginationInfo {
  page: number;
  pages: number;
  total: number;
}

interface DojoListClientProps {
  dojos: DojoListItem[];
  pagination?: PaginationInfo;
}

const ARTS_OPTIONS = ["kendo", "iaido", "jodo"];

/**
 * Componente cliente para la tabla de dojos con modal de edición y paginación.
 */
export default function DojoListClient({ dojos, pagination }: DojoListClientProps) {
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editDojo, setEditDojo] = useState<DojoListItem | null>(null);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "¿Estás seguro de eliminar este dojo? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/dojos/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSuccess("Dojo eliminado correctamente");
        router.refresh();
      } else {
        setError("Error al eliminar el dojo");
      }
    } catch {
      setError("Error al eliminar el dojo");
    }
  };

  const openEditModal = (dojo: DojoListItem) => {
    setEditDojo(dojo);
  };

  const closeEditModal = () => {
    setEditDojo(null);
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editDojo) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const selectedArts: string[] = [];
    for (const art of ARTS_OPTIONS) {
      if (formData.get(`art_${art}`) === "on") {
        selectedArts.push(art);
      }
    }

    try {
      const res = await fetch(`/api/admin/dojos/${editDojo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          rif: formData.get("rif"),
          contactEmail: formData.get("contactEmail"),
          address: formData.get("address"),
          phone: formData.get("phone"),
          arts: selectedArts,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al actualizar dojo");
        return;
      }

      setSuccess("Dojo actualizado exitosamente");
      closeEditModal();
      setTimeout(() => router.refresh(), 500);
    } catch {
      setError("Error al actualizar dojo");
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(newPage));
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.location.href = newUrl;
  };

  return (
    <>
      {success && (
        <div className="alert alert-success alert-dismissible">
          <button type="button" className="close" onClick={() => setSuccess("")}>&times;</button>
          {success}
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-dismissible">
          <button type="button" className="close" onClick={() => setError("")}>&times;</button>
          {error}
          <button
            className="btn btn-sm btn-outline-danger ml-2"
            onClick={() => {
              navigator.clipboard.writeText(error);
              if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).showToast) {
                ((window as unknown as Record<string, unknown>).showToast as (t: string, m: string) => void)(
                  "success",
                  "Error copiado al portapapeles"
                );
              }
            }}
          >
            <i className="fa fa-copy"></i> Copiar
          </button>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="thead-light">
            <tr>
              <th>Nombre</th>
              <th>RIF</th>
              <th>Contacto</th>
              <th>Fundación</th>
              <th>Artes</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dojos.length > 0 ? (
              dojos.map((dojo) => (
                <tr key={dojo._id}>
                  <td>
                    <strong>{dojo.name}</strong>
                    <br />
                    <small className="text-muted">{dojo.address}</small>
                  </td>
                  <td>{dojo.rif}</td>
                  <td>
                    <small>{dojo.contactEmail}</small>
                  </td>
                  <td>{dojo.foundationDate}</td>
                  <td>
                    {dojo.arts.map((art) => (
                      <span key={art} className="badge badge-info mr-1">
                        {art}
                      </span>
                    ))}
                  </td>
                  <td>
                    {dojo.isSolvent ? (
                      <span className="badge badge-success">Solvente</span>
                    ) : (
                      <span className="badge badge-warning">Insolvente</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => openEditModal(dojo)}
                        title="Editar dojo"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(dojo._id)}
                        title="Eliminar dojo"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">
                  <div className="alert alert-info mb-0">
                    No hay dojos registrados
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && pagination.pages > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center mb-0">
            <li className={`page-item ${pagination.page <= 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(pagination.page - 1)}>
                &laquo;
              </button>
            </li>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <li key={p} className={`page-item ${p === pagination.page ? "active" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(p)}>
                  {p}
                </button>
              </li>
            ))}
            <li className={`page-item ${pagination.page >= pagination.pages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(pagination.page + 1)}>
                &raquo;
              </button>
            </li>
          </ul>
        </nav>
      )}
      {pagination && (
        <div className="text-center text-muted mt-2">
          <small>Total: {pagination.total} dojos</small>
        </div>
      )}

      {/* Modal Editar Dojo */}
      {editDojo && (
        <div
          className="modal fade show"
          id="editDojoModal"
          tabIndex={-1}
          role="dialog"
          style={{ display: "block" }}
          aria-modal="true"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Dojo</h5>
                <button
                  type="button"
                  className="close"
                  onClick={closeEditModal}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Nombre del Dojo *</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          defaultValue={editDojo.name}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>RIF *</label>
                        <input
                          type="text"
                          name="rif"
                          className="form-control"
                          defaultValue={editDojo.rif}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Email de Contacto *</label>
                        <input
                          type="email"
                          name="contactEmail"
                          className="form-control"
                          defaultValue={editDojo.contactEmail}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Teléfono</label>
                        <input
                          type="text"
                          name="phone"
                          className="form-control"
                          defaultValue={editDojo.phone ?? ""}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Dirección</label>
                    <input
                      type="text"
                      name="address"
                      className="form-control"
                      defaultValue={editDojo.address}
                    />
                  </div>
                  <div className="form-group">
                    <label>Artes Marciales</label>
                    <div>
                      {ARTS_OPTIONS.map((art) => (
                        <div className="form-check form-check-inline" key={art}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name={`art_${art}`}
                            id={`edit_art_${art}`}
                            defaultChecked={editDojo.arts.includes(art)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`edit_art_${art}`}
                          >
                            {art.charAt(0).toUpperCase() + art.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeEditModal}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
