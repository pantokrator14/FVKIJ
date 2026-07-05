import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Verifica que la sesión tenga permiso para acceder al perfil de un estudiante.
 * - El propio estudiante (dueño del perfil)
 * - Un dojo admin (cuyo dojo coincida con el del estudiante)
 * - Un admin FVK (presidente, secretario)
 */
async function checkProfileAccess(
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>,
  studentId: string
): Promise<{ allowed: boolean; error?: NextResponse }> {
  // Caso 1: el propio estudiante
  if (session._id === studentId) {
    return { allowed: true };
  }

  // Caso 2: admin FVK puede ver todos los perfiles
  if (session.isAdmin) {
    return { allowed: true };
  }

  // Caso 3: dojo admin puede ver estudiantes de su dojo
  if (session.isDojo && session.dojo?._id) {
    await connectDB();
    const student = await User.findById(studentId).select("dojo");
    if (student?.dojo?._id?.toString() === session.dojo._id) {
      return { allowed: true };
    }
  }

  return {
    allowed: false,
    error: NextResponse.json(
      { error: "No tienes permiso para acceder a este perfil" },
      { status: 403 }
    ),
  };
}

/**
 * Determina si un usuario puede EDITAR el perfil de un estudiante.
 * - El propio estudiante
 * - Un dojo admin (estudiantes de su dojo)
 * - Solo presidente entre los admins FVK (secretario no debería editar datos personales)
 */
async function checkProfileWriteAccess(
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>,
  studentId: string
): Promise<{ allowed: boolean; error?: NextResponse }> {
  // El propio estudiante siempre puede editar su perfil
  if (session._id === studentId) {
    return { allowed: true };
  }

  // Presidente puede editar cualquier perfil
  if (session.role === "presidente") {
    return { allowed: true };
  }

  // Dojo admin puede editar estudiantes de su dojo
  if (session.isDojo && session.dojo?._id) {
    await connectDB();
    const student = await User.findById(studentId).select("dojo");
    if (student?.dojo?._id?.toString() === session.dojo._id) {
      return { allowed: true };
    }
  }

  return {
    allowed: false,
    error: NextResponse.json(
      { error: "No tienes permiso para editar este perfil" },
      { status: 403 }
    ),
  };
}

// GET /api/kenshin/profile/[id]
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar permiso de lectura
    const access = await checkProfileAccess(session, id);
    if (!access.allowed) {
      return access.error!;
    }

    await connectDB();

    const student = await User.findById(id).select("-password");

    if (!student) {
      return NextResponse.json(
        { error: "Estudiante no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/kenshin/profile/[id]
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar permiso de escritura
    const access = await checkProfileWriteAccess(session, id);
    if (!access.allowed) {
      return access.error!;
    }

    const body = (await request.json()) as Record<string, unknown>;

    // No permitir cambiar role, password o email por esta vía
    const allowedFields = [
      "name",
      "identification",
      "birthdate",
      "gender",
      "height",
      "weight",
      "direccion",
      "grade",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    await connectDB();
    const updated = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updated) {
      return NextResponse.json(
        { error: "Estudiante no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student: updated,
    });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
