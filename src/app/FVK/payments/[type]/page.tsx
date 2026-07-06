import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import Dojo from "@/models/Dojo";
import DynamicSidebar from "@/components/DynamicSidebar";
import PaymentView from "@/components/PaymentView";

interface PageParams {
  params: Promise<{ type: string }>;
}

/**
 * Página de pagos para Administradores FVK.
 */
export default async function AdminPaymentsPage({ params }: PageParams) {
  const session = await getSession();

  if (!session || !session.isAdmin) {
    redirect("/");
  }

  const { type } = await params;
  if (type !== "ingresos" && type !== "egresos") {
    redirect("/FVK/dashboard");
  }

  const paymentType = type === "ingresos" ? "ingreso" : "egreso";

  await connectDB();

  const paymentDocs = await Payment.find({
    type: paymentType,
    toModel: "FVK",
  })
    .populate("from to")
    .sort({ date: -1 })
    .lean();

  const dojoDocs = await Dojo.find().select("name").lean();

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

  const serializedDojos = JSON.parse(JSON.stringify(dojoDocs)).map(
    (d: Record<string, unknown>) => ({
      _id: String(d._id ?? ""),
      name: String(d.name ?? ""),
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
          dojos={serializedDojos}
        />
      </div>
    </div>
  );
}
