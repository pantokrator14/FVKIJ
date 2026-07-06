import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Dojo from "@/models/Dojo";
import Payment from "@/models/Payment";
import Equipment from "@/models/Equipment";
import DynamicSidebar from "@/components/DynamicSidebar";

function getRoleTitle(session: {
  permissions: { administrativo: boolean; finanzas: boolean };
}): string {
  if (session.permissions.administrativo && session.permissions.finanzas)
    return "Presidente";
  if (session.permissions.administrativo) return "Secretario";
  if (session.permissions.finanzas) return "Tesorero";
  return "Administrador";
}

/**
 * Dashboard de Administración FVK con estadísticas en tiempo real.
 */
export default async function FVKDashboardPage() {
  const session = await getSession();

  if (!session || !session.isAdmin) {
    redirect("/");
  }

  await connectDB();

  // Estadísticas paralelas
  const [totalDojos, totalKenshins, payments, totalEquipos] =
    await Promise.all([
      Dojo.countDocuments(),
      User.countDocuments({ role: "kenshin" }),
      Payment.find({ status: "confirmado" }).select("amount type date"),
      Equipment.countDocuments(),
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

  const dojosPendientes = await Dojo.countDocuments({ active: false });
  const equiposAsignados = await Equipment.countDocuments({ status: "asignado" });

  const roleTitle = getRoleTitle(session);

  return (
    <div className="row">
      <div className="col-sm-12 col-md-3 bg-dark">
        <div className="card-body">
          <DynamicSidebar user={session} />
        </div>
      </div>

      <div className="col-sm-12 col-md-9 content d-flex flex-column p-0">
        {/* Hero Section */}
        <div className="dashboard-hero">
          <div className="dashboard-hero-overlay"></div>
          <div className="dashboard-hero-content">
            <img
              src="/img/FVK.png"
              width={90}
              height={90}
              alt="Logo FVK"
              className="mb-3"
            />
            <h2 className="dashboard-hero-title">
              Panel de Administración FVK
            </h2>
            <p className="dashboard-hero-welcome">
              Bienvenido,{" "}
              <strong>
                {session.name} — {roleTitle}
              </strong>
            </p>
          </div>
        </div>

        {/* Cards de Estadísticas — con su estilo original */}
        <div className="dashboard-cards">
          <div className="row d-flex align-items-stretch">
            {/* Dojos: registrados + pendientes */}
            <div className="col-md-3 mb-3 d-flex">
              <div className="card text-white bg-danger w-100 shadow-sm">
                <div className="card-body text-center d-flex flex-column align-items-center justify-content-center py-3">
                  <i className="fas fa-address-card fa-3x mb-2"></i>
                  <h3 className="mb-0">{totalDojos}</h3>
                  <p className="mb-0">Dojos Registrados</p>
                  <small className="text-white-50">
                    {dojosPendientes} pendientes
                  </small>
                </div>
              </div>
            </div>
            {/* Estudiantes */}
            <div className="col-md-3 mb-3 d-flex">
              <div className="card text-white bg-primary w-100 shadow-sm">
                <div className="card-body text-center d-flex flex-column align-items-center justify-content-center py-3">
                  <i className="fas fa-users fa-3x mb-2"></i>
                  <h3 className="mb-0">{totalKenshins}</h3>
                  <p className="mb-0">Estudiantes</p>
                </div>
              </div>
            </div>
            {/* Finanzas: ingresos + egresos */}
            <div className="col-md-3 mb-3 d-flex">
              <div className="card text-white bg-success w-100 shadow-sm">
                <div className="card-body text-center d-flex flex-column align-items-center justify-content-center py-3">
                  <i className="fas fa-piggy-bank fa-3x mb-2"></i>
                  <h3 className="mb-0">${ingresosMes.toFixed(2)}</h3>
                  <p className="mb-0">Ingresos del Mes</p>
                  <small className="text-white-50">
                    ${egresosMes.toFixed(2)} egresos
                  </small>
                </div>
              </div>
            </div>
            {/* Equipos: inventario + asignados */}
            <div className="col-md-3 mb-3 d-flex">
              <div className="card text-white bg-warning w-100 shadow-sm">
                <div className="card-body text-center d-flex flex-column align-items-center justify-content-center py-3">
                  <i className="fas fa-box-open fa-3x mb-2"></i>
                  <h3 className="mb-0">{totalEquipos}</h3>
                  <p className="mb-0">En Inventario</p>
                  <small className="text-white-50">
                    {equiposAsignados} asignados
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
