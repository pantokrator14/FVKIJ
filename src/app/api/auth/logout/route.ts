import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/auth/logout — protegido contra CSRF (usa POST en vez de GET)
export async function POST(request: Request): Promise<NextResponse> {
  const cookieStore = await cookies();
  // Eliminar la cookie de autorización
  cookieStore.set("authorization", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  // Redirigir al login usando la URL base de la solicitud
  return NextResponse.redirect(new URL("/", request.url));
}
