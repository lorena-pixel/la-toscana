import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  logoutDeveloper,
} from "../../services/authService";


function DeveloperSidebar() {
  const navigate =
    useNavigate();


  const handleLogout =
    () => {
      const confirmed =
        window.confirm(
          "¿Quieres cerrar la sesión de desarrollador?"
        );


      if (!confirmed) {
        return;
      }


      logoutDeveloper();


      navigate(
        "/developer/login",
        {
          replace: true,
        }
      );
    };


  return (
    <aside className="developer-sidebar">

      <div className="developer-sidebar__brand">

        <span>
          La Toscana
        </span>

        <strong>
          Developer
        </strong>

      </div>


      <nav>

        <NavLink
          to="/developer"
          end
        >
          Estado del sistema
        </NavLink>


        <NavLink
          to="/developer/diagnostico"
        >
          Diagnóstico
        </NavLink>


        <NavLink
          to="/developer/backups"
        >
          Copias de seguridad
        </NavLink>


        <NavLink
          to="/developer/mantenimiento"
        >
          Mantenimiento
        </NavLink>


        <NavLink
          to="/developer/logs"
        >
          Logs
        </NavLink>


        <NavLink
          to="/developer/configuracion"
        >
          Configuración técnica
        </NavLink>

      </nav>


      <div className="developer-sidebar__footer">

        <NavLink
          to="/admin"
          className="developer-sidebar__admin"
        >
          Abrir Admin
        </NavLink>


        <NavLink
          to="/"
          className="developer-sidebar__web"
        >
          ← Volver a la web
        </NavLink>


        <button
          type="button"
          onClick={
            handleLogout
          }
        >
          Cerrar sesión
        </button>

      </div>

    </aside>
  );
}


export default DeveloperSidebar;