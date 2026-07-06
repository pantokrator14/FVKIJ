"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container text-center mt-5">
      <div className="card content p-5">
        <h1 className="display-1 text-danger">Error</h1>
        <h2>Algo salió mal</h2>
        <p className="mt-3 text-muted">
          {error.message ?? "Ha ocurrido un error inesperado."}
        </p>
        <button
          onClick={reset}
          className="btn btn-danger btn-lg mt-3"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
