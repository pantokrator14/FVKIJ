import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Equipment from "@/models/Equipment";
import DynamicSidebar from "@/components/DynamicSidebar";

/**
 * Dashboard del Estudiante con información personal y de equipos.
 */
export default async function StudentDashboardPage() {
  const session = await getSession();

  if (!session || !session.isStudent) {
    redirect("/");
  }

  await connectDB();
  const user = await User.findById(session._id);
  if (!user) {
    redirect("/");
  }

  const solvent = await user.isSolvent();
  const equiposAsignados = await Equipment.countDocuments({
    assignedTo: user._id,
    status: "asignado",
  });

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
            <i className="fa fa-home"></i> Panel del Estudiante
          </h1>
        </div>
        <div className="card-body">
          <div className="alert alert-info">
            <i className="fas fa-info-circle"></i> Bienvenido,{" "}
            <strong>{session.name}</strong>.
            {user.dojo?.name && (
              <> Dojo: <strong>{user.dojo.name}</strong></>
            )}
          </div>

          {!solvent && (
            <div className="alert alert-warning">
              <i className="fas fa-exclamation-triangle"></i>{" "}
              <strong>Mensualidad pendiente.</strong> Por favor, ponte al día
              con tus pagos en la sección Finanzas.
            </div>
          )}

          {/* Stats Cards */}
          <div className="row mt-4">
            <div className="col-md-4 mb-3">
              <div className={`card text-white ${solvent ? "bg-success" : "bg-warning"}`}>
                <div className="card-body text-center">
                  <i className={`fas fa-${solvent ? "check-circle" : "clock"} fa-3x mb-2`}></i>
                  <h4 className="mb-0">
                    {solvent ? "AL DÍA" : "PENDIENTE"}
                  </h4>
                  <p className="mb-0">Estado de Pago</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-white bg-info">
                <div className="card-body text-center">
                  <i className="fas fa-box-open fa-3x mb-2"></i>
                  <h3 className="mb-0">{equiposAsignados}</h3>
                  <p className="mb-0">Equipos Asignados</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-white bg-secondary">
                <div className="card-body text-center">
                  <i className="fas fa-graduation-cap fa-3x mb-2"></i>
                  <h4 className="mb-0">{user.grade?.name ?? "N/A"}</h4>
                  <p className="mb-0">Grado Actual</p>
                </div>
              </div>
            </div>
          </div>

          {/* Perfil rápido */}
          <div className="row mt-3">
            <div className="col-md-12">
              <div className="card border-info">
                <div className="card-body">
                  <h5><i className="fas fa-user text-info"></i> Información Personal</h5>
                  <table className="table table-sm mt-3">
                    <tbody>
                      <tr><td><strong>Nombre:</strong></td><td>{user.name}</td></tr>
                      <tr><td><strong>Email:</strong></td><td>{user.email}</td></tr>
                      <tr><td><strong>C.I.:</strong></td><td>{user.identification}</td></tr>
                      <tr><td><strong>Género:</strong></td><td>{user.gender ?? "—"}</td></tr>
                      <tr><td><strong>Altura / Peso:</strong></td><td>{user.height ?? "—"} cm / {user.weight ?? "—"} kg</td></tr>
                      <tr><td><strong>Dirección:</strong></td><td>{user.direccion ?? "—"}</td></tr>
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
