"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Messages from "@/components/Messages";

interface MemberItem {
  _id: string;
  name: string;
  identification: number;
  email: string;
  grade: string;
}

interface PaginationInfo {
  page: number;
  pages: number;
  total: number;
}

interface MembersClientProps {
  members: MemberItem[];
  pagination?: PaginationInfo;
}

const GRADES = [
  { value: "6to kyu", label: "六級・6to Kyu" },
  { value: "5to kyu", label: "五級・5to Kyu" },
  { value: "4to kyu", label: "四級・4to Kyu" },
  { value: "3er kyu", label: "三級・3er Kyu" },
  { value: "2do kyu", label: "二級・2do Kyu" },
  { value: "1er kyu", label: "一級・1er Kyu" },
  { value: "1er dan", label: "一段・1er Dan" },
  { value: "2do dan", label: "二段・2do Dan" },
  { value: "3er dan", label: "三段・3er Dan" },
  { value: "4to dan", label: "四段・4to Dan" },
  { value: "5to dan", label: "五段・5to Dan" },
  { value: "6to dan", label: "六段・6to Dan" },
  { value: "7mo dan", label: "七段・7mo Dan" },
  { value: "8vo dan", label: "八段・8vo Dan" },
];

/**
 * Componente cliente con tabla de miembros + modales de nuevo y editar.
 */
export default function MembersClient({ members, pagination }: MembersClientProps) {
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editMember, setEditMember] = useState<MemberItem | null>(null);
  // Payment history modal
  const [paymentMemberId, setPaymentMemberId] = useState<string | null>(null);
  const [paymentMemberName, setPaymentMemberName] = useState("");
  const [payments, setPayments] = useState<Array<{ _id: string; type: string; amount: number; description?: string; status: string; date: string }>>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // ─── Formulario nuevo miembro ──────────────────────────────
  const [formData, setFormData] = useState({
    name: "",
    identification: "",
    email: "",
    password: "",
    confirm_password: "",
    birthdate: "",
    height: "",
    weight: "",
    gender: "masculino",
    address: "",
    grade: "6to kyu",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch("/api/dojo/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al registrar");
        return;
      }

      setSuccess("Estudiante registrado exitosamente");
      closeModal("newMemberModal");
      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).showToast) {
        ((window as unknown as Record<string, unknown>).showToast as (t: string, m: string) => void)(
          "success",
          "Estudiante registrado exitosamente"
        );
      }
      setTimeout(() => router.refresh(), 500);
    } catch {
      setError("Error al registrar estudiante");
    }
  };

  // ─── Editar miembro ────────────────────────────────────────
  const openEditModal = (member: MemberItem) => {
    setEditMember(member);
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editMember) return;

    setSuccess("");
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(`/api/kenshin/profile/${editMember._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          identification: Number(formData.get("identification")),
          grade: { name: formData.get("grade") },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al actualizar miembro");
        return;
      }

      setSuccess("Miembro actualizado exitosamente");
      setEditMember(null);
      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).showToast) {
        ((window as unknown as Record<string, unknown>).showToast as (t: string, m: string) => void)(
          "success",
          "Miembro actualizado exitosamente"
        );
      }
      setTimeout(() => router.refresh(), 500);
    } catch {
      setError("Error al actualizar miembro");
    }
  };

  // ─── Historial de pagos ────────────────────────────────────
  const openPayments = async (member: MemberItem) => {
    setPaymentMemberId(member._id);
    setPaymentMemberName(member.name);
    setPaymentsLoading(true);
    setPayments([]);

    try {
      const res = await fetch(`/api/payments/user/${member._id}?limit=50`);
      const data = await res.json();
      setPayments(data.payments ?? []);
    } catch {
      setPayments([]);
    }
    setPaymentsLoading(false);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(newPage));
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };

  const closeModal = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      (el as HTMLDivElement).classList.remove("show");
      el.style.display = "none";
      document.body.classList.remove("modal-open");
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) backdrop.remove();
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (n: number) =>
    "$" + n.toLocaleString("es-VE", { minimumFractionDigits: 2 });

  return (
    <>
      <Messages success_msg={success} error_msg={error} />

      {/* Tabla de Miembros */}
      <div className="card">
        <div className="card-body">
          <h3 className="card-title">Miembros Activos</h3>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="thead-light">
                <tr>
                  <th>Nombre</th>
                  <th>Identificación</th>
                  <th>Grado</th>
                  <th>Email</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {members.length > 0 ? (
                  members.map((member) => (
                    <tr key={member._id}>
                      <td>{member.name}</td>
                      <td>{member.identification}</td>
                      <td>{member.grade}</td>
                      <td>{member.email}</td>
                      <td>
                        <a
                          href={`/student/profile/${member._id}`}
                          className="btn btn-sm btn-info"
                        >
                          <i className="fas fa-eye"></i> Ver
                        </a>
                        <button
                          className="btn btn-sm btn-warning ml-1"
                          onClick={() => openEditModal(member)}
                        >
                          <i className="fas fa-edit"></i> Editar
                        </button>
                        <button
                          className="btn btn-sm btn-secondary ml-1"
                          onClick={() => openPayments(member)}
                        >
                          <i className="fas fa-money"></i> Pagos
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No hay miembros registrados
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
              <small>Total: {pagination.total} miembros</small>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuevo Miembro */}
      <div
        className="modal fade"
        id="newMemberModal"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Registrar Nuevo Estudiante</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form onSubmit={handleNewSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Nombre Completo *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Identificación *</label>
                      <input
                        type="text"
                        name="identification"
                        className="form-control"
                        value={formData.identification}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Fecha de Nacimiento *</label>
                      <input
                        type="date"
                        name="birthdate"
                        className="form-control"
                        value={formData.birthdate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Contraseña *</label>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Confirmar Contraseña *</label>
                      <input
                        type="password"
                        name="confirm_password"
                        className="form-control"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Altura (cm) *</label>
                      <input
                        type="number"
                        name="height"
                        className="form-control"
                        value={formData.height}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Peso (kg) *</label>
                      <input
                        type="number"
                        name="weight"
                        className="form-control"
                        value={formData.weight}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Género *</label>
                      <select
                        name="gender"
                        className="form-control"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Grado *</label>
                  <select
                    name="grade"
                    className="form-control"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                  >
                    {GRADES.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
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
                  Registrar Estudiante
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Editar Miembro */}
      {editMember && (
        <div
          className="modal fade show"
          id="editMemberModal"
          tabIndex={-1}
          role="dialog"
          style={{ display: "block" }}
          aria-modal="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Miembro</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setEditMember(null)}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nombre Completo</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      defaultValue={editMember.name}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Identificación</label>
                    <input
                      type="number"
                      name="identification"
                      className="form-control"
                      defaultValue={editMember.identification}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editMember.email}
                      readOnly
                    />
                    <small className="form-text text-muted">
                      El correo no se puede cambiar desde aquí
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Grado</label>
                    <select
                      name="grade"
                      className="form-control"
                      defaultValue={editMember.grade}
                    >
                      {GRADES.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditMember(null)}
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

      {/* Modal Historial de Pagos */}
      {paymentMemberId && (
        <div
          className="modal fade show"
          id="paymentHistoryModal"
          tabIndex={-1}
          role="dialog"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          aria-modal="true"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="fa fa-money"></i> Historial de Pagos — {paymentMemberName}
                </h5>
                <button
                  type="button"
                  className="close text-white"
                  onClick={() => setPaymentMemberId(null)}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {paymentsLoading ? (
                  <div className="text-center p-4">
                    <i className="fa fa-spinner fa-spin fa-2x"></i> Cargando...
                  </div>
                ) : payments.length === 0 ? (
                  <div className="alert alert-info mb-0">
                    Este estudiante no tiene pagos registrados.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered mb-0">
                      <thead className="thead-light">
                        <tr>
                          <th>Fecha</th>
                          <th>Tipo</th>
                          <th>Concepto</th>
                          <th>Estado</th>
                          <th className="text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p._id}>
                            <td>{formatDate(p.date)}</td>
                            <td>
                              <span className={`badge ${p.type === "ingreso" ? "badge-success" : "badge-warning"}`}>
                                {p.type}
                              </span>
                            </td>
                            <td>{p.description ?? "—"}</td>
                            <td>
                              <span className={`badge ${p.status === "confirmado" ? "badge-success" : p.status === "pendiente" ? "badge-warning" : "badge-secondary"}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="text-right">{formatCurrency(p.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPaymentMemberId(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
