"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Messages from "@/components/Messages";

interface DojoData {
  _id: string;
  name: string;
  rif: string;
  contactEmail: string;
  phone: string;
  address: string;
  arts: string[];
  foundationDate: string;
}

interface DojoConfigFormProps {
  dojo: DojoData;
}

/**
 * Formulario de configuración del Dojo.
 * Réplica exacta del formulario en dojos/config.hbs.
 */
export default function DojoConfigForm({ dojo }: DojoConfigFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: dojo.name,
    rif: dojo.rif,
    contactEmail: dojo.contactEmail,
    phone: dojo.phone,
    address: dojo.address,
    arts: dojo.arts,
    foundationDate: dojo.foundationDate,
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArtsChange = (art: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      arts: checked
        ? [...prev.arts, art]
        : prev.arts.filter((a) => a !== art),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/dojo/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          arts: formData.arts.join(","),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al actualizar");
        return;
      }

      setSuccess("Información actualizada correctamente");
      setTimeout(() => router.refresh(), 1000);
    } catch {
      setError("Error al actualizar información");
    }
  };

  return (
    <>
      <Messages success_msg={success} error_msg={error} />
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Nombre del Dojo *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleTextChange}
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
                value={formData.rif}
                onChange={handleTextChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Email de Contacto *</label>
              <input
                type="email"
                name="contactEmail"
                className="form-control"
                value={formData.contactEmail}
                onChange={handleTextChange}
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
                value={formData.phone}
                onChange={handleTextChange}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Dirección</label>
          <input
            type="text"
            name="address"
            className="form-control"
            value={formData.address}
            onChange={handleTextChange}
          />
        </div>

        <div className="form-group">
          <label>Artes Marciales *</label>
          <div className="row">
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value="kendo"
                  id="artKendo"
                  checked={formData.arts.includes("kendo")}
                  onChange={(e) => handleArtsChange("kendo", e.target.checked)}
                />
                <label className="form-check-label" htmlFor="artKendo">
                  Kendo
                </label>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value="iaido"
                  id="artIaido"
                  checked={formData.arts.includes("iaido")}
                  onChange={(e) => handleArtsChange("iaido", e.target.checked)}
                />
                <label className="form-check-label" htmlFor="artIaido">
                  Iaido
                </label>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value="jodo"
                  id="artJodo"
                  checked={formData.arts.includes("jodo")}
                  onChange={(e) => handleArtsChange("jodo", e.target.checked)}
                />
                <label className="form-check-label" htmlFor="artJodo">
                  Jodo
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Fecha de Fundación *</label>
              <input
                type="date"
                name="foundationDate"
                className="form-control"
                value={formData.foundationDate}
                onChange={handleTextChange}
                required
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          <i className="fas fa-save"></i> Guardar Cambios
        </button>
      </form>
    </>
  );
}
