import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import DynamicSidebar from "@/components/DynamicSidebar";
import ProfileForm from "./ProfileForm";

interface PageParams {
  params: Promise<{ id: string }>;
}

/**
 * Página de perfil del estudiante.
 * Réplica exacta del kenshin/profile.hbs original.
 */
export default async function StudentProfilePage({ params }: PageParams) {
  const session = await getSession();

  if (!session || !session.isStudent) {
    redirect("/");
  }

  const { id } = await params;
  await connectDB();

  const student = await User.findById(id).select("-password");

  if (!student) {
    notFound();
  }

  const serialized = {
    _id: student._id.toString(),
    name: student.name,
    identification: student.identification,
    email: student.email,
    birthdate: student.birthdate instanceof Date 
      ? student.birthdate.toISOString().substring(0, 10) 
      : "",
    gender: student.gender,
    height: student.height,
    weight: student.weight,
    direccion: student.direccion,
    grade: student.grade?.name ?? "",
  };

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
            <i className="fas fa-cog"></i> Configuracion
          </h1>
        </div>
        <div className="card-body">
          <ProfileForm student={serialized} />
        </div>
      </div>
    </div>
  );
}
