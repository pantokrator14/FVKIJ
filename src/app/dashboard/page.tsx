import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

/**
 * Dashboard raíz — redirige según el rol del usuario.
 */
export default async function DashboardRootPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  if (session.isAdmin) {
    redirect("/FVK/dashboard");
  } else if (session.isDojo) {
    redirect("/dojo/dashboard");
  } else {
    redirect("/student/dashboard");
  }
}
