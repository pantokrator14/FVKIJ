import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Equipment from "@/models/Equipment";
import User from "@/models/User";
import { sendEmail, equipmentAssignedEmail } from "@/lib/email";
import type { EquipmentStatus } from "../../../../../../types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/admin/equipos/[id]/asignar
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as { kenshinId?: string };

    if (!body.kenshinId) {
      return NextResponse.json(
        { error: "ID del kenshin requerido" },
        { status: 400 }
      );
    }

    await connectDB();

    const kenshin = await User.findById(body.kenshinId);
    if (!kenshin) {
      return NextResponse.json(
        { error: "Kenshin no encontrado" },
        { status: 404 }
      );
    }

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      {
        assignedTo: kenshin._id,
        assignedBy: session._id,
        dateAssigned: new Date(),
        status: "asignado" as EquipmentStatus,
      },
      { new: true }
    );

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipo no encontrado" },
        { status: 404 }
      );
    }

    // ─── Email de notificación al kenshin ─────────────────────
    try {
      if (kenshin.email) {
        await sendEmail(
          kenshin.email,
          `Equipo asignado: ${equipment.type}`,
          equipmentAssignedEmail(
            kenshin.name,
            equipment.type,
            equipment.description ?? "—"
          )
        );
      }
    } catch {
      // Non-blocking
    }
    // ───────────────────────────────────────────────────────────

    return NextResponse.json({ success: true, equipment });
  } catch (error) {
    console.error("Error asignando equipo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/equipos/[id]
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

    const deleted = await Equipment.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Equipo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando equipo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/equipos/[id] — actualizar datos del equipo
export async function PATCH(
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

    const allowedFields = ["type", "description", "serialNumber", "notes"];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    await connectDB();

    const equipment = await Equipment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, equipment });
  } catch (error) {
    console.error("Error actualizando equipo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/equipos/[id] — liberar equipo (asignado → disponible)
export async function PUT(
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

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      {
        assignedTo: null,
        assignedBy: null,
        dateAssigned: null,
        status: "disponible" as EquipmentStatus,
      },
      { new: true }
    );

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, equipment });
  } catch (error) {
    console.error("Error liberando equipo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
