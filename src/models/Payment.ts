import mongoose, { Schema } from "mongoose";
import type { IPayment, PaymentDocument } from "../../types";

const paymentSchema = new Schema<IPayment>(
  {
    type: {
      type: String,
      enum: ["ingreso", "egreso"] as const,
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pendiente", "confirmado", "cancelado"] as const,
      default: "pendiente",
    },
    from: { type: mongoose.Schema.Types.ObjectId, refPath: "fromModel" },
    fromModel: { type: String, enum: ["User", "Dojo", "FVK"] },
    to: { type: mongoose.Schema.Types.ObjectId, refPath: "toModel" },
    toModel: { type: String, enum: ["User", "Dojo", "FVK"] },
    externalEntity: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Índices compuestos para queries frecuentes de pagos
paymentSchema.index({ from: 1, fromModel: 1 });
paymentSchema.index({ to: 1, toModel: 1 });
paymentSchema.index({ status: 1, type: 1 });

const Payment = mongoose.models.Payment
  ? (mongoose.models.Payment as mongoose.Model<IPayment>)
  : mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
export type { PaymentDocument };
