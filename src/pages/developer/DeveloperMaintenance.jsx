import {
  useEffect,
  useState,
} from "react";

import DeveloperSidebar from "../../components/layout/DeveloperSidebar";

import {
  applyAllSafeRepairs,
  applySafeRepair,
  createMaintenanceBackup,
  getSafeRepairs,
} from "../../services/maintenanceService";

import {
  runSystemDiagnostics,
} from "../../services/diagnosticsService";

import "../../styles/developerMaintenance.css";


function DeveloperMaintenance() {
  const [
    repairs,
    setRepairs,
  ] = useState([]);

  const [
    diagnostics,
    setDiagnostics,
  ] = useState(null);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");


  const loadData = () => {
    const safeRepairs =
      getSafeRepairs();

    const diagnosticReport =
      runSystemDiagnostics();

    setRepairs(
      safeRepairs
    );

    setDiagnostics(
      diagnosticReport
    );
  };


  useEffect(() => {
    loadData();
  }, []);


  const handleRepair = (
    repair
  ) => {
    setMessage("");
    setError("");


    const confirmed =
      window.confirm(
        `¿Quieres aplicar esta reparación?

${repair.title}

${repair.description}`
      );


    if (!confirmed) {
      return;
    }


    const backupResult =
      createMaintenanceBackup();


    if (
      !backupResult.success
    ) {
      setError(
        "No se pudo crear la copia de seguridad. La reparación se ha cancelado."
      );

      return;
    }


    const result =
      applySafeRepair(
        repair
      );


    if (
      !result.success
    ) {
      setError(
        result.message ||
          "No se pudo aplicar la reparación."
      );

      return;
    }


    setMessage(
      "Reparación aplicada correctamente. Se ha creado una copia de seguridad automática antes del cambio."
    );


    loadData();
  };


  const handleRepairAll = () => {
    setMessage("");
    setError("");


    if (
      repairs.length === 0
    ) {
      setMessage(
        "No hay problemas reparables automáticamente."
      );

      return;
    }


    const confirmed =
      window.confirm(
        `Se van a reparar ${repairs.length} problemas considerados seguros.

Antes se creará una copia de seguridad automática.

¿Quieres continuar?`
      );


    if (!confirmed) {
      return;
    }


    const result =
      applyAllSafeRepairs();


    if (
      !result.success
    ) {
      setError(
        result.message ||
          "No se pudieron aplicar las reparaciones."
      );

      return;
    }


    setMessage(
      result.message
    );


    loadData();
  };


  const handleBackupOnly = () => {
    setMessage("");
    setError("");


    const result =
      createMaintenanceBackup();


    if (
      !result.success
    ) {
      setError(
        result.message ||
          "No se pudo crear la copia de seguridad."
      );

      return;
    }


    setMessage(
      "Copia de seguridad de mantenimiento creada correctamente."
    );
  };


  const importantProblems =
    diagnostics
      ? diagnostics.errors.length +
        diagnostics.warnings.length
      : 0;


  return (
    <div className="developer-layout">

      <DeveloperSidebar />


      <main className="developer-main">

        <header className="developer-header developer-header--actions">

          <div>

            <span>
              Herramientas técnicas
            </span>

            <h1>
              Mantenimiento
            </h1>

            <p>
              Repara inconsistencias seguras
              sin eliminar información importante
              del restaurante.
            </p>

          </div>


          <button
            type="button"
            className="maintenance-refresh"
            onClick={
              loadData
            }
          >
            Volver a comprobar
          </button>

        </header>


        {message && (

          <div className="maintenance-message maintenance-message--success">
            {message}
          </div>

        )}


        {error && (

          <div className="maintenance-message maintenance-message--error">
            {error}
          </div>

        )}


        <section className="developer-stats">

          <article>

            <span>
              Problemas detectados
            </span>

            <strong>
              {
                importantProblems
              }
            </strong>

            <p>
              Diagnóstico actual
            </p>

          </article>


          <article>

            <span>
              Reparables
            </span>

            <strong>
              {
                repairs.length
              }
            </strong>

            <p>
              Correcciones automáticas seguras
            </p>

          </article>


          <article>

            <span>
              Errores
            </span>

            <strong>
              {
                diagnostics?.errors
                  ?.length || 0
              }
            </strong>

            <p>
              Requieren atención
            </p>

          </article>


          <article>

            <span>
              Advertencias
            </span>

            <strong>
              {
                diagnostics?.warnings
                  ?.length || 0
              }
            </strong>

            <p>
              Conviene revisarlas
            </p>

          </article>

        </section>


        <section className="developer-panel maintenance-actions-panel">

          <div className="developer-panel__heading">

            <span>
              Seguridad
            </span>

            <h2>
              Acciones generales
            </h2>

          </div>


          <div className="maintenance-main-actions">

            <button
              type="button"
              className="maintenance-backup-button"
              onClick={
                handleBackupOnly
              }
            >
              Crear backup manual
            </button>


            <button
              type="button"
              className="maintenance-repair-all"
              onClick={
                handleRepairAll
              }
              disabled={
                repairs.length === 0
              }
            >
              Reparar problemas seguros
            </button>

          </div>


          <p className="maintenance-security-note">
            Las reparaciones automáticas no
            eliminan reservas, clientes ni
            movimientos económicos válidos.
            Antes de una reparación múltiple se
            crea una copia de seguridad.
          </p>

        </section>


        <section className="developer-panel">

          <div className="developer-panel__heading">

            <span>
              Reparaciones
            </span>

            <h2>
              Problemas reparables
            </h2>

          </div>


          {repairs.length ===
          0 ? (

            <div className="maintenance-empty">

              <div className="maintenance-empty__icon">
                ✓
              </div>

              <h3>
                No hay reparaciones pendientes
              </h3>

              <p>
                No se han encontrado problemas
                que puedan corregirse
                automáticamente.
              </p>

            </div>

          ) : (

            <div className="maintenance-repair-list">

              {repairs.map(
                (repair) => (

                  <article
                    className="maintenance-repair-card"
                    key={
                      repair.id
                    }
                  >

                    <div className="maintenance-repair-card__content">

                      <span>
                        {
                          repair.category
                        }
                      </span>

                      <h3>
                        {
                          repair.title
                        }
                      </h3>

                      <p>
                        {
                          repair.description
                        }
                      </p>

                    </div>


                    <button
                      type="button"
                      onClick={
                        () =>
                          handleRepair(
                            repair
                          )
                      }
                    >
                      Reparar
                    </button>

                  </article>

                )
              )}

            </div>

          )}

        </section>


        <section className="developer-panel maintenance-manual-panel">

          <div className="developer-panel__heading">

            <span>
              Revisión manual
            </span>

            <h2>
              Problemas no automáticos
            </h2>

          </div>


          <p>
            Algunos casos no deben modificarse
            automáticamente porque pueden
            requerir una decisión humana.
          </p>


          <div className="maintenance-manual-list">

            <div>

              <strong>
                Clientes duplicados
              </strong>

              <span>
                Hay que decidir qué ficha conservar
                antes de fusionar información.
              </span>

            </div>


            <div>

              <strong>
                Reserva con cliente inexistente
              </strong>

              <span>
                Es necesario decidir si se crea
                una ficha nueva o se vincula a
                otro cliente.
              </span>

            </div>


            <div>

              <strong>
                Datos económicos históricos
              </strong>

              <span>
                Nunca se eliminan automáticamente
                porque podrían formar parte del
                historial real de caja.
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


export default DeveloperMaintenance;