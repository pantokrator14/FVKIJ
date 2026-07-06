"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DynamicSidebar from "@/components/DynamicSidebar";
import type { UserSession } from "../../../../../types";

interface DojoItem {
  _id: string;
  name: string;
  rif: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  arts: string[];
  foundationDate: string;
  adminUser?: { _id: string; name: string; email: string };
}

export default function PendingDojosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [dojos, setDojos] = useState<DojoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.session?.isAdmin) return router.push("/");
        setUser(data.session);
      });
  }, [router]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dojos?pending=true");
      const data = await res.json();
      const list = data.dojos ?? [];
      // Si no hay dojos, probar con el endpoint normal
      if (list.length === 0) {
        const res2 = await fetch("/api/admin/dojos");
        const data2 = await res2.json();
        const allDojos: DojoItem[] = data2.dojos ?? [];
        setDojos(allDojos.filter((d) => d.adminUser !== undefined));
      } else {
        setDojos(list);
      }
    } catch {
      // fallback
      const res2 = await fetch("/api/admin/dojos");
      const data2 = await res2.json();
      setDojos(data2.dojos ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const showMsg = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleActivate = async (id: string, name: string) => {
    if (!confirm(`¿Activar el dojo "${name}"? El administrador recibirá un email de notificación.`)) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/dojos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });
      if (res.ok) {
        showMsg("success", `Dojo "${name}" activado exitosamente`);
        setDojos((prev) => prev.filter((d) => d._id !== id));
        if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).showToast) {
          ((window as unknown as Record<string, unknown>).showToast as (t: string, m: string) => void)(
            "success",
            `Dojo "${name}" activado`
          );
        }
      } else {
        const data = await res.json();
        showMsg("error", data.error ?? "Error al activar");
      }
    } catch {
      showMsg("error", "Error de red");
    }
    setProcessing(null);
  };

  const handleReject = async (id: string, name: string) => {
    if (!confirm(`¿Rechazar y eliminar el dojo "${name}"?`)) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/dojos/${id}`, { method: "DELETE" });
      if (res.ok) {
        showMsg("success", `Dojo "${name}" rechazado y eliminado`);
        setDojos((prev) => prev.filter((d) => d._id !== id));
      } else {
        const data = await res.json();
        showMsg("error", data.error ?? "Error al rechazar");
      }
    } catch {
      showMsg("error", "Error de red");
    }
    setProcessing(null);
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
          <h1><i className="fa fa-clock"></i> Dojos Pendientes de Activación</h1>
        </div>
        <div className="card-body">
          {message && (
            <div className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible`}>
              <button type="button" className="close" onClick={() => setMessage(null)}>&times;</button>
              {message.text}
            </div>
          )}

          <button className="btn btn-outline-info mb-3" onClick={load}>
            <i className="fa fa-refresh"></i> Recargar
          </button>

          {loading ? (
            <div className="text-center p-4"><i className="fa fa-spinner fa-spin fa-2x"></i> Cargando...</div>
          ) : dojos.length === 0 ? (
            <div className="alert alert-success">
              <i className="fa fa-check-circle"></i> No hay dojos pendientes de activación.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                  <tr>
                    <th>Dojo</th>
                    <th>RIF</th>
                    <th>Contacto</th>
                    <th>Email</th>
                    <th>Artes</th>
                    <th style={{ width: 200 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {dojos.map((d) => (
                    <tr key={d._id}>
                      <td><strong>{d.name}</strong></td>
                      <td>{d.rif}</td>
                      <td>
                        {d.adminUser ? (
                          <>{d.adminUser.name}<br /><small className="text-muted">{d.adminUser.email}</small></>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>{d.contactEmail}</td>
                      <td>{d.arts?.join(", ") || "—"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-success mr-2"
                          onClick={() => handleActivate(d._id, d.name)}
                          disabled={processing === d._id}
                        >
                          <i className="fa fa-check"></i>{" "}
                          {processing === d._id ? "..." : "Activar"}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleReject(d._id, d.name)}
                          disabled={processing === d._id}
                        >
                          <i className="fa fa-times"></i> Rechazar
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
    </div>
  );
}
