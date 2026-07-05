"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserSession } from "../../types";

export interface SidebarLink {
  href: string;
  label: string;
  icon: string;
  /** Patrón para determinar si el link está activo. Si empieza con "startsWith:", usa startsWith. */
  activePattern?: string;
  /** Si se provee, el link solo se muestra si el usuario cumple esta condición */
  permissionCheck?: (user: UserSession) => boolean;
}

interface NavSidebarProps {
  user: UserSession;
  links: SidebarLink[];
  homeHref: string;
}

/**
 * Sidebar unificado para todos los roles.
 * - Desktop: barra lateral fija con viewport completo y scroll interno.
 * - Móvil/tablet: botón hamburguesa + panel deslizante desde la izquierda.
 */
export default function NavSidebar({ user, links, homeHref }: NavSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar sidebar al cambiar de ruta (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Bloquear scroll del body cuando el sidebar overlay está abierto (mobile/tablet)
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const isActive = (link: SidebarLink): boolean => {
    const pattern = link.activePattern ?? link.href;
    if (pattern.startsWith("startsWith:")) {
      return pathname?.startsWith(pattern.slice("startsWith:".length)) ?? false;
    }
    return pathname === pattern;
  };

  const filteredLinks = links.filter(
    (link) => !link.permissionCheck || link.permissionCheck(user)
  );

  const content = (
    <>
      {/* Logo — lleva al inicio */}
      <Link className="sidebar-logo-link" href={homeHref}>
          <img
          src="/img/FVK.png"
          width={150}
          height={150}
          className="sidebar-logo"
          alt="Logo FVK"
          title="Logo Federación Venezolana de Kendo Iaido & Jodo."
        />
      </Link>

      {/* Navegación */}
      <ul className="sidebar-nav-list">
        {filteredLinks.map((link) => (
          <li className="sidebar-nav-item" key={link.href}>
            <Link
              href={link.href}
              className={`sidebar-link ${isActive(link) ? "active" : ""}`}
            >
              <i className={link.icon}></i> {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Cerrar sesión al fondo */}
      <div className="sidebar-logout">
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="sidebar-logout-btn">
            <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Botón hamburguesa (solo móvil/tablet) */}
      <button
        className={`hamburger-btn ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen((prev) => !prev)}
        aria-label="Toggle sidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay (solo móvil/tablet cuando el sidebar está abierto) */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar móvil — panel deslizante (solo móvil/tablet) */}
      <div className={`sidebar-mobile ${sidebarOpen ? "open" : ""}`}>
        {content}
      </div>

      {/* Sidebar desktop — dentro del flujo normal (se oculta en móvil) */}
      <div className="sidebar-desktop">{content}</div>
    </>
  );
}
