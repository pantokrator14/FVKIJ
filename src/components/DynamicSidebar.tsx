"use client";

import type { UserSession } from "../../types";
import NavSidebar from "./NavSidebar";
import type { SidebarLink } from "./NavSidebar";

interface DynamicSidebarProps {
  user: UserSession;
}

/**
 * Renderiza el sidebar correspondiente según el rol del usuario,
 * usando el componente NavSidebar unificado con configuraciones de links.
 */
export default function DynamicSidebar({ user }: DynamicSidebarProps) {
  let links: SidebarLink[];
  let homeHref: string;

  if (user.isAdmin) {
    homeHref = "/FVK/dashboard";
    links = [
      {
        href: "/FVK/dojos",
        label: "Dojos",
        icon: "fa fa-address-card",
        permissionCheck: (u) => u.permissions.administrativo,
      },
      {
        href: "/FVK/payments/ingresos",
        label: "Finanzas",
        icon: "fas fa-piggy-bank",
        activePattern: "startsWith:/FVK/payments",
        permissionCheck: (u) => u.permissions.finanzas,
      },
      {
        href: "/FVK/equipos",
        label: "Equipos",
        icon: "fas fa-box-open",
        permissionCheck: (u) => u.permissions.administrativo,
      },
      {
        href: "/FVK/grados",
        label: "Grados",
        icon: "fas fa-graduation-cap",
        permissionCheck: (u) => u.permissions.administrativo,
      },
    ];
  } else if (user.isDojo) {
    homeHref = "/dojo/dashboard";
    links = [
      {
        href: "/dojo/members",
        label: "Membresía",
        icon: "fa fa-address-card",
      },
      {
        href: "/dojo/config",
        label: "Configuración",
        icon: "fas fa-cog",
      },
      {
        href: "/dojo/payments/ingresos",
        label: "Finanzas",
        icon: "fas fa-piggy-bank",
        activePattern: "startsWith:/dojo/payments",
      },
    ];
  } else {
    // Student (kenshin)
    homeHref = "/student/dashboard";
    links = [
      {
        href: `/student/profile/${user._id}`,
        label: "Configuración",
        icon: "fas fa-cog",
        activePattern: "startsWith:/student/profile",
      },
      {
        href: "/student/certificados",
        label: "Certificaciones",
        icon: "fas fa-stamp",
      },
      {
        href: "/student/equipos",
        label: "Equipos",
        icon: "fas fa-box-open",
      },
      {
        href: "/student/payments/egresos",
        label: "Finanzas",
        icon: "fas fa-piggy-bank",
        activePattern: "startsWith:/student/payments",
      },
    ];
  }

  return <NavSidebar user={user} links={links} homeHref={homeHref} />;
}
