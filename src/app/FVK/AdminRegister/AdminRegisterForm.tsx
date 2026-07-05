"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Messages from "@/components/Messages";

/**
 * Formulario de registro de administradores.
 * Crea usuarios con roles de secretario, tesorero o presidente.
 */
export default function AdminRegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    adminType: "presidente",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/admin/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          adminType: formData.adminType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al registrar");
        return;
      }

      setSuccess(
        `Administrador registrado exitosamente como: ${formData.adminType}`
      );
      setTimeout(() => router.refresh(), 1500);
    } catch {
      setError("Error al registrar administrador");
    }
  };

  return (
    <>
      <Messages success_msg={success} error_msg={error} />

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="form-group col-sm-12">
            <label>Nombre Completo</label>
            <input
              type="text"
              className="form-control"
              name="name"
              placeholder="Ej: Juan Pérez"
              value={formData.name}
              onChange={handleChange}
              autoFocus
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="form-group col-sm-12 col-md-6">
            <label>Correo Institucional</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="presidente@fvk.gob.ve"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group col-sm-12 col-md-6">
            <label>Contraseña</label>
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
        </div>
        <div className="row">
          <div className="form-group col-sm-12">
            <label>Tipo de Administrador</label>
            <select
              name="adminType"
              className="form-control"
              value={formData.adminType}
              onChange={handleChange}
              required
            >
              <option value="presidente">
                Presidente — Acceso total (finanzas + gestión)
              </option>
              <option value="secretario">
                Secretario — Gestión de dojos y equipos
              </option>
              <option value="tesorero">
                Tesorero — Gestión financiera (pagos)
              </option>
            </select>
            <small className="form-text text-muted">
              {formData.adminType === "presidente" &&
                "Puede gestionar dojos, equipos y finanzas."}
              {formData.adminType === "secretario" &&
                "Puede registrar y gestionar dojos y equipos."}
              {formData.adminType === "tesorero" &&
                "Puede revisar y confirmar pagos."}
            </small>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          <i className="fa fa-user-plus"></i> Registrar Administrador
        </button>
      </form>
    </>
  );
}
