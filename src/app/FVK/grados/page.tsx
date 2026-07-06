"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DynamicSidebar from "@/components/DynamicSidebar";
import type { UserSession } from "../../../../types";

interface Grade {
  _id: string;
  name: string;
  rank: number;
}

export default function GradeManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Grade | null>(null);
  const [form, setForm] = useState({ name: "", rank: "" });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.session?.isAdmin) return router.push("/");
        setUser(data.session);
      });
  }, [router]);

  const loadGrades = async () => {
    const res = await fetch("/api/admin/grados");
    const data = await res.json();
    setGrades(data.grades ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadGrades();
  }, []);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", rank: "" });
    setShowModal(true);
  };

  const openEdit = (g: Grade) => {
    setEditing(g);
    setForm({ name: g.name, rank: String(g.rank) });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.rank) {
      showMsg("error", "Todos los campos son requeridos");
      return;
    }

    const rank = Number(form.rank);
    if (Number.isNaN(rank) || rank < 0) {
      showMsg("error", "El rango debe ser un número válido");
      return;
    }

    const url = editing
      ? `/api/admin/grados/${editing._id}`
      : "/api/admin/grados";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, rank }),
    });

    const data = await res.json();
    if (res.ok) {
      showMsg("success", editing ? "Grado actualizado" : "Grado creado");
      setShowModal(false);
      loadGrades();
      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).showToast) {
        ((window as unknown as Record<string, unknown>).showToast as (t: string, m: string) => void)(
          "success",
          editing ? "Grado actualizado exitosamente" : "Grado creado exitosamente"
        );
      }
    } else {
      showMsg("error", data.error ?? "Error al guardar");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el grado "${name}"? Los estudiantes con este grado no se verán afectados.`)) return;

    const res = await fetch(`/api/admin/grados/${id}`, { method: "DELETE" });
    if (res.ok) {
      showMsg("success", "Grado eliminado");
      loadGrades();
      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).showToast) {
        ((window as unknown as Record<string, unknown>).showToast as (t: string, m: string) => void)(
          "success",
          "Grado eliminado exitosamente"
        );
      }
    } else {
      const data = await res.json();
      showMsg("error", data.error ?? "Error al eliminar");
    }
  };

  if (!user) return <div className="text-center p-5"><i className="fa fa-spinner fa-spin fa-3x"></i></div>;

  return (
    <div className="row">
      <div className="col-sm-12 col-md-3 bg-dark">
        <div className="card-body">
          <DynamicSidebar user={user} />
        </div>
      </div>

      <div className="col-sm-12 col-md-9 content">
        <div className="card-head">
          <br />
          <h1><i className="fa fa-graduation-cap"></i> Gestión de Grados</h1>
        </div>
        <div className="card-body">
          {message && (
            <div className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible`}>
              <button type="button" className="close" onClick={() => setMessage(null)}>&times;</button>
              {message.text}
            </div>
          )}

          <button className="btn btn-danger mb-3" onClick={openCreate}>
            <i className="fa fa-plus"></i> Nuevo Grado
          </button>

          {loading ? (
            <div className="text-center p-4"><i className="fa fa-spinner fa-spin fa-2x"></i> Cargando...</div>
          ) : grades.length === 0 ? (
            <div className="alert alert-info">No hay grados registrados.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                  <tr>
                    <th>Nombre</th>
                    <th>Rango</th>
                    <th style={{ width: 180 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g._id}>
                      <td><strong>{g.name}</strong></td>
                      <td>{g.rank}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-info mr-2"
                          onClick={() => openEdit(g)}
                        >
                          <i className="fa fa-pencil"></i> Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(g._id, g.name)}
                        >
                          <i className="fa fa-trash"></i> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="modal" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="fa fa-graduation-cap"></i>{" "}
                  {editing ? "Editar Grado" : "Nuevo Grado"}
                </h5>
                <button type="button" className="close text-white" onClick={() => setShowModal(false)}>
                  &times;
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nombre del Grado</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ej: 1er kyu"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Rango (orden)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.rank}
                      onChange={(e) => setForm({ ...form, rank: e.target.value })}
                      placeholder="Ej: 8"
                      min="0"
                      required
                    />
                    <small className="text-muted">
                      Número menor = grado inferior (ej: 6to kyu = 1, 8vo dan = 14)
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-danger">
                    <i className="fa fa-save"></i> {editing ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
