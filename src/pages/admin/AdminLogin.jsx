import {
  useState,
} from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  isAdminAuthenticated,
  loginAdmin,
} from "../../services/authService";

import "../../styles/adminLogin.css";


function AdminLogin() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  if (isAdminAuthenticated()) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }


  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const result =
      loginAdmin(
        username.trim(),
        password
      );

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }


    const destination =
      location.state?.from &&
      location.state.from !==
        "/admin/login"
        ? location.state.from
        : "/admin";


    navigate(
      destination,
      {
        replace: true,
      }
    );
  };


  return (
    <main className="admin-login">

      <section className="admin-login__card">

        <div className="admin-login__brand">

          <span className="admin-login__eyebrow">
            LA TOSCANA
          </span>

          <h1>
            Administración
          </h1>

          <p>
            Accede al panel de gestión
            del restaurante.
          </p>

        </div>


        <form
          className="admin-login__form"
          onSubmit={handleSubmit}
        >

          <label>

            Usuario

            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              placeholder="Usuario"
              autoComplete="username"
              autoFocus
            />

          </label>


          <label>

            Contraseña

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Contraseña"
              autoComplete="current-password"
            />

          </label>


          {error && (

            <div className="admin-login__error">
              {error}
            </div>

          )}


          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Accediendo..."
              : "Iniciar sesión"}

          </button>

        </form>


        <button
          type="button"
          className="admin-login__back"
          onClick={() =>
            navigate("/")
          }
        >
          ← Volver a la web
        </button>

      </section>

    </main>
  );
}


export default AdminLogin;