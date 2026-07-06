"use client";

import { useEffect, useState } from "react";

interface MessagesProps {
  success_msg?: string;
  error_msg?: string;
}

/**
 * Componente para mostrar mensajes flash (success/error).
 * Se auto-destruye después de 5 segundos y se reinicia con cada nuevo mensaje.
 */
export default function Messages({ success_msg, error_msg }: MessagesProps) {
  const [visible, setVisible] = useState(true);

  // Reiniciar visibilidad y timer cuando llega un nuevo mensaje
  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [success_msg, error_msg]);

  if (!visible) return null;

  return (
    <>
      {success_msg && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {success_msg}
          <button
            type="button"
            className="close"
            onClick={() => setVisible(false)}
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      {error_msg && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error_msg}
          <button
            type="button"
            className="close"
            onClick={() => setVisible(false)}
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}
    </>
  );
}
