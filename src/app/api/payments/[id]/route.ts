import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Dojo from "@/models/Dojo";
import { sendEmail, paymentCreatedEmail } from "@/lib/email";
import type { PaymentStatus } from "../../../../../types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/payments/[id]/confirmar
// POST /api/payments/[id]/cancelar
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (!action || !["confirmar", "cancelar"].includes(action)) {
      return NextResponse.json(
        { error: "Acción no válida. Use 'confirmar' o 'cancelar'" },
        { status: 400 }
      );
    }

    const status: PaymentStatus =
      action === "confirmar" ? "confirmado" : "cancelado";

    await connectDB();

    const payment = await Payment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!payment) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    // ─── Email de notificación al confirmar pago ──────────────
    if (payment.status === "confirmado") {
      try {
        let emailAddress: string | undefined;
        let emailUser: string | undefined;
        let targetName = "—";

        if (payment.fromModel === "User" && payment.from) {
          const user = await User.findById(payment.from);
          emailAddress = user?.email;
          emailUser = user?.name;
          if (payment.toModel === "Dojo" && payment.to) {
            const d = await Dojo.findById(payment.to);
            targetName = d?.name ?? "Dojo";
          } else {
            targetName = payment.toModel ?? "FVK";
          }
        } else if (payment.fromModel === "Dojo" && payment.from) {
          const d = await Dojo.findById(payment.from);
          if (d?.adminUser) {
            const adminUser = await User.findById(d.adminUser);
            emailAddress = adminUser?.email;
            emailUser = adminUser?.name;
          }
          targetName = "FVK";
        }

        if (emailAddress && emailUser) {
          await sendEmail(
            emailAddress,
            `Pago confirmado - $${payment.amount.toFixed(2)}`,
            paymentCreatedEmail(
              emailUser,
              payment.amount,
              payment.description ?? "Sin concepto",
              payment.type,
              targetName
            )
          );
        }
      } catch {
        // Non-blocking
      }
    }
    // ───────────────────────────────────────────────────────────

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error("Error actualizando pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
