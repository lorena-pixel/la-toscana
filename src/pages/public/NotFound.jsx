import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <span>404</span>

        <h1>Página no encontrada</h1>

        <p>
          La página que buscas no existe o ha cambiado de ubicación.
        </p>

        <Link to="/">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

export default NotFound;