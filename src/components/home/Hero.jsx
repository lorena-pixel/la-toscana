import { Link } from "react-router-dom";
import "../../styles/home.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero__overlay"></div>

      <div className="hero__content">
        <span className="hero__eyebrow">Auténtica cocina italiana</span>

        <h1>Sabores de Italia, en tu mesa</h1>

        <p>
          Pasta fresca, pizzas artesanas y recetas tradicionales elaboradas
          con ingredientes seleccionados.
        </p>

        <div className="hero__actions">
          <Link to="/reservas" className="button button--primary">
            Reservar mesa
          </Link>

          <Link to="/carta" className="button button--secondary">
            Ver carta
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;