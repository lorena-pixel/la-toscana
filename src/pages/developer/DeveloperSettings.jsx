import {
  useEffect,
  useState,
} from "react";

import DeveloperSidebar from "../../components/layout/DeveloperSidebar";

import {
  createLog,
} from "../../services/logService";

import "../../styles/developerSettings.css";


const STORAGE_KEY =
  "laToscanaDeveloperSettings";


const defaultSettings = {
  appVersion: "1.0.0",

  environment: "Demo / Portfolio",

  frontend:
    "React + Vite",

  persistence:
    "LocalStorage",

  apiUrl: "",

  backendStatus:
    "No conectado",

  databaseStatus:
    "No conectada",

  deploymentProvider:
    "Pendiente",

  repository:
    "GitHub",

  maintenanceNotes:
    "",

  updatedAt:
    null,
};


function DeveloperSettings() {
  const [
    settings,
    setSettings,
  ] = useState(
    defaultSettings
  );

  const [
    message,
    setMessage,
  ] = useState("");


  useEffect(() => {
    try {
      const stored =
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          )
        );


      if (stored) {
        setSettings({
          ...defaultSettings,
          ...stored,
        });
      }
    } catch {
      setSettings(
        defaultSettings
      );
    }
  }, []);


  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } =
      event.target;


    setSettings(
      (current) => ({
        ...current,

        [name]:
          value,
      })
    );


    setMessage("");
  };


  const handleSave = (
    event
  ) => {
    event.preventDefault();


    const updated = {
      ...settings,

      updatedAt:
        new Date()
          .toISOString(),
    };


    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        updated
      )
    );


    setSettings(
      updated
    );


    setMessage(
      "Configuración técnica guardada correctamente."
    );


    createLog({
      type:
        "CONFIGURACIÓN",

      title:
        "Configuración técnica actualizada",

      description:
        `Versión ${updated.appVersion} · Entorno: ${updated.environment} · Backend: ${updated.backendStatus} · Base de datos: ${updated.databaseStatus}.`,

      level:
        "info",

      metadata: {
        appVersion:
          updated.appVersion,

        environment:
          updated.environment,

        backendStatus:
          updated.backendStatus,

        databaseStatus:
          updated.databaseStatus,

        deploymentProvider:
          updated.deploymentProvider,

        repository:
          updated.repository,

        updatedAt:
          updated.updatedAt,
      },
    });
  };


  const handleReset = () => {
    const confirmed =
      window.confirm(
        "¿Restablecer la configuración técnica?"
      );


    if (!confirmed) {
      return;
    }


    const resetSettings = {
      ...defaultSettings,

      updatedAt:
        new Date()
          .toISOString(),
    };


    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        resetSettings
      )
    );


    setSettings(
      resetSettings
    );


    setMessage(
      "Configuración técnica restablecida."
    );


    createLog({
      type:
        "CONFIGURACIÓN",

      title:
        "Configuración técnica restablecida",

      description:
        "La configuración técnica se ha restablecido a sus valores predeterminados.",

      level:
        "warning",

      metadata: {
        updatedAt:
          resetSettings.updatedAt,
      },
    });
  };


  return (
    <div className="developer-layout">

      <DeveloperSidebar />


      <main className="developer-main">

        <header className="developer-header">

          <span>
            Sistema
          </span>

          <h1>
            Configuración técnica
          </h1>

          <p>
            Información interna de
            mantenimiento y despliegue
            de La Toscana.
          </p>

        </header>


        {message && (

          <div className="developer-settings-message">
            {message}
          </div>

        )}


        <form
          className="developer-settings-form"
          onSubmit={
            handleSave
          }
        >

          <section className="developer-panel">

            <div className="developer-panel__heading">

              <span>
                Aplicación
              </span>

              <h2>
                Información general
              </h2>

            </div>


            <div className="developer-settings-grid">

              <label>

                Versión

                <input
                  name="appVersion"
                  value={
                    settings.appVersion
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>

                Entorno

                <select
                  name="environment"
                  value={
                    settings.environment
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option>
                    Demo / Portfolio
                  </option>

                  <option>
                    Desarrollo
                  </option>

                  <option>
                    Producción
                  </option>

                </select>

              </label>


              <label>

                Frontend

                <input
                  name="frontend"
                  value={
                    settings.frontend
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>

                Persistencia

                <input
                  name="persistence"
                  value={
                    settings.persistence
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>

            </div>

          </section>


          <section className="developer-panel developer-settings-section">

            <div className="developer-panel__heading">

              <span>
                Infraestructura
              </span>

              <h2>
                Backend y despliegue
              </h2>

            </div>


            <div className="developer-settings-grid">

              <label>

                URL de API

                <input
                  name="apiUrl"
                  value={
                    settings.apiUrl
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://api..."
                />

              </label>


              <label>

                Estado backend

                <select
                  name="backendStatus"
                  value={
                    settings.backendStatus
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option>
                    No conectado
                  </option>

                  <option>
                    En desarrollo
                  </option>

                  <option>
                    Operativo
                  </option>

                  <option>
                    Error
                  </option>

                </select>

              </label>


              <label>

                Estado base de datos

                <select
                  name="databaseStatus"
                  value={
                    settings.databaseStatus
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option>
                    No conectada
                  </option>

                  <option>
                    En desarrollo
                  </option>

                  <option>
                    Operativa
                  </option>

                  <option>
                    Error
                  </option>

                </select>

              </label>


              <label>

                Hosting / proveedor

                <input
                  name="deploymentProvider"
                  value={
                    settings.deploymentProvider
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>

                Repositorio

                <input
                  name="repository"
                  value={
                    settings.repository
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>

            </div>

          </section>


          <section className="developer-panel developer-settings-section">

            <div className="developer-panel__heading">

              <span>
                Mantenimiento
              </span>

              <h2>
                Notas técnicas
              </h2>

            </div>


            <label className="developer-settings-notes">

              Observaciones

              <textarea
                name="maintenanceNotes"
                rows="6"
                value={
                  settings.maintenanceNotes
                }
                onChange={
                  handleChange
                }
                placeholder="Cambios pendientes, incidencias técnicas, tareas futuras..."
              />

            </label>


            <div className="developer-settings-updated">

              Última modificación:{" "}

              <strong>

                {settings.updatedAt
                  ? new Date(
                      settings.updatedAt
                    ).toLocaleString(
                      "es-ES"
                    )
                  : "Sin guardar"}

              </strong>

            </div>

          </section>


          <div className="developer-settings-actions">

            <button
              type="button"
              className="developer-settings-reset"
              onClick={
                handleReset
              }
            >
              Restablecer
            </button>


            <button
              type="submit"
              className="developer-settings-save"
            >
              Guardar configuración
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}


export default DeveloperSettings;