import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import Payment from "./Payment";
import type { IUser, IUserMethods, UserModel, UserDocument } from "../../types";

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true },
    identification: { type: Number, required: true },
    birthdate: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["secretario", "tesorero", "presidente", "dojo", "kenshin"],
      default: "kenshin",
    },
    grade: {
      _id: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String },
      obtainedAt: { type: Date },
    },
    gender: { type: String },
    height: { type: Number },
    weight: { type: Number },
    direccion: { type: String },
    dojo: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Dojo" },
      name: { type: String },
    },
  },
  { timestamps: true }
);

// Hash de contraseña antes de guardar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Comparación de contraseñas
userSchema.methods.matchPassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Verificación de solvencia mensual
userSchema.methods.isSolvent = async function (): Promise<boolean> {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (!this.dojo?._id) return false;

    const payment = await Payment.findOne({
      status: "confirmado",
      type: "ingreso",
      toModel: "Dojo",
      to: this.dojo._id,
      from: this._id,
      date: { $gte: firstDayOfMonth, $lte: today },
    });

    return payment !== null;
  } catch {
    return false;
  }
};

// Índices para queries frecuentes
userSchema.index({ "dojo._id": 1 });
userSchema.index({ role: 1 });

const User = mongoose.models.User
  ? (mongoose.models.User as UserModel)
  : mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
export type { UserDocument };
