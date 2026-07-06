import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import type { AdminType, UserRole } from "../../../../../types";

/**
 * POST /api/admin/register-admin
 * Registra un nuevo administrador (secretario, tesorero o presidente).
 * Solo el presidente puede crear administradores.
 * Los admins se almacenan como Users con el rol correspondiente.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || session.role !== "presidente") {
      return NextResponse.json(
        { error: "Solo el presidente puede registrar administradores" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      email?: string;
      password?: string;
      adminType?: AdminType;
      name?: string;
    };

    if (!body.email || !body.password || !body.adminType) {
      return NextResponse.json(
        { error: "Email, contraseña y tipo de administrador son requeridos" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verificar si el email ya existe en Users
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      );
    }

    // Mapear adminType a role de User
    const roleMap: Record<AdminType, UserRole> = {
      presidente: "presidente",
      secretario: "secretario",
      tesorero: "tesorero",
    };

    const newAdmin = new User({
      name: body.name ?? `Administrador ${body.adminType}`,
      identification: 0,
      birthdate: new Date("2000-01-01"),
      email: body.email,
      password: body.password,
      role: roleMap[body.adminType],
      gender: "otro",
      height: 0,
      weight: 0,
      direccion: "Sede FVK",
    });

    await newAdmin.save();

    return NextResponse.json({
      success: true,
      admin: {
        _id: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error("Error registrando admin:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
