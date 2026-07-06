import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Dojo from "@/models/Dojo";
import User from "@/models/User";
import { sendEmail, accountVerifiedEmail } from "@/lib/email";
import type { MartialArt } from "../../../../../../types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/dojos/[id]
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const dojo = await Dojo.findById(id);

    if (!dojo) {
      return NextResponse.json(
        { error: "Dojo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ dojo });
  } catch (error) {
    console.error("Error obteniendo dojo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/dojos/[id]
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    // Validar campos permitidos para actualización
    const allowedFields = [
      "name",
      "rif",
      "foundationDate",
      "active",
      "arts",
      "contactEmail",
      "address",
      "phone",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    await connectDB();

    const updatedDojo = await Dojo.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedDojo) {
      return NextResponse.json(
        { error: "Dojo no encontrado" },
        { status: 404 }
      );
    }

    // ─── Email de activación si se cambió active a true ─────
    if (body.active === true && updatedDojo.adminUser) {
      try {
        const adminUser = await User.findById(updatedDojo.adminUser);
        if (adminUser?.email) {
          await sendEmail(
            adminUser.email,
            `Dojo ${updatedDojo.name} activado — ¡Bienvenido!`,
            accountVerifiedEmail(adminUser.name, updatedDojo.name)
          );
        }
      } catch {
        // Non-blocking
      }
    }
    // ───────────────────────────────────────────────────────────

    return NextResponse.json({ success: true, dojo: updatedDojo });
  } catch (error) {
    console.error("Error actualizando dojo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/dojos/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const deleted = await Dojo.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Dojo no encontrado" },
        { status: 404 }
      );
    }

    // Limpiar usuarios huérfanos: estudiantes y admin del dojo eliminado
    await Promise.all([
      // Quitar referencia del dojo a todos los estudiantes que pertenecían a él
      User.updateMany(
        { "dojo._id": id },
        { $unset: { dojo: "" } }
      ),
      // Eliminar el usuario administrador del dojo (role: "dojo")
      User.findByIdAndDelete(deleted.adminUser),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando dojo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
