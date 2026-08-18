import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminSidebar from "../../components/layout/AdminSidebar";

import {
  getTables,
  saveTables,
} from "../../services/tableService";

import {
  getBookings,
  updateBooking,
} from "../../services/bookingService";

import {
  migrateTablesToNewLayout,
} from "../../services/tableMigrationService";


function AdminTables() {
  const [
    tables,
    setTables,
  ] = useState([]);

  const [
    bookings,
    setBookings,
  ] = useState([]);

  const [
    message,
    setMessage,
  ] = useState("");


  /*
  =========================
  CARGAR DATOS
  =========================
  */

  const loadData = () => {
    const loadedTables =
      getTables();

    const loadedBookings =
      getBookings();


    const activeBookingIds =
      new Set(
        loadedBookings
          .filter(
            (booking) =>
              booking.status !== "Cancelada" &&
              booking.status !== "Finalizada"
          )
          .map(
            (booking) =>
              booking.id
          )
      );


    const cleanedTables =
      loadedTables.map(
        (table) => {
          if (
            table.bookingId &&
            !activeBookingIds.has(
              table.bookingId
            )
          ) {
            return {
              ...table,

              status: "Libre",

              bookingId: null,
            };
          }

          return table;
        }
      );


    saveTables(
      cleanedTables
    );


    setTables(
      cleanedTables
    );


    setBookings(
      loadedBookings
    );
  };


  useEffect(() => {
    loadData();
  }, []);


  /*
  =========================
  RESERVAS ACTIVAS
  =========================
  */

  const activeBookings =
    useMemo(() => {
      return bookings.filter(
        (booking) =>
          booking.status !== "Cancelada" &&
          booking.status !== "Finalizada"
      );
    }, [bookings]);


  /*
  =========================
  INTERIOR / TERRAZA
  =========================
  */

  const interiorTables =
    useMemo(() => {
      return tables.filter(
        (table) =>
          table.area === "Interior"
      );
    }, [tables]);


  const terraceTables =
    useMemo(() => {
      return tables.filter(
        (table) =>
          table.area === "Terraza"
      );
    }, [tables]);


  /*
  =========================
  MIGRACIÓN A 10 MESAS
  =========================
  */

  const runTableMigration =
    () => {
      const confirmed =
        window.confirm(
          "¿Quieres actualizar la distribución a 5 mesas de interior y 5 mesas de terraza?"
        );


      if (!confirmed) {
        return;
      }


      const result =
        migrateTablesToNewLayout();


      if (!result.success) {
        setMessage(
          result.message ||
          "No se pudieron actualizar las mesas."
        );

        return;
      }


      loadData();


      setMessage(
        "Distribución actualizada correctamente: Mesas 1-5 en Interior y Mesas 6-10 en Terraza."
      );
    };


  /*
  =========================
  CAMBIAR ESTADO
  =========================
  */

  const handleStatusChange = (
    tableId,
    newStatus
  ) => {
    setMessage("");


    const table =
      tables.find(
        (item) =>
          item.id === tableId
      );


    if (!table) {
      return;
    }


    if (
      newStatus === "Completada"
    ) {
      handleCompleteBooking(
        table
      );

      return;
    }


    const updatedTables =
      tables.map(
        (item) =>
          item.id === tableId
            ? {
                ...item,

                status:
                  newStatus,

                bookingId:
                  newStatus === "Libre"
                    ? null
                    : item.bookingId,
              }
            : item
      );


    setTables(
      updatedTables
    );


    saveTables(
      updatedTables
    );
  };


  /*
  =========================
  ASIGNAR RESERVA
  =========================
  */

  const handleBookingAssignment = (
    tableId,
    bookingId
  ) => {
    setMessage("");


    const table =
      tables.find(
        (item) =>
          item.id === tableId
      );


    if (!table) {
      return;
    }


    const selectedBooking =
      bookings.find(
        (booking) =>
          booking.id ===
          bookingId
      );


    const updatedTables =
      tables.map(
        (item) => {
          if (
            item.id !==
            tableId
          ) {
            return item;
          }


          if (!bookingId) {
            return {
              ...item,

              bookingId:
                null,

              status:
                "Libre",
            };
          }


          return {
            ...item,

            bookingId,

            status:
              "Reservada",
          };
        }
      );


    setTables(
      updatedTables
    );


    saveTables(
      updatedTables
    );


    if (selectedBooking) {
      const updatedBooking = {
        ...selectedBooking,

        tableId:
          table.id,

        tableName:
          table.name,

        updatedAt:
          new Date()
            .toISOString(),
      };


      updateBooking(
        updatedBooking
      );


      setBookings(
        (current) =>
          current.map(
            (booking) =>
              booking.id ===
              bookingId
                ? updatedBooking
                : booking
          )
      );
    }
  };


  /*
  =========================
  COMPLETAR RESERVA
  =========================
  */

  const handleCompleteBooking = (
    table
  ) => {
    setMessage("");


    if (!table.bookingId) {
      const updatedTables =
        tables.map(
          (item) =>
            item.id === table.id
              ? {
                  ...item,

                  status:
                    "Libre",

                  bookingId:
                    null,
                }
              : item
        );


      setTables(
        updatedTables
      );


      saveTables(
        updatedTables
      );


      return;
    }


    const booking =
      bookings.find(
        (item) =>
          item.id ===
          table.bookingId
      );


    if (booking) {
      const updatedBooking = {
        ...booking,

        status:
          "Finalizada",

        updatedAt:
          new Date()
            .toISOString(),
      };


      updateBooking(
        updatedBooking
      );


      setBookings(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              booking.id
                ? updatedBooking
                : item
          )
      );
    }


    const updatedTables =
      tables.map(
        (item) =>
          item.id === table.id
            ? {
                ...item,

                status:
                  "Libre",

                bookingId:
                  null,
              }
            : item
      );


    setTables(
      updatedTables
    );


    saveTables(
      updatedTables
    );


    setMessage(
      `${table.name} liberada correctamente.`
    );
  };


  /*
  =========================
  CANCELAR RESERVA
  =========================
  */

  const handleCancelBooking = (
    table
  ) => {
    setMessage("");


    if (!table.bookingId) {
      return;
    }


    const booking =
      bookings.find(
        (item) =>
          item.id ===
          table.bookingId
      );


    if (!booking) {
      return;
    }


    const confirmed =
      window.confirm(
        `¿Cancelar la reserva de ${booking.name}?`
      );


    if (!confirmed) {
      return;
    }


    const updatedBooking = {
      ...booking,

      status:
        "Cancelada",

      updatedAt:
        new Date()
          .toISOString(),
    };


    updateBooking(
      updatedBooking
    );


    setBookings(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            booking.id
              ? updatedBooking
              : item
        )
    );


    const updatedTables =
      tables.map(
        (item) =>
          item.id === table.id
            ? {
                ...item,

                status:
                  "Libre",

                bookingId:
                  null,
              }
            : item
      );


    setTables(
      updatedTables
    );


    saveTables(
      updatedTables
    );


    setMessage(
      `Reserva de ${booking.name} cancelada y ${table.name} liberada.`
    );
  };


  /*
  =========================
  RESERVA ASIGNADA
  =========================
  */

  const getAssignedBooking =
    (table) =>
      bookings.find(
        (booking) =>
          booking.id ===
            table.bookingId &&
          booking.status !==
            "Cancelada" &&
          booking.status !==
            "Finalizada"
      );


  /*
  =========================
  ESTADÍSTICAS GENERALES
  =========================
  */

  const freeTables =
    tables.filter(
      (table) =>
        table.status === "Libre"
    ).length;


  const reservedTables =
    tables.filter(
      (table) =>
        table.status ===
        "Reservada"
    ).length;


  const occupiedTables =
    tables.filter(
      (table) =>
        table.status ===
        "Ocupada"
    ).length;


  /*
  =========================
  RENDERIZAR SALÓN
  =========================
  */

  const renderArea = (
    title,
    areaTables
  ) => {
    const free =
      areaTables.filter(
        (table) =>
          table.status === "Libre"
      ).length;


    const reserved =
      areaTables.filter(
        (table) =>
          table.status ===
          "Reservada"
      ).length;


    const occupied =
      areaTables.filter(
        (table) =>
          table.status ===
          "Ocupada"
      ).length;


    return (
      <section className="admin-panel tables-area">

        <div className="admin-panel__heading tables-area__heading">

          <div>

            <span>
              Salón
            </span>

            <h2>
              {title}
            </h2>

          </div>


          <div className="tables-area__summary">

            <span>
              {areaTables.length} mesas
            </span>

            <span>
              {free} libres
            </span>

            <span>
              {reserved} reservadas
            </span>

            <span>
              {occupied} ocupadas
            </span>

          </div>

        </div>


        {areaTables.length === 0 ? (

          <div className="tables-area__empty">

            No hay mesas configuradas
            en {title.toLowerCase()}.

          </div>

        ) : (

          <div className="tables-grid">

            {areaTables.map(
              (table) => {
                const assignedBooking =
                  getAssignedBooking(
                    table
                  );


                return (
                  <article
                    className={`table-card table-card--${table.status.toLowerCase()}`}
                    key={table.id}
                  >

                    <div className="table-card__top">

                      <div>

                        <span>
                          {table.area}
                        </span>

                        <h3>
                          {table.name}
                        </h3>

                      </div>


                      <div className="table-card__capacity">

                        {table.capacity} 👤

                      </div>

                    </div>


                    <div className="table-card__visual">

                      <div className="table-shape">
                        {table.id}
                      </div>

                    </div>


                    <div className="table-card__status">

                      <span>
                        Estado
                      </span>


                      <select
                        value={
                          table.status
                        }
                        onChange={
                          (event) =>
                            handleStatusChange(
                              table.id,
                              event.target.value
                            )
                        }
                      >

                        <option>
                          Libre
                        </option>

                        <option>
                          Reservada
                        </option>

                        <option>
                          Ocupada
                        </option>

                        <option>
                          Completada
                        </option>

                      </select>

                    </div>


                    <label className="table-card__booking">

                      Reserva asignada


                      <select
                        value={
                          table.bookingId ||
                          ""
                        }
                        onChange={
                          (event) =>
                            handleBookingAssignment(
                              table.id,
                              event.target.value
                            )
                        }
                      >

                        <option value="">
                          Sin reserva
                        </option>


                        {activeBookings.map(
                          (booking) => (

                            <option
                              value={
                                booking.id
                              }
                              key={
                                booking.id
                              }
                            >

                              {booking.name}
                              {" · "}
                              {booking.date}
                              {" · "}
                              {booking.time}
                              {" · "}
                              {booking.guests} pers.

                            </option>

                          )
                        )}

                      </select>

                    </label>


                    {assignedBooking && (

                      <div className="table-card__customer">

                        <span>
                          Cliente
                        </span>


                        <strong>
                          {
                            assignedBooking.name
                          }
                        </strong>


                        <p>
                          {
                            assignedBooking.guests
                          }{" "}
                          personas ·{" "}
                          {
                            assignedBooking.time
                          }
                        </p>


                        <p>
                          Estado:{" "}
                          {
                            assignedBooking.status
                          }
                        </p>


                        <div className="table-card__booking-actions">

                          <button
                            type="button"
                            className="table-complete-button"
                            onClick={
                              () =>
                                handleCompleteBooking(
                                  table
                                )
                            }
                          >
                            ✓ Completar
                          </button>


                          <button
                            type="button"
                            className="table-cancel-button"
                            onClick={
                              () =>
                                handleCancelBooking(
                                  table
                                )
                            }
                          >
                            Cancelar reserva
                          </button>

                        </div>

                      </div>

                    )}

                  </article>
                );
              }
            )}

          </div>

        )}

      </section>
    );
  };


  /*
  =========================
  RENDER PRINCIPAL
  =========================
  */

  return (
    <div className="admin-layout">

      <AdminSidebar />


      <main className="admin-main">

        <header className="admin-header admin-header--row">

          <div>

            <span>
              Salones
            </span>

            <h1>
              Mesas
            </h1>

            <p>
              Gestiona por separado las mesas
              de interior y terraza.
            </p>

          </div>


          <button
            type="button"
            className="admin-filter"
            onClick={
              runTableMigration
            }
          >
            Actualizar distribución
          </button>

        </header>


        {message && (

          <div className="settings-message">
            {message}
          </div>

        )}


        {/* RESUMEN GENERAL */}

        <section className="admin-stats">

          <article className="stat-card">

            <span>
              Mesas totales
            </span>

            <strong>
              {tables.length}
            </strong>

            <p>
              Capacidad completa del restaurante
            </p>

          </article>


          <article className="stat-card">

            <span>
              Libres
            </span>

            <strong>
              {freeTables}
            </strong>

            <p>
              Disponibles ahora mismo
            </p>

          </article>


          <article className="stat-card">

            <span>
              Reservadas
            </span>

            <strong>
              {reservedTables}
            </strong>

            <p>
              Asignadas a una reserva
            </p>

          </article>


          <article className="stat-card">

            <span>
              Ocupadas
            </span>

            <strong>
              {occupiedTables}
            </strong>

            <p>
              Clientes actualmente sentados
            </p>

          </article>

        </section>


        {/* INTERIOR */}

        {renderArea(
          "Interior",
          interiorTables
        )}


        {/* TERRAZA */}

        {renderArea(
          "Terraza",
          terraceTables
        )}

      </main>

    </div>
  );
}


export default AdminTables;