import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import DynamicSidebar from "@/components/DynamicSidebar";
import PaymentView from "@/components/PaymentView";

interface PageParams {
  params: Promise<{ type: string }>;
}

/**
 * Página de pagos para estudiantes (kenshin).
 */
export default async function StudentPaymentsPage({ params }: PageParams) {
  const session = await getSession();

  if (!session || !session.isStudent) {
    redirect("/");
  }

  const { type } = await params;
  if (type !== "ingresos" && type !== "egresos") {
    redirect("/student/dashboard");
  }

  const paymentType = type === "ingresos" ? "ingreso" : "egreso";

  await connectDB();

  const paymentDocs = await Payment.find({
    type: paymentType,
    from: session._id,
    fromModel: "User",
  })
    .populate("from to")
    .sort({ date: -1 })
    .lean();

  // Serializar a JSON plano para evitar problemas de tipos Mongoose
  const serializedPayments = JSON.parse(JSON.stringify(paymentDocs)).map(
    (p: Record<string, unknown>) => ({
      _id: String(p._id ?? ""),
      type: String(p.type ?? ""),
      amount: Number(p.amount ?? 0),
      description: p.description as string | undefined,
      status: String(p.status ?? ""),
      from: p.from
        ? {
            _id: String((p.from as Record<string, unknown>)._id ?? ""),
            name: (p.from as Record<string, unknown>).name as string | undefined,
          }
        : undefined,
      to: p.to
        ? {
            _id: String((p.to as Record<string, unknown>)._id ?? ""),
            name: (p.to as Record<string, unknown>).name as string | undefined,
          }
        : undefined,
      date: String((p.date ?? new Date()).toString()),
    })
  );

  return (
    <div className="row">
      <div className="col-sm-12 col-md-3 bg-dark">
        <div className="card-body">
          <DynamicSidebar user={session} />
        </div>
      </div>

      <div className="col-sm-12 col-md-9">
        <PaymentView
          payments={serializedPayments}
          type={type as "ingresos" | "egresos"}
          user={session}
        />
      </div>
    </div>
  );
}
