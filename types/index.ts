// ============================================================
// Tipos compartidos para todo el sistema FVK
// Sin ningún `any` — TypeScript strict mode
// ============================================================

import type { Document, Model, ObjectId } from "mongoose";

// ─── Roles del sistema ───────────────────────────────────────
export type UserRole = "secretario" | "tesorero" | "presidente" | "dojo" | "kenshin";

export type AdminType = "presidente" | "secretario" | "tesorero";

// ─── Permisos ────────────────────────────────────────────────
export interface Permissions {
  finanzas: boolean;
  administrativo: boolean;
}

// ─── Equipamiento ────────────────────────────────────────────
export type EquipmentType = "shinai" | "bokken" | "iaito" | "bogu" | "uniforme" | "otros";
export type EquipmentStatus = "disponible" | "asignado" | "en_reparacion" | "baja";

// ─── Pagos ───────────────────────────────────────────────────
export type PaymentType = "ingreso" | "egreso";
export type PaymentStatus = "pendiente" | "confirmado" | "cancelado";
export type PaymentEntityType = "User" | "Dojo" | "FVK";

// ─── Artes marciales ─────────────────────────────────────────
export type MartialArt = "kendo" | "iaido" | "jodo";

// ─── Grade (Grado) ───────────────────────────────────────────
export interface GradeInfo {
  _id?: string;
  name: string;
  obtainedAt?: Date;
}

// ─── Dojo reference ──────────────────────────────────────────
export interface DojoRef {
  _id?: string;
  name: string;
}

// ─── Gender ──────────────────────────────────────────────────
export type Gender = "masculino" | "femenino" | "otro";

// ============================================================
// Interfaces de documentos Mongoose
// ============================================================

// ─── User ────────────────────────────────────────────────────
export interface IUser {
  name: string;
  identification: number;
  birthdate: Date;
  email: string;
  password: string;
  role: UserRole;
  grade?: GradeInfo;
  gender?: Gender;
  height?: number;
  weight?: number;
  direccion?: string;
  dojo?: DojoRef;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  matchPassword(password: string): Promise<boolean>;
  isSolvent(): Promise<boolean>;
}

export type UserDocument = Document<unknown, {}, IUser> &
  IUser &
  IUserMethods & {
    _id: ObjectId;
  };

export type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

// ─── Dojo ────────────────────────────────────────────────────
export interface IDojo {
  name: string;
  rif: string;
  foundationDate: Date;
  active: boolean;
  arts: MartialArt[];
  contactEmail: string;
  address?: string;
  phone?: string;
  adminUser?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDojoMethods {
  isSolvent(): Promise<boolean>;
}

export type DojoDocument = Document<unknown, {}, IDojo> &
  IDojo &
  IDojoMethods & {
    _id: ObjectId;
  };

export type DojoModel = Model<IDojo, Record<string, never>, IDojoMethods>;

// ─── Payment ─────────────────────────────────────────────────
export interface IPayment {
  type: PaymentType;
  amount: number;
  description?: string;
  status: PaymentStatus;
  from?: ObjectId;
  fromModel?: "User" | "Dojo" | "FVK";
  to?: ObjectId;
  toModel?: "User" | "Dojo" | "FVK";
  externalEntity?: string;
  date: Date;
}

export type PaymentDocument = Document<unknown, {}, IPayment> & IPayment & { _id: ObjectId };

// ─── Equipment ───────────────────────────────────────────────
export interface IEquipment {
  type: EquipmentType;
  description: string;
  serialNumber?: string;
  status: EquipmentStatus;
  assignedTo?: ObjectId;
  assignedBy?: ObjectId;
  dateAssigned?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type EquipmentDocument = Document<unknown, {}, IEquipment> & IEquipment & { _id: ObjectId };

// ─── Grade ───────────────────────────────────────────────────
export interface IGrade {
  name: string;
  rank: number;
}

export type GradeDocument = Document<unknown, {}, IGrade> & IGrade & { _id: ObjectId };

// ============================================================
// Tipos para JWT y sesión
// ============================================================

export interface JwtPayload {
  _id: string;
  role: UserRole;
  name: string;
}

export interface UserSession {
  _id: string;
  role: UserRole;
  name: string;
  dojo?: DojoRef;
  permissions: Permissions;
  isAdmin: boolean;
  isDojo: boolean;
  isStudent: boolean;
}
