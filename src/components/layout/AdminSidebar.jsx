import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  logoutAdmin,
} from "../../services/authService";


function AdminSidebar() {
  const navigate =
    useNavigate();


  const handleLogout = () => {
    const confirmed =
      window.confirm(
        "¿Quieres cerrar la sesión de administración?"
      );

    if (!confirmed) {
      return;
    }


    logoutAdmin();


    navigate(
      "/admin/login",
      {
        replace: true,
      }
    );
  };


  return (
    <aside className="admin-sidebar">

      <div className="admin-sidebar__brand">

        <span>
          La Toscana
        </span>

        <strong>
          Administración
        </strong>

      </div>


      <nav>

        <NavLink
          to="/admin"
          end
        >
          Resumen
        </NavLink>


        <NavLink to="/admin/reservas">
          Reservas
        </NavLink>


        <NavLink to="/admin/mesas">
          Mesas
        </NavLink>


        <NavLink to="/admin/clientes">
          Clientes
        </NavLink>


        <NavLink to="/admin/entrada-directa">
          Entrada directa
        </NavLink>


        <NavLink to="/admin/carta">
          Carta
        </NavLink>


        <NavLink to="/admin/caja">
          Caja
        </NavLink>


        <NavLink to="/admin/estadisticas">
          Estadísticas
        </NavLink>


        <NavLink to="/admin/configuracion">
          Configuración
        </NavLink>

      </nav>


      <div className="admin-sidebar__footer">

        <NavLink
          className="admin-sidebar__back"
          to="/"
        >
          ← Volver a la web
        </NavLink>


        <button
          type="button"
          className="admin-sidebar__logout"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>

      </div>

    </aside>
  );
}


export default AdminSidebar;