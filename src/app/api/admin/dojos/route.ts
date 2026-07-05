import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Dojo from "@/models/Dojo";

// GET /api/admin/dojos?pending=true
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pending = searchParams.get("pending") === "true";

    await connectDB();
    const filter: Record<string, unknown> = {};
    if (pending) {
      filter.active = false;
    }

    // Paginación
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const skip = (page - 1) * limit;

    const [dojos, total] = await Promise.all([
      Dojo.find(filter).populate("adminUser").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Dojo.countDocuments(filter),
    ]);

    // Calcular solvencia para cada dojo
    const dojosWithSolvency = await Promise.all(
      dojos.map(async (dojo) => {
        const isSolvent = await dojo.isSolvent();
        return {
          ...dojo.toObject(),
          isSolvent,
        };
      })
    );

    return NextResponse.json({
      dojos: dojosWithSolvency,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo dojos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
