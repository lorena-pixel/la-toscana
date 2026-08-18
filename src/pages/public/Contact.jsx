import { useEffect, useState } from "react";

import { getSettings } from "../../services/settingsService";

function Contact() {
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
        <span>Parliamo</span>

        <h1>Contacto</h1>

        <p>
          ¿Tienes alguna pregunta? Ponte en contacto con nosotros.
        </p>
      </section>

      <section className="contact-layout">
        <div className="contact-information">
          <span className="section-label">
            Estamos aquí
          </span>

          <h2>
            Contacta con {settings.restaurantName}
          </h2>

          <p>
            Puedes llamarnos, escribirnos o visitarnos directamente.
          </p>

          <div className="contact-cards">
            <article>
              <span>📞</span>

              <div>
                <small>Teléfono</small>
                <strong>{settings.phone}</strong>
              </div>
            </article>

            <article>
              <span>✉️</span>

              <div>
                <small>Email</small>
                <strong>{settings.email}</strong>
              </div>
            </article>

            <article>
              <span>📍</span>

              <div>
                <small>Dirección</small>
                <strong>{settings.address}</strong>
              </div>
            </article>

            <article>
              <span>🕒</span>

              <div>
                <small>Horario</small>

                <strong>
                  Comidas {settings.lunchStart} -{" "}
                  {settings.lunchEnd}
                </strong>

                <strong>
                  Cenas {settings.dinnerStart} -{" "}
                  {settings.dinnerEnd}
                </strong>
              </div>
            </article>
          </div>
        </div>

        <div className="contact-map-placeholder">
          <span>📍</span>

          <h3>{settings.restaurantName}</h3>

          <p>{settings.address}</p>

          <small>
            Aquí podremos integrar Google Maps más adelante.
          </small>
        </div>
      </section>
    </main>
  );
}

export default Contact;