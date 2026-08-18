import {
  useRef,
  useState,
} from "react";

import DeveloperSidebar from "../../components/layout/DeveloperSidebar";

import {
  createBackupData,
  downloadBackup,
  getBackupSummary,
  readBackupFile,
  restoreBackup,
  validateBackup,
} from "../../services/backupService";

import "../../styles/developer.css";


function DeveloperBackups() {
  const fileInputRef =
    useRef(null);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedBackup,
    setSelectedBackup,
  ] = useState(null);


  const currentBackup =
    createBackupData();

  const currentSummary =
    getBackupSummary(
      currentBackup
    );


  const handleDownload =
    () => {
      setMessage("");
      setError("");

      const result =
        downloadBackup();

      if (
        result.success
      ) {
        setMessage(
          `Copia creada correctamente: ${result.filename}`
        );
      }
    };


  const handleFileSelect =
    async (
      event
    ) => {
      setMessage("");
      setError("");

      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      try {
        const backup =
          await readBackupFile(
            file
          );

        const validation =
          validateBackup(
            backup
          );

        if (
          !validation.valid
        ) {
          setSelectedBackup(
            null
          );

          setError(
            validation.message
          );

          return;
        }

        setSelectedBackup(
          backup
        );

        setMessage(
          "Archivo de copia válido. Puedes restaurarlo."
        );
      } catch (
        fileError
      ) {
        setSelectedBackup(
          null
        );

        setError(
          fileError.message
        );
      }
    };


  const handleRestore =
    () => {
      if (
        !selectedBackup
      ) {
        return;
      }

      const summary =
        getBackupSummary(
          selectedBackup
        );

      const confirmed =
        window.confirm(
          `Vas a sustituir los datos actuales por esta copia:

${summary.customers} clientes
${summary.bookings} reservas
${summary.visits} visitas
${summary.cash} movimientos de caja
${summary.tables} mesas
${summary.menu} platos

¿Quieres continuar?`
        );

      if (!confirmed) {
        return;
      }

      /*
       * Creamos copia automática
       * antes de restaurar.
       */
      downloadBackup();

      const result =
        restoreBackup(
          selectedBackup
        );

      if (
        !result.success
      ) {
        setError(
          result.message
        );

        return;
      }

      setError("");

      setMessage(
        "Copia restaurada correctamente. Se ha creado también una copia automática de los datos anteriores."
      );

      setSelectedBackup(
        null
      );

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    };


  const selectedSummary =
    selectedBackup
      ? getBackupSummary(
          selectedBackup
        )
      : null;


  return (
    <div className="developer-layout">

      <DeveloperSidebar />


      <main className="developer-main">

        <header className="developer-header">

          <span>
            Protección de datos
          </span>

          <h1>
            Copias de seguridad
          </h1>

          <p>
            Crea y restaura copias completas
            de los datos del restaurante.
          </p>

        </header>


        {message && (

          <div className="developer-backup-message developer-backup-message--success">
            {message}
          </div>

        )}


        {error && (

          <div className="developer-backup-message developer-backup-message--error">
            {error}
          </div>

        )}


        <section className="developer-panel">

          <div className="developer-panel__heading">

            <span>
              Estado actual
            </span>

            <h2>
              Datos incluidos en la copia
            </h2>

          </div>


          <div className="developer-stats">

            <article>

              <span>
                Clientes
              </span>

              <strong>
                {
                  currentSummary.customers
                }
              </strong>

              <p>
                Fichas
              </p>

            </article>


            <article>

              <span>
                Reservas
              </span>

              <strong>
                {
                  currentSummary.bookings
                }
              </strong>

              <p>
                Registros
              </p>

            </article>


            <article>

              <span>
                Visitas
              </span>

              <strong>
                {
                  currentSummary.visits
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
                  currentSummary.cash
                }
              </strong>

              <p>
                Movimientos
              </p>

            </article>


            <article>

              <span>
                Mesas
              </span>

              <strong>
                {
                  currentSummary.tables
                }
              </strong>

              <p>
                Configuradas
              </p>

            </article>


            <article>

              <span>
                Carta
              </span>

              <strong>
                {
                  currentSummary.menu
                }
              </strong>

              <p>
                Productos
              </p>

            </article>

          </div>


          <button
            type="button"
            className="developer-backup-primary"
            onClick={
              handleDownload
            }
          >
            Crear copia de seguridad
          </button>

        </section>


        <section className="developer-panel developer-backup-restore">

          <div className="developer-panel__heading">

            <span>
              Recuperación
            </span>

            <h2>
              Restaurar una copia
            </h2>

          </div>


          <p className="developer-backup-description">

            Selecciona un archivo JSON creado
            anteriormente desde este panel.
            Antes de restaurarlo se realizará
            automáticamente una copia de los
            datos actuales.

          </p>


          <input
            ref={
              fileInputRef
            }
            type="file"
            accept=".json,application/json"
            onChange={
              handleFileSelect
            }
          />


          {selectedSummary && (

            <div className="developer-backup-preview">

              <h3>
                Copia preparada
              </h3>


              <div>

                <span>
                  Fecha
                </span>

                <strong>

                  {selectedSummary.createdAt
                    ? new Date(
                        selectedSummary.createdAt
                      ).toLocaleString(
                        "es-ES"
                      )
                    : "Sin fecha"}

                </strong>

              </div>


              <div>

                <span>
                  Clientes
                </span>

                <strong>
                  {
                    selectedSummary.customers
                  }
                </strong>

              </div>


              <div>

                <span>
                  Reservas
                </span>

                <strong>
                  {
                    selectedSummary.bookings
                  }
                </strong>

              </div>


              <div>

                <span>
                  Visitas
                </span>

                <strong>
                  {
                    selectedSummary.visits
                  }
                </strong>

              </div>


              <div>

                <span>
                  Movimientos
                </span>

                <strong>
                  {
                    selectedSummary.cash
                  }
                </strong>

              </div>


              <button
                type="button"
                className="developer-backup-danger"
                onClick={
                  handleRestore
                }
              >
                Restaurar esta copia
              </button>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}


export default DeveloperBackups;