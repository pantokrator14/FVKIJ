import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Grade from "@/models/Grade";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/grados/[id]
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
    const body = (await request.json()) as {
      name?: string;
      rank?: number;
    };

    if (!body.name && body.rank === undefined) {
      return NextResponse.json(
        { error: "Nombre o rango requerido para actualizar" },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData: Record<string, unknown> = {};
    if (body.name) updateData.name = body.name;
    if (body.rank !== undefined) updateData.rank = body.rank;

    const grade = await Grade.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!grade) {
      return NextResponse.json({ error: "Grado no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, grade });
  } catch (error) {
    console.error("Error actualizando grado:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE /api/admin/grados/[id]
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

    const deleted = await Grade.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Grado no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando grado:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
