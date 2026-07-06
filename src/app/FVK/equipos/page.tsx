import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Equipment from "@/models/Equipment";
import User from "@/models/User";
import DynamicSidebar from "@/components/DynamicSidebar";
import EquipmentClient from "./EquipmentClient";

function formatDate(date: Date | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Página de gestión de Equipos (Admin).
 * Réplica exacta del admin/equipos.hbs original.
 */
export default async function EquipmentPage() {
  const session = await getSession();

  if (!session || !session.isAdmin) {
    redirect("/");
  }

  await connectDB();

  const equipments = await Equipment.find()
    .populate("assignedTo", "name")
    .sort({ createdAt: -1 })
    .lean();

  const kenshins = await User.find({ role: "kenshin" })
    .select("name dojo")
    .lean();

  const serializedEquipments = equipments.map((eq) => ({
    _id: eq._id.toString(),
    type: eq.type,
    description: eq.description,
    serialNumber: eq.serialNumber ?? "",
    status: eq.status,
    assignedTo: eq.assignedTo
      ? { name: (eq.assignedTo as unknown as { name: string }).name }
      : null,
    dateAssigned: formatDate(eq.dateAssigned),
    notes: eq.notes ?? "",
  }));

  const serializedKenshins = kenshins.map((k) => ({
    _id: k._id.toString(),
    name: k.name,
    dojo: k.dojo,
  }));

  return (
    <div className="row">
      <div className="col-sm-12 col-md-3 bg-dark">
        <div className="card-body">
          <DynamicSidebar user={session} />
        </div>
      </div>

      <div className="col-md-9 container mt-4">
        <h1 className="mb-4">
          <i className="fas fa-archive"></i> Gestión de Equipos
          <button
            className="btn btn-primary float-right"
            data-toggle="modal"
            data-target="#newEquipmentModal"
          >
            <i className="fas fa-plus"></i> Nuevo Equipo
          </button>
        </h1>

        <EquipmentClient
          equipments={serializedEquipments}
          kenshins={serializedKenshins}
        />
      </div>
    </div>
  );
}
