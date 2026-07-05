import mongoose, { Schema } from "mongoose";
import type { IEquipment, EquipmentStatus, EquipmentType } from "../../types";

const equipmentSchema = new Schema<IEquipment>(
  {
    type: {
      type: String,
      required: true,
      enum: ["shinai", "bokken", "iaito", "bogu", "uniforme", "otros"] as const,
    },
    description: { type: String, required: true },
    serialNumber: { type: String, unique: true, sparse: true },
    status: {
      type: String,
      enum: ["disponible", "asignado", "en_reparacion", "baja"] as const,
      default: "disponible",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dateAssigned: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

const Equipment = mongoose.models.Equipment
  ? (mongoose.models.Equipment as mongoose.Model<IEquipment>)
  : mongoose.model<IEquipment>("Equipment", equipmentSchema);

export default Equipment;
export type { EquipmentStatus, EquipmentType };
