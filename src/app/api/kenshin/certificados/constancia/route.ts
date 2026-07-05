import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { renderStudyCertificateHtml } from "@/lib/certificados";

// GET /api/kenshin/certificados/constancia
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.isStudent) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session._id);
    if (!user) {
      return new NextResponse("Usuario no encontrado", { status: 404 });
    }

    const grade = user.grade?.name ?? "N/A";
    const dojo = user.dojo?.name ?? "No asignado";
    const today = new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const html = renderStudyCertificateHtml(
      user.name,
      user.identification,
      dojo,
      grade,
      today
    );

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error generando constancia:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
