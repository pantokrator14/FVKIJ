import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Equipment from "@/models/Equipment";
import User from "@/models/User";
import type { EquipmentType, EquipmentStatus } from "../../../../../types";

// GET /api/admin/equipos?page=1&limit=20
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;

    await connectDB();
    const [equipments, total] = await Promise.all([
      Equipment.find()
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Equipment.countDocuments(),
    ]);

    const kenshins = await User.find({ role: "kenshin" })
      .select("name dojo")
      .populate("dojo._id", "name");

    return NextResponse.json({
      equipments,
      kenshins,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo equipos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/admin/equipos
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = (await request.json()) as {
      type?: EquipmentType;
      description?: string;
      serialNumber?: string;
    };

    if (!body.type || !body.description) {
      return NextResponse.json(
        { error: "Tipo y descripción son requeridos" },
        { status: 400 }
      );
    }

    await connectDB();

    const newEquipment = new Equipment({
      type: body.type,
      description: body.description,
      serialNumber: body.serialNumber,
      status: "disponible" as EquipmentStatus,
    });

    await newEquipment.save();

    return NextResponse.json({ success: true, equipment: newEquipment });
  } catch (error) {
    console.error("Error creando equipo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
