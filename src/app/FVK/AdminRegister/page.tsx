import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DynamicSidebar from "@/components/DynamicSidebar";
import AdminRegisterForm from "./AdminRegisterForm";

/**
 * Página de registro de Administradores.
 * Solo accesible para el presidente.
 */
export default async function AdminRegisterPage() {
  const session = await getSession();

  if (!session || session.role !== "presidente") {
    redirect("/FVK/dashboard");
  }

  return (
    <div className="row">
      <div className="col-md-3 bg-dark">
        <div className="card-body">
          <DynamicSidebar user={session} />
        </div>
      </div>
      <div className="col-md-9">
        <div className="container mt-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">
                <i className="fas fa-user-shield"></i> Registrar Administrador
              </h2>
            </div>
            <div className="card-body">
              <AdminRegisterForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
