import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Dojo from "@/models/Dojo";
import User from "@/models/User";
import { sendEmail, newDojoEmail } from "@/lib/email";
import type { MartialArt } from "../../../../../types";

// POST /api/admin/register-dojo
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      rif?: string;
      contactEmail?: string;
      phone?: string;
      address?: string;
      foundationDate?: string;
      arts?: string[];
      password?: string;
      confirmPassword?: string;
      contactPerson?: {
        name?: string;
        id?: string;
        email?: string;
        grade?: string;
      };
    };

    // Validaciones
    if (!body.name || !body.rif || !body.contactEmail || !body.password) {
      return NextResponse.json(
        { error: "Campos requeridos faltantes" },
        { status: 400 }
      );
    }

    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        { error: "Las contraseñas no coinciden" },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Validar datos del contacto
    if (!body.contactPerson?.name || !body.contactPerson?.email) {
      return NextResponse.json(
        { error: "Datos del contacto requeridos (nombre y email)" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verificar si el RIF ya existe
    const existingDojo = await Dojo.findOne({ rif: body.rif });
    if (existingDojo) {
      return NextResponse.json(
        { error: "El RIF ya está registrado" },
        { status: 409 }
      );
    }

    // Verificar si el email del contacto ya está en uso
    const existingUser = await User.findOne({
      email: body.contactPerson.email,
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "El email del contacto ya está registrado como usuario" },
        { status: 409 }
      );
    }

    const arts: MartialArt[] = (body.arts ?? ["kendo"]).filter((a): a is MartialArt =>
      ["kendo", "iaido", "jodo"].includes(a as MartialArt)
    );

    // 1. Crear el Dojo
    const newDojo = new Dojo({
      name: body.name,
      rif: body.rif,
      contactEmail: body.contactEmail,
      phone: body.phone,
      address: body.address,
      foundationDate: new Date(body.foundationDate ?? Date.now()),
      arts,
      active: false,
    });

    // 2. Crear el usuario administrador del dojo
    const adminUser = new User({
      name: body.contactPerson.name,
      email: body.contactPerson.email,
      identification: Number(body.contactPerson.id ?? "0"),
      password: body.password,
      role: "dojo",
      gender: "otro",
      height: 0,
      weight: 0,
      direccion: body.address ?? "",
      dojo: { name: body.name },
      grade: body.contactPerson.grade
        ? { name: body.contactPerson.grade }
        : undefined,
    });

    await adminUser.save();

    // 3. Vincular adminUser al dojo
    await Dojo.findByIdAndUpdate(newDojo._id, {
      $set: { adminUser: adminUser._id },
    });

    // ─── Email de notificación al admin del dojo ──────────────
    try {
      if (body.contactPerson.email) {
        await sendEmail(
          body.contactPerson.email,
          `Dojo ${newDojo.name} registrado — Pendiente de activación`,
          newDojoEmail(newDojo.name, body.contactPerson.name ?? "Admin", body.contactPerson.email)
        );
      }
    } catch {
      // Non-blocking
    }
    // ───────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      dojo: { _id: newDojo._id, name: newDojo.name },
      admin: { _id: adminUser._id, name: adminUser.name },
    });
  } catch (error) {
    console.error("Error registrando dojo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
