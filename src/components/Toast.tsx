"use client";

import { useEffect, useState, useCallback } from "react";

type ToastType = "success" | "error";

interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

/** Contador global para IDs únicos */
let nextId = 0;
let addToastFn: ((msg: Omit<ToastMessage, "id">) => void) | null = null;

/**
 * Función global para mostrar un toast desde cualquier parte de la app.
 * Ej: showToast("success", "Pago registrado con éxito");
 *     showToast("error", "Error al conectar con el servidor");
 */
export function showToast(type: ToastType, text: string): void {
  if (addToastFn) {
    addToastFn({ type, text });
  }
}

/**
 * Toast flotante (esquina superior derecha) para notificaciones globales.
 * Reemplaza a Messages.tsx gradualmente.
 *
 * Características:
 * - Auto-destrucción a los 6 segundos
 * - Botón "Copiar" en errores (copia el texto al portapapeles)
 * - Apila múltiples mensajes
 * - Íconos de FontAwesome
 */
export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((msg: Omit<ToastMessage, "id">) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { ...msg, id }]);

    // Auto-remover después de 6s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  // Registrar la función para acceso global
  useEffect(() => {
    addToastFn = addToast;
    return () => {
      addToastFn = null;
    };
  }, [addToast]);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Mostrar toast de confirmación de copia
      addToast({ type: "success", text: "Error copiado al portapapeles" });
    } catch {
      // Fallback para navegadores antiguos
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      addToast({ type: "success", text: "Error copiado al portapapeles" });
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 420,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`alert alert-${toast.type === "success" ? "success" : "danger"} alert-dismissible fade show`}
          style={{
            margin: 0,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            wordBreak: "break-word",
          }}
          role="alert"
        >
          <i
            className={`fas ${
              toast.type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"
            } mt-1`}
            style={{ flexShrink: 0 }}
          ></i>
          <span style={{ flex: 1 }}>{toast.text}</span>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            {toast.type === "error" && (
              <button
                type="button"
                className="btn btn-sm btn-outline-dark"
                style={{ fontSize: 12, padding: "2px 6px" }}
                onClick={() => copyToClipboard(toast.text)}
                title="Copiar error"
              >
                <i className="fas fa-copy"></i>
              </button>
            )}
            <button
              type="button"
              className="close"
              style={{ position: "static", padding: "0 0 0 4px" }}
              onClick={() => removeToast(toast.id)}
              aria-label="Cerrar"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
