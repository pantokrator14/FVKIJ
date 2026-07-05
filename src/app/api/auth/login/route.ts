import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { signToken } from "@/lib/auth";
import User from "@/models/User";
import type { UserRole } from "../../../../../types";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await connectDB();

    const body = (await request.json()) as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const tokenPayload = {
      _id: user._id.toString(),
      role: user.role as UserRole,
      name: user.name,
    };

    const token = signToken(tokenPayload);

    const cookieStore = await cookies();
    cookieStore.set("authorization", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 14400, // 4 horas
      path: "/",
    });

    // Redirección según rol
    const redirectPaths: Record<UserRole, string> = {
      secretario: "/FVK/dashboard",
      tesorero: "/FVK/dashboard",
      presidente: "/FVK/dashboard",
      dojo: "/dojo/dashboard",
      kenshin: "/student/dashboard",
    };

    return NextResponse.json({
      success: true,
      redirect: redirectPaths[user.role as UserRole] ?? "/",
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
