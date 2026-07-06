import mongoose, { Schema } from "mongoose";
import Payment from "./Payment";
import type { IDojo, IDojoMethods, DojoModel, MartialArt } from "../../types";

const dojoSchema = new Schema<IDojo, DojoModel, IDojoMethods>(
  {
    name: { type: String, required: true },
    rif: { type: String, required: true, unique: true },
    foundationDate: { type: Date, required: true },
    active: { type: Boolean, default: false },
    arts: [{ type: String, required: true }],
    contactEmail: { type: String, required: true },
    address: { type: String },
    phone: { type: String },
    adminUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Verificar si el dojo está solvente
dojoSchema.methods.isSolvent = async function (): Promise<boolean> {
  const today = new Date();
  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const payment = await Payment.findOne({
    status: "confirmado",
    date: { $gte: firstDayOfMonth, $lte: today },
    $or: [
      {
        toModel: "Dojo",
        to: this._id,
        type: "ingreso",
      },
      {
        fromModel: "Dojo",
        from: this._id,
        type: "egreso",
        externalEntity: "FVK",
      },
    ],
  });

  return payment !== null;
};

// Índices para queries frecuentes
dojoSchema.index({ adminUser: 1 });

const Dojo = mongoose.models.Dojo
  ? (mongoose.models.Dojo as DojoModel)
  : mongoose.model<IDojo, DojoModel>("Dojo", dojoSchema);

export default Dojo;
export type { MartialArt };
