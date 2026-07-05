import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Grade from "@/models/Grade";

// GET /api/admin/grados
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();
    const grades = await Grade.find().sort({ rank: 1 });
    return NextResponse.json({ grades });
  } catch (error) {
    console.error("Error obteniendo grados:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST /api/admin/grados
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      rank?: number;
    };

    if (!body.name || body.rank === undefined) {
      return NextResponse.json(
        { error: "Nombre y rango son requeridos" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Grade.findOne({ name: body.name });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un grado con ese nombre" },
        { status: 409 }
      );
    }

    const grade = new Grade({ name: body.name, rank: body.rank });
    await grade.save();

    return NextResponse.json({ success: true, grade });
  } catch (error) {
    console.error("Error creando grado:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
