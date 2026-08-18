import {
  useEffect,
  useState,
} from "react";

import DeveloperSidebar from "../../components/layout/DeveloperSidebar";

import {
  getBookings,
} from "../../services/bookingService";

import {
  getTables,
} from "../../services/tableService";

import {
  getVisits,
} from "../../services/visitService";

import {
  getCashMovements,
} from "../../services/cashService";

import {
  getCustomers,
} from "../../services/customerService";

import "../../styles/developer.css";


function DeveloperDashboard() {
  const [
    stats,
    setStats,
  ] = useState({
    customers: 0,
    bookings: 0,
    visits: 0,
    movements: 0,
    tables: 0,
  });


  const [
    storageSize,
    setStorageSize,
  ] = useState(0);


  const [
    lastCheck,
    setLastCheck,
  ] = useState(null);


  const calculateStorage =
    () => {
      let bytes = 0;


      for (
        let index = 0;
        index <
        localStorage.length;
        index++
      ) {
        const key =
          localStorage.key(
            index
          );

        const value =
          localStorage.getItem(
            key
          );


        bytes +=
          (key?.length || 0) +
          (value?.length ||
            0);
      }


      return bytes * 2;
    };


  const formatBytes = (
    bytes
  ) => {
    if (bytes === 0) {
      return "0 KB";
    }


    if (bytes < 1024) {
      return `${bytes} B`;
    }


    if (
      bytes <
      1024 * 1024
    ) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }


    return `${(
      bytes /
      1024 /
      1024
    ).toFixed(2)} MB`;
  };


  const loadSystemData =
    () => {
      const customers =
        getCustomers();

      const bookings =
        getBookings();

      const visits =
        getVisits();

      const movements =
        getCashMovements();

      const tables =
        getTables();


      setStats({
        customers:
          customers.length,

        bookings:
          bookings.length,

        visits:
          visits.length,

        movements:
          movements.length,

        tables:
          tables.length,
      });


      setStorageSize(
        calculateStorage()
      );


      setLastCheck(
        new Date()
      );
    };


  useEffect(() => {
    loadSystemData();
  }, []);


  return (
    <div className="developer-layout">

      <DeveloperSidebar />


      <main className="developer-main">

        <header className="developer-header">

          <span>
            Supervisión técnica
          </span>

          <h1>
            Estado del sistema
          </h1>

          <p>
            Información técnica de
            La Toscana.
          </p>

        </header>


        <section className="developer-status-banner">

          <div className="developer-status-banner__dot"></div>


          <div>

            <strong>
              Sistema operativo
            </strong>

            <span>
              Los servicios locales se han cargado correctamente.
            </span>

          </div>


          <button
            type="button"
            onClick={
              loadSystemData
            }
          >
            Comprobar ahora
          </button>

        </section>


        <section className="developer-stats">

          <article>

            <span>
              Clientes
            </span>

            <strong>
              {
                stats.customers
              }
            </strong>

            <p>
              Fichas almacenadas
            </p>

          </article>


          <article>

            <span>
              Reservas
            </span>

            <strong>
              {
                stats.bookings
              }
            </strong>

            <p>
              Registros totales
            </p>

          </article>


          <article>

            <span>
              Visitas
            </span>

            <strong>
              {
                stats.visits
              }
            </strong>

            <p>
              Entradas directas
            </p>

          </article>


          <article>

            <span>
              Caja
            </span>

            <strong>
              {
                stats.movements
              }
            </strong>

            <p>
              Movimientos registrados
            </p>

          </article>


          <article>

            <span>
              Mesas
            </span>

            <strong>
              {
                stats.tables
              }
            </strong>

            <p>
              Mesas configuradas
            </p>

          </article>


          <article>

            <span>
              Almacenamiento
            </span>

            <strong>
              {formatBytes(
                storageSize
              )}
            </strong>

            <p>
              Datos locales utilizados
            </p>

          </article>

        </section>


        <div className="developer-grid">

          <section className="developer-panel">

            <div className="developer-panel__heading">

              <span>
                Sistema
              </span>

              <h2>
                Información técnica
              </h2>

            </div>


            <div className="developer-info-list">

              <div>

                <span>
                  Aplicación
                </span>

                <strong>
                  La Toscana
                </strong>

              </div>


              <div>

                <span>
                  Frontend
                </span>

                <strong>
                  React + Vite
                </strong>

              </div>


              <div>

                <span>
                  Persistencia
                </span>

                <strong>
                  LocalStorage
                </strong>

              </div>


              <div>

                <span>
                  Entorno
                </span>

                <strong>
                  Demo / Portfolio
                </strong>

              </div>


              <div>

                <span>
                  Última comprobación
                </span>

                <strong>

                  {lastCheck
                    ? lastCheck.toLocaleString(
                        "es-ES"
                      )
                    : "Sin comprobar"}

                </strong>

              </div>

            </div>

          </section>


          <section className="developer-panel">

            <div className="developer-panel__heading">

              <span>
                Mantenimiento
              </span>

              <h2>
                Acciones rápidas
              </h2>

            </div>


            <div className="developer-actions">

              <button
                type="button"
                onClick={
                  () =>
                    navigateTo(
                      "/developer/backups"
                    )
                }
              >
                Copias de seguridad
              </button>


              <button
                type="button"
                onClick={
                  () =>
                    navigateTo(
                      "/developer/mantenimiento"
                    )
                }
              >
                Herramientas
              </button>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}


function navigateTo(
  destination
) {
  window.location.href =
    destination;
}


export default DeveloperDashboard;