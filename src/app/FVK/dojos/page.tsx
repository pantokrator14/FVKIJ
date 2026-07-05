import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Dojo from "@/models/Dojo";
import DynamicSidebar from "@/components/DynamicSidebar";
import DojoListClient from "./DojoListClient";

function formatDate(date: Date | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface PaginationInfo {
  page: number;
  pages: number;
  total: number;
}

/**
 * Página de gestión de Dojos (Admin) con paginación.
 */
export default async function DojoListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();

  if (!session || !session.isAdmin) {
    redirect("/");
  }

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const limit = 25;
  const skip = (page - 1) * limit;

  await connectDB();

  const [dojos, total] = await Promise.all([
    Dojo.find()
      .populate("adminUser")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Dojo.countDocuments(),
  ]);

  const serializedDojos = await Promise.all(
    dojos.map(async (dojo) => {
      const dojoDoc = await Dojo.findById(dojo._id);
      const isSolvent = dojoDoc ? await dojoDoc.isSolvent() : false;

      return {
        _id: dojo._id.toString(),
        name: dojo.name,
        rif: dojo.rif,
        contactEmail: dojo.contactEmail,
        address: dojo.address ?? "",
        foundationDate: formatDate(dojo.foundationDate),
        arts: dojo.arts as string[],
        isSolvent,
      };
    })
  );

  const pagination: PaginationInfo = {
    page,
    pages: Math.ceil(total / limit),
    total,
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-3 bg-dark">
          <DynamicSidebar user={session} />
        </div>

        <div className="col-md-9">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="mb-0">
                  <i className="fas fa-school"></i> Gestión de Dojos
                </h2>
                <a
                  href="/FVK/DojoRegister"
                  className="btn btn-success"
                >
                  <i className="fas fa-plus-circle"></i> Nuevo Dojo
                </a>
              </div>
            </div>

            <div className="card-body">
              <DojoListClient dojos={serializedDojos} pagination={pagination} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
