import { useEffect, useState } from "react";
import { getSettings } from "../../services/settingsService";

function AboutPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  if (!settings) {
    return null;
  }

  return (
    <main className="public-info-page">
      <section className="public-info-hero">
        <span>La nostra storia</span>

        <h1>Sobre nosotros</h1>

        <p>
          Cocina italiana, tradición y buenos momentos alrededor
          de la mesa.
        </p>
      </section>

      <section className="about-page-content">
        <div className="about-page-text">
          <span className="section-label">
            Nuestra historia
          </span>

          <h2>
            Bienvenidos a {settings.restaurantName}
          </h2>

          <p>
            Nuestro restaurante nace del amor por la cocina italiana
            tradicional: recetas sencillas, ingredientes de calidad
            y platos preparados para compartir.
          </p>

          <p>
            Queremos que cada visita sea una experiencia cercana,
            tranquila y especial, tanto para una comida familiar
            como para una cena entre amigos.
          </p>

          <p>
            Nuestra carta combina pasta, pizzas artesanas,
            antipasti, carnes y postres inspirados en diferentes
            regiones de Italia.
          </p>
        </div>

        <div className="about-page-card">
          <span>La Toscana</span>

          <strong>1998</strong>

          <p>
            Tradición italiana, cocina artesanal y pasión por
            compartir.
          </p>
        </div>
      </section>

      <section className="about-values">
        <article>
          <span>🍅</span>
          <h3>Ingredientes</h3>
          <p>
            Seleccionamos productos pensando siempre en el sabor
            final de cada plato.
          </p>
        </article>

        <article>
          <span>🍝</span>
          <h3>Tradición</h3>
          <p>
            Recetas inspiradas en la cocina italiana de toda la
            vida.
          </p>
        </article>

        <article>
          <span>❤️</span>
          <h3>Hospitalidad</h3>
          <p>
            Queremos que cada cliente se sienta cómodo desde que
            entra por la puerta.
          </p>
        </article>
      </section>
    </main>
  );
}

export default AboutPage;