export default function DashboardLoading() {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "60vh" }}
    >
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Redirigiendo...</span>
        </div>
        <p className="mt-2 text-muted">Redirigiendo...</p>
      </div>
    </div>
  );
}
