import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import Dojo from "@/models/Dojo";

// GET /api/admin/reports?from=2024-01-01&to=2024-12-31&dojoId=xxx&type=ingreso|egreso&page=1&limit=50
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const dojoId = searchParams.get("dojoId");
    const typeFilter = searchParams.get("type"); // "ingreso" | "egreso" | ""
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit")) || 50));
    const skip = (page - 1) * limit;

    await connectDB();

    // Construir filtro
    const query: Record<string, unknown> = {};

    // Filtro por tipo
    if (typeFilter === "ingreso" || typeFilter === "egreso") {
      query.type = typeFilter;
    }

    // Filtro por fecha
    const dateFilter: Record<string, Date> = {};
    if (from) {
      dateFilter.$gte = new Date(from);
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter.$lte = toDate;
    }
    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter;
    }

    // Filtro por dojo
    if (dojoId) {
      query.$or = [
        { from: dojoId, fromModel: "Dojo" },
        { to: dojoId, toModel: "Dojo" },
      ];
    }

    const [payments, total, totalsAgg] = await Promise.all([
      Payment.find(query)
        .populate("from to")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query),
      Payment.aggregate([
        { $match: query as Record<string, unknown> },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Totals by type
    const totalIngresos =
      totalsAgg.find((t: { _id: string; total: number }) => t._id === "ingreso")?.total ?? 0;
    const totalEgresos =
      totalsAgg.find((t: { _id: string; total: number }) => t._id === "egreso")?.total ?? 0;

    // Dojos list for filter dropdown
    const dojos = await Dojo.find().select("name").lean();

    return NextResponse.json({
      payments,
      dojos,
      totals: {
        ingresos: totalIngresos,
        egresos: totalEgresos,
        balance: totalIngresos - totalEgresos,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error generando reporte:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
