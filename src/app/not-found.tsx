import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container text-center mt-5">
      <div className="card content p-5 shadow">
        <div className="mb-4">
          <img
            src="/img/FVK.png"
            alt="Logo FVK"
            width={120}
            height={120}
            className="img-fluid opacity-75"
          />
        </div>
        <h1 className="display-1 text-danger fw-bold">404</h1>
        <h2 className="mb-3">Página no encontrada</h2>
        <p className="text-muted mb-4">
          La página que buscas no existe, fue movida o no tienes acceso a ella.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link href="/" className="btn btn-danger btn-lg">
            <i className="fas fa-home"></i> Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
