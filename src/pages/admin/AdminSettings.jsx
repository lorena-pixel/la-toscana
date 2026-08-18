import {
  useEffect,
  useState,
} from "react";

import AdminSidebar from "../../components/layout/AdminSidebar";

import {
  getSettings,
  resetSettings,
  saveSettings,
} from "../../services/settingsService";

import {
  clearDemoData,
  loadDemoData,
} from "../../services/demoDataService";


function AdminSettings() {
  const [
    settings,
    setSettings,
  ] = useState(null);

  const [
    message,
    setMessage,
  ] = useState("");


  useEffect(() => {
    setSettings(
      getSettings()
    );
  }, []);


  if (!settings) {
    return null;
  }


  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setSettings(
      (current) => ({
        ...current,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );

    setMessage("");
  };


  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    saveSettings({
      ...settings,

      maxGuestsPerBooking:
        Number(
          settings.maxGuestsPerBooking
        ),

      bookingDuration:
        Number(
          settings.bookingDuration
        ),
    });

    setMessage(
      "Configuración guardada correctamente."
    );
  };


  const handleReset = () => {
    const confirmed =
      window.confirm(
        "¿Quieres restaurar la configuración original?"
      );

    if (!confirmed) {
      return;
    }

    const defaults =
      resetSettings();

    setSettings(
      defaults
    );

    setMessage(
      "Configuración restaurada."
    );
  };


  const handleLoadDemo = () => {
    const confirmed =
      window.confirm(
        "Esto sustituirá los clientes, reservas, visitas, caja y estado actual de las mesas por datos de demostración. ¿Continuar?"
      );

    if (!confirmed) {
      return;
    }

    const result =
      loadDemoData();

    setMessage(
      `Datos demo cargados: ${result.customers} clientes, ${result.bookings} reservas y ${result.visits} entradas directas.`
    );
  };


  const handleClearDemo = () => {
    const confirmed =
      window.confirm(
        "¿Seguro que quieres borrar clientes, reservas, entradas directas y movimientos de caja? La carta y la configuración del restaurante se conservarán."
      );

    if (!confirmed) {
      return;
    }

    clearDemoData();

    setMessage(
      "Datos operativos eliminados. La carta y la configuración se han conservado."
    );
  };


  const days = [
    [
      "mondayOpen",
      "Lunes",
    ],
    [
      "tuesdayOpen",
      "Martes",
    ],
    [
      "wednesdayOpen",
      "Miércoles",
    ],
    [
      "thursdayOpen",
      "Jueves",
    ],
    [
      "fridayOpen",
      "Viernes",
    ],
    [
      "saturdayOpen",
      "Sábado",
    ],
    [
      "sundayOpen",
      "Domingo",
    ],
  ];


  return (
    <div className="admin-layout">

      <AdminSidebar />

      <main className="admin-main">

        <header className="admin-header">

          <span>
            Restaurante
          </span>

          <h1>
            Configuración
          </h1>

          <p>
            Gestiona los datos generales,
            horarios y reglas del restaurante.
          </p>

        </header>


        {message && (

          <div className="settings-message">

            {message}

          </div>

        )}


        <form
          className="settings-form"
          onSubmit={
            handleSubmit
          }
        >

          <section className="admin-panel">

            <div className="admin-panel__heading">

              <div>

                <span>
                  Información
                </span>

                <h2>
                  Datos del restaurante
                </h2>

              </div>

            </div>


            <div className="settings-grid">

              <label>

                Nombre del restaurante

                <input
                  type="text"
                  name="restaurantName"
                  value={
                    settings.restaurantName
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>

                Teléfono

                <input
                  type="text"
                  name="phone"
                  value={
                    settings.phone
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>

                Email

                <input
                  type="email"
                  name="email"
                  value={
                    settings.email
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>

                Dirección

                <input
                  type="text"
                  name="address"
                  value={
                    settings.address
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>

            </div>

          </section>


          <section className="admin-panel">

            <div className="admin-panel__heading">

              <div>

                <span>
                  Horario
                </span>

                <h2>
                  Servicios
                </h2>

              </div>

            </div>


            <div className="settings-grid">

              <label>

                Inicio comidas

                <input
                  type="time"
                  name="lunchStart"
                  value={
                    settings.lunchStart
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>

                Fin comidas

                <input
                  type="time"
                  name="lunchEnd"
                  value={
                    settings.lunchEnd
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>

                Inicio cenas

                <input
                  type="time"
                  name="dinnerStart"
                  value={
                    settings.dinnerStart
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>

                Fin cenas

                <input
                  type="time"
                  name="dinnerEnd"
                  value={
                    settings.dinnerEnd
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>

            </div>

          </section>


          <section className="admin-panel">

            <div className="admin-panel__heading">

              <div>

                <span>
                  Apertura
                </span>

                <h2>
                  Días abiertos
                </h2>

              </div>

            </div>


            <div className="settings-days">

              {days.map(
                (
                  [
                    key,
                    label,
                  ]
                ) => (

                  <label
                    className="settings-day"
                    key={key}
                  >

                    <input
                      type="checkbox"
                      name={key}
                      checked={
                        settings[
                          key
                        ]
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span>
                      {label}
                    </span>

                  </label>

                )
              )}

            </div>

          </section>


          <section className="admin-panel">

            <div className="admin-panel__heading">

              <div>

                <span>
                  Reservas
                </span>

                <h2>
                  Reglas de reserva
                </h2>

              </div>

            </div>


            <div className="settings-grid">

              <label>

                Máximo de personas por reserva

                <input
                  type="number"
                  min="1"
                  name="maxGuestsPerBooking"
                  value={
                    settings.maxGuestsPerBooking
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>

                Duración estimada

                <select
                  name="bookingDuration"
                  value={
                    settings.bookingDuration
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="60">
                    60 minutos
                  </option>

                  <option value="90">
                    90 minutos
                  </option>

                  <option value="120">
                    120 minutos
                  </option>

                  <option value="150">
                    150 minutos
                  </option>

                  <option value="180">
                    180 minutos
                  </option>

                </select>

              </label>

            </div>

          </section>


          <div className="settings-actions">

            <button
              type="button"
              className="settings-reset"
              onClick={
                handleReset
              }
            >

              Restaurar valores

            </button>


            <button
              type="submit"
              className="settings-save"
            >

              Guardar configuración

            </button>

          </div>

        </form>


        <section className="admin-panel demo-data-panel">

          <div className="admin-panel__heading">

            <div>

              <span>
                Portfolio
              </span>

              <h2>
                Datos de demostración
              </h2>

            </div>

          </div>


          <p className="demo-data-description">

            Rellena automáticamente La Toscana con clientes,
            reservas, entradas directas, cobros y gastos para
            poder enseñar todas las funciones del sistema.

          </p>


          <div className="demo-data-summary">

            <div>
              <strong>10</strong>
              <span>Clientes</span>
            </div>

            <div>
              <strong>8</strong>
              <span>Reservas</span>
            </div>

            <div>
              <strong>4</strong>
              <span>Entradas directas</span>
            </div>

            <div>
              <strong>9</strong>
              <span>Movimientos caja</span>
            </div>

          </div>


          <div className="demo-data-actions">

            <button
              type="button"
              className="demo-load-button"
              onClick={
                handleLoadDemo
              }
            >

              Cargar datos demo

            </button>


            <button
              type="button"
              className="demo-clear-button"
              onClick={
                handleClearDemo
              }
            >

              Limpiar datos

            </button>

          </div>

        </section>

      </main>

    </div>
  );
}


export default AdminSettings;