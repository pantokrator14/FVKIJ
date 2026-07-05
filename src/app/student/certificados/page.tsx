import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DynamicSidebar from "@/components/DynamicSidebar";

/**
 * Página de certificados para estudiantes.
 * Ahora funcional: descarga certificados de grado y constancias.
 */
export default async function CertificadosPage() {
  const session = await getSession();

  if (!session || !session.isStudent) {
    redirect("/");
  }

  return (
    <div className="row">
      <div className="col-sm-12 col-md-3 bg-dark">
        <div className="card-body">
          <DynamicSidebar user={session} />
        </div>
      </div>

      <div className="col-sm-12 col-md-9 content">
        <div className="card-head">
          <br />
          <h1>
            <i className="fas fa-stamp"></i> Certificaciones
          </h1>
        </div>
        <div className="card-body">
          <div className="alert alert-info">
            <h4>
              <i className="fas fa-certificate"></i> Certificados de Grado
            </h4>
            <p>
              Aquí puedes descargar tus certificados de grado emitidos por la
              Federación Venezolana de Kendo, Iaido y Jodo.
            </p>
            <p className="text-muted">
              Los certificados se abren en una nueva pestaña. Usa la opción
              &quot;Imprimir → Guardar como PDF&quot; de tu navegador para
              descargarlos.
            </p>
          </div>

          <div className="row mt-4">
            <div className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <i className="fas fa-file-pdf fa-3x text-danger mb-3"></i>
                  <h5>Certificado de Grado</h5>
                  <p className="text-muted">
                    Certificado oficial de tu grado actual
                  </p>
                  <a
                    href="/api/kenshin/certificados/grado"
                    target="_blank"
                    className="btn btn-danger"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-download"></i> Descargar
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <i className="fas fa-id-card fa-3x text-primary mb-3"></i>
                  <h5>Constancia de Estudio</h5>
                  <p className="text-muted">
                    Constancia de tu membresía activa en el dojo
                  </p>
                  <a
                    href="/api/kenshin/certificados/constancia"
                    target="_blank"
                    className="btn btn-primary"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-download"></i> Descargar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
