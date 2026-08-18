import {
  useEffect,
  useMemo,
  useState,
} from "react";

import DeveloperSidebar from "../../components/layout/DeveloperSidebar";

import {
  clearLogs,
  deleteLog,
  getLogs,
  getLogStats,
} from "../../services/logService";

import "../../styles/developerLogs.css";


function DeveloperLogs() {
  const [
    logs,
    setLogs,
  ] = useState([]);

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("Todos");

  const [
    levelFilter,
    setLevelFilter,
  ] = useState("Todos");

  const [
    search,
    setSearch,
  ] = useState("");


  const loadLogs = () => {
    setLogs(
      getLogs()
    );
  };


  useEffect(() => {
    loadLogs();
  }, []);


  const stats =
    getLogStats();


  const logTypes =
    useMemo(() => {
      return [
        ...new Set(
          logs
            .map(
              (log) =>
                log.type
            )
            .filter(
              Boolean
            )
        ),
      ].sort();
    }, [logs]);


  const filteredLogs =
    useMemo(() => {
      const cleanSearch =
        search
          .trim()
          .toLowerCase();


      return logs.filter(
        (log) => {
          const matchesType =
            typeFilter ===
              "Todos" ||
            log.type ===
              typeFilter;


          const matchesLevel =
            levelFilter ===
              "Todos" ||
            log.level ===
              levelFilter;


          const matchesSearch =
            !cleanSearch ||
            log.title
              ?.toLowerCase()
              .includes(
                cleanSearch
              ) ||
            log.description
              ?.toLowerCase()
              .includes(
                cleanSearch
              ) ||
            log.type
              ?.toLowerCase()
              .includes(
                cleanSearch
              );


          return (
            matchesType &&
            matchesLevel &&
            matchesSearch
          );
        }
      );
    }, [
      logs,
      typeFilter,
      levelFilter,
      search,
    ]);


  const handleDelete = (
    log
  ) => {
    const confirmed =
      window.confirm(
        `¿Eliminar el registro "${log.title}"?`
      );


    if (!confirmed) {
      return;
    }


    setLogs(
      deleteLog(
        log.id
      )
    );
  };


  const handleClearAll =
    () => {
      if (
        logs.length === 0
      ) {
        return;
      }


      const confirmed =
        window.confirm(
          "¿Seguro que quieres eliminar todo el historial de logs?"
        );


      if (!confirmed) {
        return;
      }


      clearLogs();

      setLogs([]);
    };


  const clearFilters =
    () => {
      setTypeFilter(
        "Todos"
      );

      setLevelFilter(
        "Todos"
      );

      setSearch("");
    };


  const getLevelLabel = (
    level
  ) => {
    if (
      level === "error"
    ) {
      return "Error";
    }


    if (
      level === "warning"
    ) {
      return "Advertencia";
    }


    return "Información";
  };


  return (
    <div className="developer-layout">

      <DeveloperSidebar />


      <main className="developer-main">

        <header className="developer-header developer-header--actions">

          <div>

            <span>
              Registro técnico
            </span>

            <h1>
              Logs
            </h1>

            <p>
              Historial de acciones,
              mantenimiento y eventos
              técnicos de La Toscana.
            </p>

          </div>


          <button
            type="button"
            className="developer-logs-refresh"
            onClick={
              loadLogs
            }
          >
            Actualizar
          </button>

        </header>


        <section className="developer-stats">

          <article>

            <span>
              Total
            </span>

            <strong>
              {
                stats.total
              }
            </strong>

            <p>
              Registros guardados
            </p>

          </article>


          <article>

            <span>
              Información
            </span>

            <strong>
              {
                stats.info
              }
            </strong>

            <p>
              Eventos normales
            </p>

          </article>


          <article>

            <span>
              Advertencias
            </span>

            <strong>
              {
                stats.warning
              }
            </strong>

            <p>
              Eventos a revisar
            </p>

          </article>


          <article>

            <span>
              Errores
            </span>

            <strong>
              {
                stats.error
              }
            </strong>

            <p>
              Problemas registrados
            </p>

          </article>

        </section>


        <section className="developer-panel">

          <div className="developer-panel__heading developer-logs-heading">

            <div>

              <span>
                Historial
              </span>

              <h2>
                Eventos registrados
              </h2>

            </div>


            <button
              type="button"
              className="developer-logs-clear"
              onClick={
                handleClearAll
              }
              disabled={
                logs.length === 0
              }
            >
              Vaciar historial
            </button>

          </div>


          <div className="developer-logs-filters">

            <input
              type="search"
              placeholder="Buscar..."
              value={search}
              onChange={
                (event) =>
                  setSearch(
                    event.target.value
                  )
              }
            />


            <select
              value={
                typeFilter
              }
              onChange={
                (event) =>
                  setTypeFilter(
                    event.target.value
                  )
              }
            >

              <option>
                Todos
              </option>


              {logTypes.map(
                (type) => (

                  <option
                    key={
                      type
                    }
                    value={
                      type
                    }
                  >
                    {type}
                  </option>

                )
              )}

            </select>


            <select
              value={
                levelFilter
              }
              onChange={
                (event) =>
                  setLevelFilter(
                    event.target.value
                  )
              }
            >

              <option>
                Todos
              </option>

              <option value="info">
                Información
              </option>

              <option value="warning">
                Advertencias
              </option>

              <option value="error">
                Errores
              </option>

            </select>


            <button
              type="button"
              onClick={
                clearFilters
              }
            >
              Limpiar filtros
            </button>

          </div>


          {filteredLogs.length ===
          0 ? (

            <div className="developer-logs-empty">

              <div>
                🧾
              </div>

              <h3>
                Sin registros
              </h3>

              <p>
                Todavía no existen logs
                o ninguno coincide con
                los filtros seleccionados.
              </p>

            </div>

          ) : (

            <div className="developer-logs-list">

              {filteredLogs.map(
                (log) => (

                  <article
                    className={`developer-log developer-log--${log.level}`}
                    key={
                      log.id
                    }
                  >

                    <div className="developer-log__marker"></div>


                    <div className="developer-log__content">

                      <div className="developer-log__top">

                        <div>

                          <span className="developer-log__type">
                            {
                              log.type
                            }
                          </span>

                          <span
                            className={`developer-log__level developer-log__level--${log.level}`}
                          >
                            {getLevelLabel(
                              log.level
                            )}
                          </span>

                        </div>


                        <time>

                          {new Date(
                            log.createdAt
                          ).toLocaleString(
                            "es-ES"
                          )}

                        </time>

                      </div>


                      <h3>
                        {
                          log.title
                        }
                      </h3>


                      {log.description && (

                        <p>
                          {
                            log.description
                          }
                        </p>

                      )}

                    </div>


                    <button
                      type="button"
                      className="developer-log__delete"
                      onClick={
                        () =>
                          handleDelete(
                            log
                          )
                      }
                    >
                      Eliminar
                    </button>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}


export default DeveloperLogs;