import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "./db";
import User from "@/models/User";
import type { JwtPayload, UserSession, UserRole, DojoRef } from "../../types";

const SECRET: string = process.env.SECRET ?? "";

if (!SECRET) {
  throw new Error("SECRET no está definido en las variables de entorno");
}

/**
 * Firma un token JWT para el usuario.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "4h" });
}

/**
 * Verifica y decodifica un token JWT.
 * Retorna el payload o null si es inválido.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Obtiene la sesión del usuario desde la cookie `authorization`.
 * Incluye datos adicionales (dojo, permisos) desde la BD.
 * Se usa en Server Components y Route Handlers.
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("authorization")?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  // Obtener datos adicionales del usuario desde la BD
  let dojoInfo: DojoRef | undefined;
  try {
    await connectDB();
    const user = await User.findById(payload._id).select("dojo");
    if (user?.dojo) {
      dojoInfo = {
        _id: user.dojo._id?.toString(),
        name: user.dojo.name,
      };
    }
  } catch {
    // Si falla la BD, continuamos sin datos extras
  }

  return buildSession(payload, dojoInfo);
}

/**
 * Construye el objeto UserSession a partir del payload JWT.
 */
function buildSession(
  payload: JwtPayload,
  dojo?: DojoRef
): UserSession {
  const role: UserRole = payload.role;
  const permissions = getPermissionsForRole(role);

  return {
    _id: payload._id,
    role,
    name: payload.name,
    dojo,
    permissions,
    isAdmin: ["secretario", "tesorero", "presidente"].includes(role),
    isDojo: role === "dojo",
    isStudent: role === "kenshin",
  };
}

/**
 * Retorna los permisos según el rol.
 */
function getPermissionsForRole(role: UserRole): UserSession["permissions"] {
  switch (role) {
    case "presidente":
      return { finanzas: true, administrativo: true };
    case "secretario":
      return { finanzas: false, administrativo: true };
    case "tesorero":
      return { finanzas: true, administrativo: false };
    default:
      return { finanzas: false, administrativo: false };
  }
}
