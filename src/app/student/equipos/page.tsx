import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Equipment from "@/models/Equipment";
import DynamicSidebar from "@/components/DynamicSidebar";
import type { EquipmentDocument } from "../../../../types";

function formatDate(date: Date | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getEquipmentIcon(type: string): string {
  switch (type) {
    case "shinai":
      return "fa-sword";
    case "bogu":
      return "fa-shield-alt";
    case "iaito":
      return "fa-sword";
    case "uniforme":
      return "fa-tshirt";
    default:
      return "fa-box";
  }
}

/**
 * Lista de equipos asignados al estudiante.
 * Réplica exacta del kenshin/list.hbs original.
 */
export default async function StudentEquipmentPage() {
  const session = await getSession();

  if (!session || !session.isStudent) {
    redirect("/");
  }

  await connectDB();
  const equipments = await Equipment.find({
    assignedTo: session._id,
  }).lean();

  return (
    <div className="row">
      <div className="col-sm-12 col-md-3 bg-dark">
        <div className="card-body">
          <DynamicSidebar user={session} />
        </div>
      </div>

      <div className="col-sm-12 col-md-9 content">
        <h1 className="mb-4">
          <i className="fas fa-archive"></i> Mis Equipos Asignados
        </h1>

        <div className="row">
          {equipments.length > 0 ? (
            equipments.map((equipment) => {
              const eq = equipment as unknown as EquipmentDocument;
              return (
                <div className="col-md-4 mb-4" key={eq._id.toString()}>
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white">
                      <h5 className="card-title mb-0">
                        <i className={`fas ${getEquipmentIcon(eq.type)}`}></i>{" "}
                        {eq.type.charAt(0).toUpperCase() + eq.type.slice(1)}
                      </h5>
                    </div>
                    <div className="card-body">
                      <p className="card-text">{eq.description}</p>
                      <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                          <strong>N° Serie:</strong> {eq.serialNumber ?? "N/A"}
                        </li>
                        <li className="list-group-item">
                          <strong>Asignado el:</strong>{" "}
                          {formatDate(eq.dateAssigned)}
                        </li>
                        <li className="list-group-item">
                          <strong>Estado:</strong>{" "}
                          <span className="badge badge-primary">
                            Asignado
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12">
              <div className="alert alert-info">
                No tienes equipos asignados actualmente.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
