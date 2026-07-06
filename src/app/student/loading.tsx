export default function StudentLoading() {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "60vh" }}
    >
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando...</p>
      </div>
    </div>
  );
}
