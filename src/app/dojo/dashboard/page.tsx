import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Dojo from "@/models/Dojo";
import Payment from "@/models/Payment";
import DynamicSidebar from "@/components/DynamicSidebar";

/**
 * Dashboard del Dojo con estadísticas y estado de solvencia.
 */
export default async function DojoDashboardPage() {
  const session = await getSession();

  if (!session || !session.isDojo) {
    redirect("/");
  }

  await connectDB();
  const dojo = await Dojo.findOne({ adminUser: session._id });

  if (!dojo) {
    redirect("/");
  }

  const [totalMembers, solvent, payments] = await Promise.all([
    User.countDocuments({ "dojo._id": dojo._id }),
    dojo.isSolvent(),
    Payment.find({
      status: "confirmado",
      $or: [
        { to: dojo._id, toModel: "Dojo" },
        { from: dojo._id, fromModel: "Dojo" },
      ],
    }).select("amount type date"),
  ]);

  const ingresosMes = payments
    .filter(
      (p) =>
        p.type === "ingreso" &&
        new Date(p.date).getMonth() === new Date().getMonth() &&
        new Date(p.date).getFullYear() === new Date().getFullYear()
    )
    .reduce((sum, p) => sum + p.amount, 0);

  const egresosMes = payments
    .filter(
      (p) =>
        p.type === "egreso" &&
        new Date(p.date).getMonth() === new Date().getMonth() &&
        new Date(p.date).getFullYear() === new Date().getFullYear()
    )
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="row">
      <div className="col-sm-12 col-md-3 bg-dark">
        <div className="card-body">
          <DynamicSidebar user={session} />
        </div>
      </div>

      <div className="col-sm-12 col-md-9 content">
        <div className="card-head">
          <br />
          <h1>
            <i className="fa fa-home"></i> Panel del Dojo
          </h1>
        </div>
        <div className="card-body">
          <div className="alert alert-info">
            <i className="fas fa-info-circle"></i> Bienvenido,{" "}
            <strong>{session.name}</strong>. Dojo: <strong>{dojo.name}</strong>
          </div>

          {!solvent && (
            <div className="alert alert-warning">
              <i className="fas fa-exclamation-triangle"></i>{" "}
              <strong>Dojo insolvente.</strong> Por favor, ponte al día con
              los pagos a la FVK para evitar suspensiones.
            </div>
          )}

          {/* Stats Cards */}
          <div className="row mt-4">
            <div className="col-md-4 mb-3">
              <div className="card text-white bg-primary">
                <div className="card-body text-center">
                  <i className="fas fa-users fa-3x mb-2"></i>
                  <h3 className="mb-0">{totalMembers}</h3>
                  <p className="mb-0">Miembros</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-white bg-success">
                <div className="card-body text-center">
                  <i className="fas fa-piggy-bank fa-3x mb-2"></i>
                  <h3 className="mb-0">
                    ${ingresosMes.toFixed(2)}
                  </h3>
                  <p className="mb-0">Ingresos del Mes</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className={`card text-white ${solvent ? "bg-success" : "bg-warning"}`}>
                <div className="card-body text-center">
                  <i className={`fas fa-${solvent ? "check-circle" : "times-circle"} fa-3x mb-2`}></i>
                  <h3 className="mb-0">{solvent ? "SOLVENTE" : "INSOLVENTE"}</h3>
                  <p className="mb-0">Estado FVK</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6 mb-3">
              <div className="card border-info">
                <div className="card-body">
                  <h5><i className="fas fa-address-card text-info"></i> Datos del Dojo</h5>
                  <table className="table table-sm mt-3">
                    <tbody>
                      <tr><td><strong>RIF:</strong></td><td>{dojo.rif}</td></tr>
                      <tr><td><strong>Email:</strong></td><td>{dojo.contactEmail}</td></tr>
                      <tr><td><strong>Teléfono:</strong></td><td>{dojo.phone || "N/A"}</td></tr>
                      <tr><td><strong>Dirección:</strong></td><td>{dojo.address || "N/A"}</td></tr>
                      <tr><td><strong>Artes:</strong></td><td>{dojo.arts?.join(", ") || "N/A"}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="card border-secondary">
                <div className="card-body">
                  <h5><i className="fas fa-chart-line text-secondary"></i> Resumen Financiero</h5>
                  <table className="table table-sm mt-3">
                    <tbody>
                      <tr>
                        <td><strong>Ingresos del Mes:</strong></td>
                        <td className="text-success">${ingresosMes.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>Egresos del Mes:</strong></td>
                        <td className="text-danger">${egresosMes.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>Balance:</strong></td>
                        <td className={ingresosMes - egresosMes >= 0 ? "text-success" : "text-danger"}>
                          ${(ingresosMes - egresosMes).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
