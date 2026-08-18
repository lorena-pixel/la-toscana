import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import "../../styles/navbar.css";

import {
  getSettings,
} from "../../services/settingsService";


function Navbar() {
  const [settings, setSettings] =
    useState(null);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const location =
    useLocation();


  useEffect(() => {
    setSettings(
      getSettings()
    );
  }, []);


  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);


  if (!settings) {
    return null;
  }


  return (
    <header className="navbar">

      <div className="navbar__container">

        <Link
          to="/"
          className="navbar__brand"
        >
          {settings.restaurantName}
        </Link>


        <nav className="navbar__nav">

          <Link to="/">
            Inicio
          </Link>

          <Link to="/carta">
            Carta
          </Link>

          <Link to="/reservas">
            Reservas
          </Link>

          <Link to="/nosotros">
            Nosotros
          </Link>

          <Link to="/contacto">
            Contacto
          </Link>

        </nav>


        <Link
          to="/reservas"
          className="navbar__booking"
        >
          Reservar mesa
        </Link>


        <button
          type="button"
          className="navbar__menu-button"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          onClick={() =>
            setMenuOpen(
              (current) => !current
            )
          }
        >
          {menuOpen ? "✕" : "☰"}
        </button>

      </div>


      <div
        className={`navbar__mobile ${menuOpen
            ? "navbar__mobile--open"
            : ""
          }`}
      >

        <nav>

          <Link to="/">
            Inicio
          </Link>

          <Link to="/carta">
            Carta
          </Link>

          <Link to="/reservas">
            Reservas
          </Link>

          <Link to="/nosotros">
            Nosotros
          </Link>

          <Link to="/contacto">
            Contacto
          </Link>

        </nav>


        <div className="navbar__mobile-info">

          <span>
            {settings.phone}
          </span>

          <span>
            {settings.address}
          </span>

        </div>

      </div>

    </header>
  );
}


export default Navbar;