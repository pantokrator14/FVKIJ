import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Dojo from "@/models/Dojo";
import DynamicSidebar from "@/components/DynamicSidebar";
import DojoConfigForm from "./DojoConfigForm";

/**
 * Página de configuración del Dojo.
 * Réplica exacta del dojos/config.hbs original.
 */
export default async function DojoConfigPage() {
  const session = await getSession();

  if (!session || !session.isDojo) {
    redirect("/");
  }

  await connectDB();
  const dojo = await Dojo.findOne({ adminUser: session._id }).lean();

  if (!dojo) {
    redirect("/dojo/dashboard");
  }

  const serializedDojo = {
    _id: dojo._id.toString(),
    name: dojo.name,
    rif: dojo.rif,
    contactEmail: dojo.contactEmail,
    phone: dojo.phone ?? "",
    address: dojo.address ?? "",
    arts: dojo.arts as string[],
    foundationDate: dojo.foundationDate instanceof Date
      ? dojo.foundationDate.toISOString().substring(0, 10)
      : "",
  };

  return (
    <div className="row">
      <div className="col-sm-12 col-md-3 bg-dark">
        <div className="card-body">
          <DynamicSidebar user={session} />
        </div>
      </div>

      <div className="container mt-4">
        <h1 className="mb-4">
          <i className="fas fa-cog"></i> Configuración del Dojo
        </h1>

        <div className="card">
          <div className="card-body">
            <DojoConfigForm dojo={serializedDojo} />
          </div>
        </div>
      </div>
    </div>
  );
}
