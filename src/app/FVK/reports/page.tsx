"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DynamicSidebar from "@/components/DynamicSidebar";
import type { UserSession, PaymentType } from "../../../../types";

interface PaymentItem {
  _id: string;
  type: PaymentType;
  amount: number;
  description?: string;
  status: string;
  date: string;
  from?: { _id: string; name: string };
  to?: { _id: string; name: string };
  fromModel?: string;
  toModel?: string;
  externalEntity?: string;
}

interface DojoOption {
  _id: string;
  name: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [dojos, setDojos] = useState<DojoOption[]>([]);
  const [totals, setTotals] = useState({ ingresos: 0, egresos: 0, balance: 0 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    dojoId: "",
    type: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.session?.isAdmin) return router.push("/");
        setUser(data.session);
      });
  }, [router]);

  const load = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.dojoId) params.set("dojoId", filters.dojoId);
    if (filters.type) params.set("type", filters.type);
    params.set("page", String(page));
    params.set("limit", "50");

    try {
      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      const data = await res.json();
      setPayments(data.payments ?? []);
      setDojos(data.dojos ?? []);
      setTotals(data.totals ?? { ingresos: 0, egresos: 0, balance: 0 });
      setPagination(data.pagination ?? { page: 1, pages: 1, total: 0 });
    } catch {
      // silent
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    load(1);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (n: number) =>
    "$" + n.toLocaleString("es-VE", { minimumFractionDigits: 2 });

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
          <h1><i className="fa fa-bar-chart"></i> Reportes Financieros</h1>
        </div>
        <div className="card-body">
          {/* Totals Cards */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card text-white bg-success">
                <div className="card-body text-center">
                  <h4>{formatCurrency(totals.ingresos)}</h4>
                  <p className="mb-0">Total Ingresos</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-white bg-danger">
                <div className="card-body text-center">
                  <h4>{formatCurrency(totals.egresos)}</h4>
                  <p className="mb-0">Total Egresos</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className={`card text-white ${totals.balance >= 0 ? "bg-info" : "bg-warning"}`}>
                <div className="card-body text-center">
                  <h4>{formatCurrency(totals.balance)}</h4>
                  <p className="mb-0">Balance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-header bg-secondary text-white">
              <i className="fa fa-filter"></i> Filtros
            </div>
            <div className="card-body">
              <form onSubmit={handleFilter} className="form-inline flex-wrap gap-2">
                <div className="form-group mr-3 mb-2">
                  <label className="mr-2">Desde:</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={filters.from}
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                  />
                </div>
                <div className="form-group mr-3 mb-2">
                  <label className="mr-2">Hasta:</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={filters.to}
                    onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                  />
                </div>
                <div className="form-group mr-3 mb-2">
                  <label className="mr-2">Dojo:</label>
                  <select
                    className="form-control form-control-sm"
                    value={filters.dojoId}
                    onChange={(e) => setFilters({ ...filters, dojoId: e.target.value })}
                  >
                    <option value="">Todos</option>
                    {dojos.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group mr-3 mb-2">
                  <label className="mr-2">Tipo:</label>
                  <select
                    className="form-control form-control-sm"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  >
                    <option value="">Todos</option>
                    <option value="ingreso">Ingresos</option>
                    <option value="egreso">Egresos</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-sm btn-danger mb-2">
                  <i className="fa fa-search"></i> Filtrar
                </button>
              </form>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center p-4">
              <i className="fa fa-spinner fa-spin fa-2x"></i> Cargando...
            </div>
          ) : payments.length === 0 ? (
            <div className="alert alert-info">
              No se encontraron pagos con los filtros seleccionados.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead className="thead-dark">
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>De</th>
                      <th>Para</th>
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
                          <span
                            className={`badge ${
                              p.type === "ingreso" ? "badge-success" : "badge-warning"
                            }`}
                          >
                            {p.type === "ingreso" ? "INGRESO" : "EGRESO"}
                          </span>
                        </td>
                        <td>{p.from?.name ?? p.fromModel ?? "—"}</td>
                        <td>
                          {p.to?.name ?? p.toModel ?? p.externalEntity ?? "—"}
                        </td>
                        <td>{p.description ?? "—"}</td>
                        <td>
                          <span
                            className={`badge ${
                              p.status === "confirmado"
                                ? "badge-success"
                                : p.status === "pendiente"
                                ? "badge-warning"
                                : "badge-secondary"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="text-right">
                          <strong>{formatCurrency(p.amount)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <nav>
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${pagination.page <= 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => load(pagination.page - 1)}
                      >
                        &laquo;
                      </button>
                    </li>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <li
                        key={p}
                        className={`page-item ${p === pagination.page ? "active" : ""}`}
                      >
                        <button className="page-link" onClick={() => load(p)}>
                          {p}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        pagination.page >= pagination.pages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => load(pagination.page + 1)}
                      >
                        &raquo;
                      </button>
                    </li>
                  </ul>
                </nav>
              )}

              <div className="text-center text-muted">
                <small>
                  Mostrando {payments.length} de {pagination.total} registros
                </small>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
