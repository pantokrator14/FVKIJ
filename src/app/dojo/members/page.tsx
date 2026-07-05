import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Dojo from "@/models/Dojo";
import DynamicSidebar from "@/components/DynamicSidebar";
import MembersClient from "./MembersClient";

/**
 * Página de miembros del Dojo con paginación.
 */
export default async function DojoMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();

  if (!session || !session.isDojo) {
    redirect("/");
  }

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  await connectDB();
  const dojo = await Dojo.findOne({ adminUser: session._id });

  if (!dojo) {
    redirect("/dojo/dashboard");
  }

  const query = { "dojo._id": dojo._id };
  const [members, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  const serializedMembers = members.map((m) => ({
    _id: m._id.toString(),
    name: m.name,
    identification: m.identification,
    email: m.email,
    grade: m.grade?.name ?? "N/A",
  }));

  const pagination = {
    page,
    pages: Math.ceil(total / limit),
    total,
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
          <i className="fas fa-users"></i> Miembros del Dojo
          <button
            className="btn btn-primary float-right"
            data-toggle="modal"
            data-target="#newMemberModal"
          >
            <i className="fas fa-user-plus"></i> Nuevo Estudiante
          </button>
        </h1>

        <MembersClient members={serializedMembers} pagination={pagination} />
      </div>
    </div>
  );
}
