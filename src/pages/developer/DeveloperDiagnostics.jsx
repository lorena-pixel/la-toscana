import {
  useEffect,
  useState,
} from "react";

import DeveloperSidebar from "../../components/layout/DeveloperSidebar";

import {
  runSystemDiagnostics,
} from "../../services/diagnosticsService";

import "../../styles/developerDiagnostics.css";


function DeveloperDiagnostics() {
  const [
    report,
    setReport,
  ] = useState(null);


  const runDiagnostics =
    () => {
      const result =
        runSystemDiagnostics();

      setReport(
        result
      );
    };


  useEffect(() => {
    runDiagnostics();
  }, []);


  if (!report) {
    return null;
  }


  const statusContent = {
    healthy: {
      icon: "✓",
      title:
        "Sistema correcto",

      description:
        "No se han detectado problemas de integridad en los datos.",
    },

    warning: {
      icon: "⚠",
      title:
        "Sistema con advertencias",

      description:
        "La aplicación funciona, pero hay datos que conviene revisar.",
    },

    error: {
      icon: "!",
      title:
        "Se han detectado errores",

      description:
        "Hay referencias de datos que deberían revisarse antes de continuar.",
    },
  };


  const currentStatus =
    statusContent[
      report.status
    ];


  return (
    <div className="developer-layout">

      <DeveloperSidebar />


      <main className="developer-main">

        <header className="developer-header developer-header--actions">

          <div>

            <span>
              Integridad de datos
            </span>

            <h1>
              Diagnóstico
            </h1>

            <p>
              Comprueba relaciones entre clientes,
              reservas, mesas, entradas directas y caja.
            </p>

          </div>


          <button
            type="button"
            className="diagnostics-refresh"
            onClick={
              runDiagnostics
            }
          >
            Volver a comprobar
          </button>

        </header>


        <section
          className={`diagnostics-status diagnostics-status--${report.status}`}
        >

          <div className="diagnostics-status__icon">

            {currentStatus.icon}

          </div>


          <div>

            <strong>
              {currentStatus.title}
            </strong>

            <p>
              {currentStatus.description}
            </p>

          </div>


          <span className="diagnostics-status__time">

            {new Date(
              report.checkedAt
            ).toLocaleString(
              "es-ES"
            )}

          </span>

        </section>


        <section className="developer-stats">

          <article>

            <span>
              Errores
            </span>

            <strong>
              {
                report.totals.errors
              }
            </strong>

            <p>
              Requieren revisión
            </p>

          </article>


          <article>

            <span>
              Advertencias
            </span>

            <strong>
              {
                report.totals.warnings
              }
            </strong>

            <p>
              Conviene comprobarlas
            </p>

          </article>


          <article>

            <span>
              Clientes
            </span>

            <strong>
              {
                report.totals.customers
              }
            </strong>

            <p>
              Registros analizados
            </p>

          </article>


          <article>

            <span>
              Reservas
            </span>

            <strong>
              {
                report.totals.bookings
              }
            </strong>

            <p>
              Registros analizados
            </p>

          </article>


          <article>

            <span>
              Visitas
            </span>

            <strong>
              {
                report.totals.visits
              }
            </strong>

            <p>
              Registros analizados
            </p>

          </article>


          <article>

            <span>
              Caja
            </span>

            <strong>
              {
                report.totals.movements
              }
            </strong>

            <p>
              Movimientos analizados
            </p>

          </article>

        </section>


        {report.errors.length >
          0 && (

          <section className="developer-panel diagnostics-section">

            <div className="developer-panel__heading">

              <span>
                Atención
              </span>

              <h2>
                Errores detectados
              </h2>

            </div>


            <div className="diagnostics-list">

              {report.errors.map(
                (item) => (

                  <article
                    className="diagnostics-item diagnostics-item--error"
                    key={
                      item.id
                    }
                  >

                    <div>

                      <span>
                        {
                          item.category
                        }
                      </span>

                      <strong>
                        {
                          item.title
                        }
                      </strong>

                      <p>
                        {
                          item.description
                        }
                      </p>

                    </div>

                  </article>

                )
              )}

            </div>

          </section>

        )}


        {report.warnings.length >
          0 && (

          <section className="developer-panel diagnostics-section">

            <div className="developer-panel__heading">

              <span>
                Revisión
              </span>

              <h2>
                Advertencias
              </h2>

            </div>


            <div className="diagnostics-list">

              {report.warnings.map(
                (item) => (

                  <article
                    className="diagnostics-item diagnostics-item--warning"
                    key={
                      item.id
                    }
                  >

                    <div>

                      <span>
                        {
                          item.category
                        }
                      </span>

                      <strong>
                        {
                          item.title
                        }
                      </strong>

                      <p>
                        {
                          item.description
                        }
                      </p>

                    </div>

                  </article>

                )
              )}

            </div>

          </section>

        )}


        {report.errors.length ===
          0 &&
        report.warnings.length ===
          0 && (

          <section className="developer-panel diagnostics-clean">

            <div className="diagnostics-clean__icon">
              ✓
            </div>

            <h2>
              Todo correcto
            </h2>

            <p>
              No se han encontrado referencias
              rotas, duplicados ni estados
              incoherentes.
            </p>

          </section>

        )}

      </main>

    </div>
  );
}


export default DeveloperDiagnostics;