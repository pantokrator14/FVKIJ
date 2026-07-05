"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Messages from "@/components/Messages";

interface ProfileData {
  _id: string;
  name: string;
  identification: number;
  email: string;
  birthdate: string;
  gender?: string;
  height?: number;
  weight?: number;
  direccion?: string;
  grade: string;
}

interface ProfileFormProps {
  student: ProfileData;
}

const GRADES = [
  { value: "ninguno", label: "n/a" },
  { value: "6to kyu", label: "六級・6to Kyu" },
  { value: "5to kyu", label: "五級・5to Kyu" },
  { value: "4to kyu", label: "四級・4to Kyu" },
  { value: "3er kyu", label: "三級・3er Kyu" },
  { value: "2do kyu", label: "二級・2do kyu" },
  { value: "1er kyu", label: "一級・1er kyu" },
  { value: "1er dan", label: "一段・1er dan" },
  { value: "2do dan", label: "二段・2do dan" },
  { value: "3er dan", label: "三段・3er dan" },
  { value: "4to dan", label: "四段・4to dan" },
  { value: "5to dan", label: "五段・5to dan" },
  { value: "6to dan", label: "六段・6to dan" },
  { value: "7mo dan", label: "七段・7mo dan" },
  { value: "8vo dan", label: "八段・8vo dan" },
];

/**
 * Formulario de perfil de estudiante.
 * Réplica exacta del formulario en kenshin/profile.hbs.
 */
export default function ProfileForm({ student }: ProfileFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: student.name,
    identification: student.identification,
    email: student.email,
    birthdate: student.birthdate,
    gender: student.gender ?? "otro",
    height: student.height ?? 0,
    weight: student.weight ?? 0,
    direccion: student.direccion ?? "",
    grade: student.grade,
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
      const res = await fetch(`/api/kenshin/profile/${student._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al actualizar");
        return;
      }

      setSuccess("Perfil actualizado exitosamente");
      setTimeout(() => router.refresh(), 1000);
    } catch {
      setError("Error al actualizar el perfil");
    }
  };

  return (
    <>
      <Messages success_msg={success} error_msg={error} />
      <form
        onSubmit={handleSubmit}
      >
        <div className="row">
          <div className="form-group col-sm-12 col-md-6">
            <label>Nombre completo</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoFocus
              required
            />
          </div>
          <div className="form-group col-sm-12 col-md-6">
            <label>Cedula de Identidad</label>
            <input
              type="number"
              className="form-control"
              name="identification"
              placeholder="00000000"
              value={formData.identification}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="form-group col-sm-12 col-md-6">
            <label>Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              readOnly
              tabIndex={-1}
            />
            <small className="form-text text-muted">
              El correo no se puede cambiar desde aquí. Contacta al administrador.
            </small>
          </div>
          <div className="form-group col-sm-12 col-md-6">
            <label>Fecha de nacimiento</label>
            <input
              type="date"
              name="birthdate"
              className="form-control"
              value={formData.birthdate}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="form-group col-sm-12 col-md-6">
            <label>Peso (Kg)</label>
            <input
              type="number"
              name="weight"
              placeholder="00"
              className="form-control"
              value={formData.weight}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group col-sm-12 col-md-6">
            <label>Altura (cms)</label>
            <input
              type="number"
              name="height"
              className="form-control"
              placeholder="000"
              value={formData.height}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="form-group col-sm-12">
            <label>Género</label>
            <br />
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="gender"
                id="genderM"
                value="masculino"
                checked={formData.gender === "masculino"}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="genderM">
                Masculino
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="gender"
                id="genderF"
                value="femenino"
                checked={formData.gender === "femenino"}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="genderF">
                Femenino
              </label>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="form-group col-sm-12 col-sm-6">
            <label>Direccion</label>
            <input
              type="text"
              name="direccion"
              placeholder="Casa, calle, ciudad, estado."
              className="form-control"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group col-sm-12 col-sm-6">
            <label>Grado</label>
            <select
              name="grade"
              className="form-control"
              value={formData.grade}
              onChange={handleChange}
            >
              {GRADES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          <i className="fas fa-user-edit"></i> Actualizar datos
        </button>
      </form>

      <hr className="my-5" />

      {/* ─── Cambio de Contraseña ───────────────────────────────── */}
      <h4 className="mb-3"><i className="fas fa-key"></i> Cambiar Contraseña</h4>
      <PasswordChangeForm userId={student._id} />
    </>
  );
}

/**
 * Formulario independiente de cambio de contraseña.
 */
function PasswordChangeForm({ userId }: { userId: string }) {
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handlePwSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPwSuccess("");
    setPwError("");

    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError("Todos los campos son requeridos");
      return;
    }

    if (pwForm.newPassword.length < 6) {
      setPwError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Las contraseñas nuevas no coinciden");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch(`/api/kenshin/profile/${userId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error ?? "Error al cambiar contraseña");
        setPwLoading(false);
        return;
      }

      setPwSuccess("Contraseña actualizada exitosamente");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).showToast) {
        ((window as unknown as Record<string, unknown>).showToast as (t: string, m: string) => void)(
          "success",
          "Contraseña actualizada"
        );
      }
    } catch {
      setPwError("Error de red al cambiar contraseña");
    }
    setPwLoading(false);
  };

  return (
    <>
      <Messages success_msg={pwSuccess} error_msg={pwError} />
      <form onSubmit={handlePwSubmit} style={{ maxWidth: 400 }}>
        <div className="form-group">
          <label>Contraseña actual</label>
          <input
            type="password"
            className="form-control"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Nueva contraseña</label>
          <input
            type="password"
            className="form-control"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            minLength={6}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirmar nueva contraseña</label>
          <input
            type="password"
            className="form-control"
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
            minLength={6}
            required
          />
        </div>
        <button type="submit" className="btn btn-warning" disabled={pwLoading}>
          <i className="fas fa-key"></i>{" "}
          {pwLoading ? "Cambiando..." : "Cambiar Contraseña"}
        </button>
      </form>
    </>
  );
}
