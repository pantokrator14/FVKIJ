import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import Dojo from "@/models/Dojo";
import User from "@/models/User";
import DynamicSidebar from "@/components/DynamicSidebar";
import PaymentView from "@/components/PaymentView";

interface PageParams {
  params: Promise<{ type: string }>;
}

/**
 * Página de pagos para Dojos.
 */
export default async function DojoPaymentsPage({ params }: PageParams) {
  const session = await getSession();

  if (!session || !session.isDojo) {
    redirect("/");
  }

  const { type } = await params;
  if (type !== "ingresos" && type !== "egresos") {
    redirect("/dojo/dashboard");
  }

  const paymentType = type === "ingresos" ? "ingreso" : "egreso";

  await connectDB();
  const dojo = await Dojo.findOne({ adminUser: session._id });

  if (!dojo) {
    redirect("/dojo/dashboard");
  }

  const paymentDocs = await Payment.find({
    type: paymentType,
    $or: [
      { from: dojo._id, fromModel: "Dojo" },
      { to: dojo._id, toModel: "Dojo" },
    ],
  })
    .populate("from to")
    .sort({ date: -1 })
    .lean();

  const kenshinDocs = await User.find({ "dojo._id": dojo._id })
    .select("name")
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

  const serializedKenshins = JSON.parse(JSON.stringify(kenshinDocs)).map(
    (k: Record<string, unknown>) => ({
      _id: String(k._id ?? ""),
      name: String(k.name ?? ""),
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
          kenshins={serializedKenshins}
        />
      </div>
    </div>
  );
}
