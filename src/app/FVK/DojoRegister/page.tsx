import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DynamicSidebar from "@/components/DynamicSidebar";
import DojoRegisterForm from "./DojoRegisterForm";

/**
 * Página de registro de Dojos (Admin).
 * Réplica exacta del admin/register.hbs original.
 */
export default async function DojoRegisterPage() {
  const session = await getSession();

  if (!session || !session.isAdmin) {
    redirect("/");
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
                <i className="fas fa-school"></i> Registrar Nuevo Dojo
              </h2>
            </div>
            <div className="card-body">
              <DojoRegisterForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
