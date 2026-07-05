import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/kenshin/profile/[id]/password
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Solo el propio usuario puede cambiar su contraseña
    if (session._id !== id) {
      return NextResponse.json({ error: "No puedes cambiar la contraseña de otro usuario" }, { status: 403 });
    }

    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    if (!body.currentPassword || !body.newPassword || !body.confirmPassword) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (body.newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    if (body.newPassword !== body.confirmPassword) {
      return NextResponse.json(
        { error: "Las contraseñas nuevas no coinciden" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const isMatch = await user.matchPassword(body.currentPassword);
    if (!isMatch) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta" },
        { status: 400 }
      );
    }

    user.password = body.newPassword;
    await user.save();

    return NextResponse.json({ success: true, message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
