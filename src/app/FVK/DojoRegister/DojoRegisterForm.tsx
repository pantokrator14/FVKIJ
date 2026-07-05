"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Messages from "@/components/Messages";

/**
 * Formulario de registro de Dojo.
 * Réplica exacta del formulario en admin/register.hbs.
 */
export default function DojoRegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    rif: "",
    contactEmail: "",
    phone: "",
    address: "",
    foundationDate: "",
    arts: {
      kendo: true,
      iaido: false,
      jodo: false,
    },
    contactPerson: {
      name: "",
      id: "",
      email: "",
      grade: "8vo dan",
    },
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("contactPerson.")) {
      const field = name.split(".")[1] as string;
      setFormData((prev) => ({
        ...prev,
        contactPerson: { ...prev.contactPerson, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArtsChange = (art: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      arts: { ...prev.arts, [art]: checked },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess("");

    const validationErrors: string[] = [];
    if (!formData.name) validationErrors.push("Nombre del dojo requerido");
    if (!formData.contactEmail)
      validationErrors.push("Correo requerido");
    if (formData.password !== formData.confirmPassword)
      validationErrors.push("Contraseñas no coinciden");
    if (formData.password.length < 6)
      validationErrors.push("La contraseña debe tener al menos 6 caracteres");

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const selectedArts = Object.entries(formData.arts)
        .filter(([, v]) => v)
        .map(([k]) => k);

      const res = await fetch("/api/admin/register-dojo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          arts: selectedArts,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors([data.error ?? "Error al registrar dojo"]);
        return;
      }

      setSuccess("Dojo registrado exitosamente. Espere validación.");
      setTimeout(() => router.push("/FVK/dojos"), 1500);
    } catch {
      setErrors(["Error en el servidor"]);
    }
  };

  return (
    <>
      <Messages success_msg={success} />
      {errors.length > 0 && (
        <Messages error_msg={errors.join(". ")} />
      )}

      <form onSubmit={handleSubmit}>
        <h4>Información del Dojo</h4>
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="form-group">
              <label>Nombre del Dojo *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Ej: Dojo Caracas"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>RIF *</label>
              <input
                type="text"
                name="rif"
                className="form-control"
                placeholder="J-00000000-0"
                value={formData.rif}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label>Email de Contacto *</label>
              <input
                type="email"
                name="contactEmail"
                className="form-control"
                placeholder="contacto@dojo.com"
                value={formData.contactEmail}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                placeholder="+58 412-0000000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-12">
            <div className="form-group">
              <label>Dirección *</label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="Calle, ciudad, estado"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label>Fecha de Fundación *</label>
              <input
                type="date"
                name="foundationDate"
                className="form-control"
                value={formData.foundationDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label>Artes Marciales *</label>
              <div className="d-flex">
                <div className="form-check mr-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={formData.arts.kendo}
                    onChange={(e) =>
                      handleArtsChange("kendo", e.target.checked)
                    }
                    id="kendoCheck"
                  />
                  <label className="form-check-label" htmlFor="kendoCheck">
                    Kendo
                  </label>
                </div>
                <div className="form-check mr-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={formData.arts.iaido}
                    onChange={(e) =>
                      handleArtsChange("iaido", e.target.checked)
                    }
                    id="iaidoCheck"
                  />
                  <label className="form-check-label" htmlFor="iaidoCheck">
                    Iaido
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={formData.arts.jodo}
                    onChange={(e) =>
                      handleArtsChange("jodo", e.target.checked)
                    }
                    id="jodoCheck"
                  />
                  <label className="form-check-label" htmlFor="jodoCheck">
                    Jodo
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h4>Información del Responsable</h4>
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                name="contactPerson.name"
                className="form-control"
                placeholder="Nombre y apellido"
                value={formData.contactPerson.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Cédula de Identidad *</label>
              <input
                type="text"
                name="contactPerson.id"
                className="form-control"
                placeholder="00000000"
                value={formData.contactPerson.id}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label>Email Personal *</label>
              <input
                type="email"
                name="contactPerson.email"
                className="form-control"
                placeholder="responsable@email.com"
                value={formData.contactPerson.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label>Grado Máximo *</label>
              <select
                name="contactPerson.grade"
                className="form-control"
                value={formData.contactPerson.grade}
                onChange={handleChange}
                required
              >
                <option value="1er dan">一段・1er dan</option>
                <option value="2do dan">二段・2do dan</option>
                <option value="3er dan">三段・3er dan</option>
                <option value="4to dan">四段・4to dan</option>
                <option value="5to dan">五段・5to dan</option>
                <option value="6to dan">六段・6to dan</option>
                <option value="7mo dan">七段・7mo dan</option>
                <option value="8vo dan">八段・8vo dan</option>
              </select>
            </div>
          </div>
        </div>

        <h4>Credenciales de Acceso</h4>
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="form-group">
              <label>Contraseña *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Confirmar Contraseña *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-primary btn-lg">
            <i className="fas fa-paper-plane"></i> Enviar solicitud de ingreso
          </button>
          <p className="mt-3">
            ¿Su dojo ya está registrado? <a href="/">Ingrese aquí</a>
          </p>
        </div>
      </form>
    </>
  );
}
