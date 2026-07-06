import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Dojo from "@/models/Dojo";
import { sendEmail, paymentCreatedEmail } from "@/lib/email";
import type { PaymentType, PaymentStatus } from "../../../../types";

// GET /api/payments?type=ingresos|egresos&page=1&limit=20
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");

    const type: PaymentType =
      typeParam === "ingresos" ? "ingreso" : "egreso";

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;

    await connectDB();

    const query: Record<string, unknown> = { type };

    // Filtros según el rol
    if (session.isAdmin) {
      query.toModel = "FVK";
    } else if (session.isDojo) {
      const dojo = await Dojo.findOne({ adminUser: session._id });
      if (dojo) {
        query.$or = [
          { from: dojo._id, fromModel: "Dojo" },
          { to: dojo._id, toModel: "Dojo" },
        ];
      }
    } else if (session.isStudent) {
      query.from = session._id;
      query.fromModel = "User";
    }

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("from to")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query),
    ]);

    // Datos adicionales para modales
    let dojos: Record<string, unknown>[] = [];
    let kenshins: Record<string, unknown>[] = [];

    if (session.isAdmin) {
      dojos = await Dojo.find().select("name").lean();
    } else if (session.isDojo) {
      const dojo = await Dojo.findOne({ adminUser: session._id });
      if (dojo) {
        kenshins = await User.find({ "dojo._id": dojo._id })
          .select("name")
          .lean();
      }
    }

    return NextResponse.json({
      payments,
      dojos,
      kenshins,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo pagos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/payments
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = (await request.json()) as {
      type?: PaymentType;
      amount?: number;
      description?: string;
      to?: string;
      externalEntity?: string;
    };

    if (!body.type || !body.amount) {
      return NextResponse.json(
        { error: "Tipo y monto son requeridos" },
        { status: 400 }
      );
    }

    await connectDB();

    const newPayment = new Payment({
      type: body.type,
      amount: body.amount,
      description: body.description,
      status: "pendiente" as PaymentStatus,
      date: new Date(),
    });

    // Convertir string ID para asignación (Mongoose acepta strings en ObjectId fields)
    const toObjId = (id?: string): unknown => (id ? id : undefined);

    switch (session.role) {
      case "presidente":
      case "secretario":
      case "tesorero":
        if (body.type === "ingreso") {
          newPayment.toModel = "FVK";
            newPayment.from = toObjId(body.to) as typeof newPayment.from;
          newPayment.fromModel = "Dojo";
        } else {
          newPayment.fromModel = "FVK";
          if (body.externalEntity) {
            newPayment.to = undefined;
            newPayment.toModel = undefined;
            newPayment.externalEntity = body.externalEntity;
          } else if (body.to) {
            const isDojo = body.to.startsWith("dojo_");
            newPayment.toModel = isDojo ? "Dojo" : "User";
            newPayment.to = toObjId(body.to.replace("dojo_", "")) as typeof newPayment.to;
          }
        }
        break;

      case "dojo":
        {
          const dojo = await Dojo.findOne({ adminUser: session._id });
          if (!dojo) {
            return NextResponse.json(
              { error: "Dojo no encontrado" },
              { status: 404 }
            );
          }

          if (body.type === "ingreso") {
            newPayment.toModel = "Dojo";
            newPayment.to = dojo._id as unknown as typeof newPayment.to;
            newPayment.fromModel = "User";
            newPayment.from = toObjId(body.to) as typeof newPayment.from;
          } else {
            newPayment.fromModel = "Dojo";
            newPayment.from = dojo._id as unknown as typeof newPayment.from;
            if (body.to === "FVK") {
              newPayment.toModel = "FVK";
            } else {
              newPayment.to = undefined;
              newPayment.toModel = undefined;
              newPayment.externalEntity = body.externalEntity;
            }
          }
        }
        break;

      case "kenshin":
        {
          const user = await User.findById(session._id);
          if (!user?.dojo?._id) {
            return NextResponse.json(
              { error: "No tienes un dojo asignado" },
              { status: 400 }
            );
          }
          newPayment.type = "egreso";
          newPayment.fromModel = "User";
          newPayment.from = user._id as unknown as typeof newPayment.from;
          newPayment.toModel = "Dojo";
          newPayment.to = user.dojo._id as unknown as typeof newPayment.to;
        }
        break;

      default:
        return NextResponse.json(
          { error: "Rol no válido para registrar pagos" },
          { status: 403 }
        );
    }

    await newPayment.save();

    // ─── Email de notificación ──────────────────────────────────
    try {
      let emailUser: string | undefined;
      let emailAddress: string | undefined;
      let targetName = "—";

      if (newPayment.type === "ingreso") {
        // Notificar al que recibe (FVK, Dojo, o User)
        if (session.isAdmin) {
          // Para ingreso de FVK, notificar al dojo que pagó
          if (newPayment.fromModel === "Dojo" && newPayment.from) {
            const fromDojo = await Dojo.findById(newPayment.from);
            if (fromDojo?.adminUser) {
              const adminUser = await User.findById(fromDojo.adminUser);
              emailAddress = adminUser?.email;
              emailUser = adminUser?.name;
              targetName = "FVK - Cuota de Dojo";
            }
          }
        } else if (session.isDojo) {
          // Para ingreso de Dojo, notificar al estudiante que pagó
          if (newPayment.fromModel === "User" && newPayment.from) {
            const user = await User.findById(newPayment.from);
            emailAddress = user?.email;
            emailUser = user?.name;
            targetName = (await Dojo.findOne({ adminUser: session._id }))?.name ?? "Dojo";
          }
        }
      } else {
        // Egreso: notificar al afectado
        if (session.isAdmin && newPayment.toModel === "Dojo" && newPayment.to) {
          const toDojo = await Dojo.findById(newPayment.to);
          if (toDojo?.adminUser) {
            const adminUser = await User.findById(toDojo.adminUser);
            emailAddress = adminUser?.email;
            emailUser = adminUser?.name;
          }
        }
      }

      if (emailAddress && emailUser) {
        await sendEmail(
          emailAddress,
          `Nuevo pago registrado - $${newPayment.amount.toFixed(2)}`,
          paymentCreatedEmail(
            emailUser,
            newPayment.amount,
            newPayment.description ?? "Sin concepto",
            newPayment.type,
            targetName
          )
        );
      }
    } catch {
      // Email errors are non-blocking
    }
    // ────────────────────────────────────────────────────────────

    return NextResponse.json({ success: true, payment: newPayment });
  } catch (error) {
    console.error("Error creando pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
