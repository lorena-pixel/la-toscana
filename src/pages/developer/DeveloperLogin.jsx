import {
  useState,
} from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  isDeveloperAuthenticated,
  loginDeveloper,
} from "../../services/authService";

import "../../styles/developer.css";


function DeveloperLogin() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    username,
    setUsername,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  if (
    isDeveloperAuthenticated()
  ) {
    return (
      <Navigate
        to="/developer"
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
      loginDeveloper(
        username.trim(),
        password
      );


    if (!result.success) {
      setError(
        result.message
      );

      setLoading(false);

      return;
    }


    const destination =
      location.state?.from &&
      location.state.from !==
        "/developer/login"
        ? location.state.from
        : "/developer";


    navigate(
      destination,
      {
        replace: true,
      }
    );
  };


  return (
    <main className="developer-login">

      <section className="developer-login__card">

        <div className="developer-login__brand">

          <span>
            LA TOSCANA
          </span>

          <h1>
            Developer
          </h1>

          <p>
            Panel técnico de mantenimiento
            y supervisión.
          </p>

        </div>


        <form
          className="developer-login__form"
          onSubmit={
            handleSubmit
          }
        >

          <label>

            Usuario

            <input
              type="text"
              value={
                username
              }
              onChange={
                (event) =>
                  setUsername(
                    event.target.value
                  )
              }
              placeholder="Usuario developer"
              autoComplete="username"
              autoFocus
            />

          </label>


          <label>

            Contraseña

            <input
              type="password"
              value={
                password
              }
              onChange={
                (event) =>
                  setPassword(
                    event.target.value
                  )
              }
              placeholder="Contraseña"
              autoComplete="current-password"
            />

          </label>


          {error && (

            <div className="developer-login__error">
              {error}
            </div>

          )}


          <button
            type="submit"
            disabled={
              loading
            }
          >

            {loading
              ? "Accediendo..."
              : "Acceder al panel"}

          </button>

        </form>


        <button
          type="button"
          className="developer-login__back"
          onClick={
            () =>
              navigate("/")
          }
        >
          ← Volver a la web
        </button>

      </section>

    </main>
  );
}


export default DeveloperLogin;