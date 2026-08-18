import { useEffect, useState } from "react";
import "../../styles/footer.css";

import { getSettings } from "../../services/settingsService";

function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  if (!settings) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <h3>{settings.restaurantName}</h3>

          <p>
            Cocina italiana tradicional, ingredientes seleccionados
            y una experiencia pensada para disfrutar sin prisas.
          </p>
        </div>

        <div>
          <h4>Horario</h4>

          <p>
            Comidas: {settings.lunchStart} - {settings.lunchEnd}
          </p>

          <p>
            Cenas: {settings.dinnerStart} - {settings.dinnerEnd}
          </p>
        </div>

        <div>
          <h4>Contacto</h4>

          <p>Tel: {settings.phone}</p>

          <p>{settings.email}</p>

          <p>{settings.address}</p>
        </div>
      </div>

      <div className="footer__bottom">
        © 2026 {settings.restaurantName}. Demo profesional para portfolio.
      </div>
    </footer>
  );
}

export default Footer;