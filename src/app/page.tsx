"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Messages from "@/components/Messages";

/**
 * Página de inicio / login.
 * Centrada vertical y horizontalmente con diseño moderno.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      if (data.redirect) {
        router.push(data.redirect);
      }
    } catch {
      setError("Error de conexión con el servidor");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Lado izquierdo — Logo FVK */}
        <div className="login-brand">
          <img
            src="/img/FVK.png"
            alt="Logo FVK"
            title="Logo Federación Venezolana de Kendo, Iaido y Jodo"
            width={260}
            height={260}
          />
          <h1 className="login-brand-title">Federación Venezolana</h1>
          <h3 className="login-brand-subtitle">Kendo Iaido & Jodo</h3>
        </div>

        {/* Lado derecho — Formulario */}
        <div className="login-form">
          <h2 className="login-form-heading">LOGIN</h2>

          <Messages error_msg={error} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="dojo-email">Correo electrónico</label>
              <input
                type="email"
                id="dojo-email"
                className="form-control"
                placeholder="Enter e-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dojo-pass">Contraseña</label>
              <input
                type="password"
                id="dojo-pass"
                className="form-control"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <br />
            <button
              type="submit"
              className="btn btn-login"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
