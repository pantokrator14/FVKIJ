import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import User from "@/models/User";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/payments/user/[id]?page=1&limit=20
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;

    // Verificar permisos: el propio usuario, admin del dojo, o admin FVK
    if (session._id !== id && !session.isAdmin && !session.isDojo) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Si es dojo admin, verificar que el usuario pertenezca a su dojo
    if (session.isDojo) {
      const targetUser = await User.findById(id).select("dojo");
      const { default: Dojo } = await import("@/models/Dojo");
      const dojo = await Dojo.findOne({ adminUser: session._id });
      if (!dojo || !targetUser?.dojo?._id || targetUser.dojo._id.toString() !== dojo._id.toString()) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
    }

    await connectDB();

    const query = {
      $or: [
        { from: id, fromModel: "User" },
        { to: id, toModel: "User" },
      ],
    };

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("from to")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo historial de pagos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
