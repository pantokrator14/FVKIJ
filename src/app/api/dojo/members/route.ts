import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Dojo from "@/models/Dojo";
import { sendEmail, newStudentEmail } from "@/lib/email";

// GET /api/dojo/members?page=1&limit=20
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || session.role !== "dojo") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;

    await connectDB();
    const dojo = await Dojo.findOne({ adminUser: session._id });

    if (!dojo) {
      return NextResponse.json(
        { error: "Dojo no encontrado" },
        { status: 404 }
      );
    }

    const query = { "dojo._id": dojo._id };
    const [members, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      members,
      dojo,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo miembros:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/dojo/members
export async function POST(request: NextRequest): Promise<NextResponse> {
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
      identification?: string;
      email?: string;
      password?: string;
      birthdate?: string;
      gender?: string;
      height?: number;
      weight?: number;
      address?: string;
      grade?: string;
    };

    if (!body.name || !body.email || !body.password || !body.identification) {
      return NextResponse.json(
        { error: "Campos requeridos faltantes" },
        { status: 400 }
      );
    }

    const identificationNum = Number(body.identification);
    if (Number.isNaN(identificationNum) || identificationNum <= 0) {
      return NextResponse.json(
        { error: "La identificación debe ser un número válido" },
        { status: 400 }
      );
    }

    const newUser = new User({
      name: body.name,
      identification: identificationNum,
      email: body.email,
      password: body.password,
      birthdate: new Date(body.birthdate ?? Date.now()),
      gender: body.gender ?? "otro",
      height: body.height ?? 0,
      weight: body.weight ?? 0,
      direccion: body.address ?? "",
      grade: {
        name: body.grade ?? "6to kyu",
        obtainedAt: new Date(),
      },
      role: "kenshin",
      dojo: {
        _id: dojo._id,
        name: dojo.name,
      },
    });

    await newUser.save();

    // ─── Email de bienvenida al nuevo estudiante ──────────────
    try {
      if (body.email) {
        await sendEmail(
          body.email,
          "Bienvenido a la FVK — Credenciales de acceso",
          newStudentEmail(
            body.name ?? "Estudiante",
            body.email,
            body.password ?? "",
            dojo.name
          )
        );
      }
    } catch {
      // Non-blocking
    }
    // ───────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      member: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error creando miembro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
