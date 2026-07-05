"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Messages from "./Messages";
import type { UserSession } from "../../types";

interface PaymentItem {
  _id: string;
  type: string;
  amount: number;
  description: string | undefined;
  status: string;
  from?: { _id: string; name?: string };
  to?: { _id: string; name?: string };
  date: string;
}

interface PaymentViewProps {
  payments: PaymentItem[];
  type: "ingresos" | "egresos";
  user: UserSession;
  dojos?: { _id: string; name: string }[];
  kenshins?: { _id: string; name: string }[];
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Vista de pagos unificada para todos los roles.
 * Un solo modal de transacciones con campos condicionales según el rol.
 */
export default function PaymentView({
  payments,
  type,
  user,
  dojos = [],
  kenshins = [],
}: PaymentViewProps) {
  const router = useRouter();
  const isIngresos = type === "ingresos";
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [destinationType, setDestinationType] = useState("FVK");

  const handleNewPayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: isIngresos ? "ingreso" : "egreso",
          amount: Number(formData.get("amount")),
          description: formData.get("description"),
          to: formData.get("to") as string,
          externalEntity: formData.get("externalEntity") as string,
          destinationType: formData.get("destinationType") as string,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al registrar pago");
        return;
      }

      setSuccess("Pago registrado exitosamente");
      closeModal("transactionModal");
      setTimeout(() => router.refresh(), 500);
    } catch {
      setError("Error al registrar el pago");
    }
  };

  const handleConfirmCancel = async (
    id: string,
    action: "confirmar" | "cancelar"
  ) => {
    try {
      const res = await fetch(`/api/payments/${id}?action=${action}`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      setError("Error al actualizar pago");
    }
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

  const getStatusBadge = (status: string): string => {
    switch (status) {
      case "confirmado":
        return "badge-success";
      case "pendiente":
        return "badge-warning";
      default:
        return "badge-danger";
    }
  };

  // ─── Render del modal según el rol ──────────────────────────────────
  const renderModalBody = () => {
    if (user.isStudent) {
      return (
        <>
          <input type="hidden" name="type" value="egreso" />

          <div className="form-group">
            <label>Dojo Destino</label>
            <input
              type="text"
              className="form-control"
              value={user.dojo?.name ?? "Tu dojo"}
              readOnly
            />
            <small className="form-text text-muted">
              Pago destinado a tu dojo actual
            </small>
          </div>

          <div className="form-group">
            <label>Monto</label>
            <input
              type="number"
              name="amount"
              className="form-control"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="description"
              className="form-control"
              rows={2}
              placeholder="Ej: Pago de mensualidad abril 2023"
            ></textarea>
          </div>
        </>
      );
    }

    // Admin / Dojo: formulario completo
    return (
      <>
        <input
          type="hidden"
          name="type"
          value={isIngresos ? "ingreso" : "egreso"}
        />

        <div className="form-group">
          <label>Monto</label>
          <input
            type="number"
            name="amount"
            className="form-control"
            step="0.01"
            min="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="description"
            className="form-control"
            rows={2}
            required
          ></textarea>
        </div>

        {isIngresos ? (
          <>
            {user.isAdmin && (
              <div className="form-group">
                <label>Dojo Origen</label>
                <select name="to" className="form-control" required>
                  <option value="">Seleccionar dojo...</option>
                  {dojos.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {user.isDojo && (
              <div className="form-group">
                <label>Kenshin</label>
                <select name="to" className="form-control" required>
                  <option value="">Seleccionar kenshin...</option>
                  {kenshins.map((k) => (
                    <option key={k._id} value={k._id}>
                      {k.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Destino del Egreso</label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="destinationType"
                  id="toFederation"
                  value="FVK"
                  checked={destinationType === "FVK"}
                  onChange={() => setDestinationType("FVK")}
                />
                <label className="form-check-label" htmlFor="toFederation">
                  Federación (FVK)
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="destinationType"
                  id="toExternal"
                  value="external"
                  checked={destinationType === "external"}
                  onChange={() => setDestinationType("external")}
                />
                <label className="form-check-label" htmlFor="toExternal">
                  {user.isDojo ? "Otros gastos" : "Entidad Externa"}
                </label>
              </div>
            </div>

            {destinationType === "external" && (
              <div className="form-group">
                <label>
                  {user.isDojo
                    ? "Descripción del gasto"
                    : "Nombre de la Entidad"}
                </label>
                <input
                  type="text"
                  name="externalEntity"
                  className="form-control"
                  placeholder={
                    user.isDojo
                      ? "Ej: Alquiler, Materiales, Eventos..."
                      : "Ej: FIK, CLAK, Proveedor..."
                  }
                />
              </div>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <>
      <Messages success_msg={success} error_msg={error} />

      <div className="container mt-4">
        <h2 className="mb-4">
          {isIngresos ? (
            <i className="fas fa-piggy-bank"></i>
          ) : (
            <i className="fas fa-hand-holding-usd"></i>
          )}{" "}
          {isIngresos ? "Ingresos" : "Egresos"}
          {user.isDojo && (
            <span className="badge badge-info float-right">
              Dojo: {user.name}
            </span>
          )}
          {user.isStudent && (
            <span className="badge badge-info float-right">
              Estudiante: {user.name}
            </span>
          )}
        </h2>

        {/* Botones de acción */}
        <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <button
            className="btn btn-primary"
            data-toggle="modal"
            data-target="#transactionModal"
          >
            <i className="fas fa-plus-circle"></i> Nueva Transacción
          </button>
          {user.isAdmin && (
            <a href="/FVK/reports" className="btn btn-outline-info">
              <i className="fas fa-bar-chart"></i> Reportes
            </a>
          )}
        </div>

        {/* Tabla de Transacciones */}
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Cantidad</th>
                <th>Descripción</th>
                <th>{isIngresos ? "Origen" : "Destino"}</th>
                <th>Fecha</th>
                <th>Estado</th>
                {user.isAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((p) => (
                  <tr
                    key={p._id}
                    className={p.status === "cancelado" ? "table-danger" : ""}
                  >
                    <td>${p.amount}</td>
                    <td>{p.description}</td>
                    <td>
                      {isIngresos
                        ? p.from?.name ?? "Sistema"
                        : p.to?.name ?? "Sistema"}
                    </td>
                    <td>{formatDate(p.date)}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    {user.isAdmin && (
                      <td>
                        {p.status === "pendiente" && (
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() =>
                                handleConfirmCancel(p._id, "confirmar")
                              }
                            >
                              <i className="fas fa-check"></i> Confirmar
                            </button>
                            <button
                              className="btn btn-sm btn-danger ml-2"
                              onClick={() =>
                                handleConfirmCancel(p._id, "cancelar")
                              }
                            >
                              <i className="fas fa-times"></i> Cancelar
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={user.isAdmin ? 6 : 5}
                    className="text-center"
                  >
                    No hay transacciones registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Transacción — unificado, render condicional según rol */}
      <div
        className="modal fade"
        id="transactionModal"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {user.isStudent
                  ? "Registrar Pago a tu Dojo"
                  : "Nueva Transacción"}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form onSubmit={handleNewPayment}>
              <div className="modal-body">{renderModalBody()}</div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
