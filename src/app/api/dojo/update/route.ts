import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Dojo from "@/models/Dojo";
import type { MartialArt } from "../../../../../types";

// PUT /api/dojo/update
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || session.role !== "dojo") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();
    const dojo = await Dojo.findOne({ adminUser: session._id });

    if (!dojo) {
      return NextResponse.json(
        { error: "Dojo no encontrado" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as {
      name?: string;
      rif?: string;
      arts?: string;
      contactEmail?: string;
      address?: string;
      phone?: string;
      foundationDate?: string;
    };

    const updateData: Record<string, unknown> = {};

    if (body.name) updateData.name = body.name;
    if (body.rif) updateData.rif = body.rif;
    if (body.arts) {
      updateData.arts = body.arts
        .split(",")
        .map((a) => a.trim())
        .filter((a): a is MartialArt =>
          ["kendo", "iaido", "jodo"].includes(a as MartialArt)
        );
    }
    if (body.contactEmail) updateData.contactEmail = body.contactEmail;
    if (body.address) updateData.address = body.address;
    if (body.phone) updateData.phone = body.phone;
    if (body.foundationDate)
      updateData.foundationDate = new Date(body.foundationDate);

    const updatedDojo = await Dojo.findByIdAndUpdate(dojo._id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ success: true, dojo: updatedDojo });
  } catch (error) {
    console.error("Error actualizando dojo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
