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
  createPayment,
} from "../../services/cashService";

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

  const [
    paymentTable,
    setPaymentTable,
  ] = useState(null);

  const [
    paymentAmount,
    setPaymentAmount,
  ] = useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("Tarjeta");

  const [
    paymentError,
    setPaymentError,
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
  MIGRACIÓN
  =========================
  */

  const runTableMigration =
    () => {
      const confirmed =
        window.confirm(
          "¿Quieres actualizar la distribución de mesas?"
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
        "Distribución de mesas actualizada correctamente."
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


    /*
     * Si intenta marcar como
     * completada desde el select
     * y hay una reserva,
     * usamos el flujo correcto.
     */
    if (
      newStatus === "Completada"
    ) {
      handleFinishRequest(
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
  ABRIR COBRO / FINALIZAR
  =========================
  */

  const handleFinishRequest = (
    table
  ) => {
    setMessage("");
    setPaymentError("");


    if (!table.bookingId) {
      /*
       * Mesa sin reserva:
       * simplemente la liberamos.
       */
      releaseTable(
        table.id
      );

      setMessage(
        `${table.name} liberada correctamente.`
      );

      return;
    }


    const booking =
      bookings.find(
        (item) =>
          item.id ===
          table.bookingId
      );


    if (!booking) {
      releaseTable(
        table.id
      );

      setMessage(
        `${table.name} liberada. La reserva asociada ya no existe.`
      );

      return;
    }


    /*
     * Si ya está pagada,
     * NO cobramos otra vez.
     */
    if (
      booking.paymentStatus ===
      "Pagado"
    ) {
      finalizeBookingAndTable(
        booking,
        table
      );

      return;
    }


    setPaymentTable(
      table
    );


    setPaymentAmount(
      booking.amount
        ? String(
            booking.amount
          )
        : ""
    );


    setPaymentMethod(
      booking.paymentMethod ||
      "Tarjeta"
    );
  };


  /*
  =========================
  COBRAR Y FINALIZAR
  =========================
  */

  const handlePayAndFinish =
    () => {
      setPaymentError("");


      if (!paymentTable) {
        return;
      }


      const booking =
        bookings.find(
          (item) =>
            item.id ===
            paymentTable.bookingId
        );


      if (!booking) {
        setPaymentError(
          "No se ha encontrado la reserva."
        );

        return;
      }


      const normalizedAmount =
        String(
          paymentAmount
        )
          .replace(",", ".")
          .trim();


      const amount =
        Number(
          normalizedAmount
        );


      if (
        !amount ||
        amount <= 0
      ) {
        setPaymentError(
          "Introduce un importe válido."
        );

        return;
      }


      /*
      =========================
      REGISTRAR EN CAJA
      =========================
      */

      const paymentResult =
        createPayment({
          bookingId:
            booking.id,

          visitId:
            null,

          customerId:
            booking.customerId ||
            null,

          customerName:
            booking.name ||
            "",

          amount,

          paymentMethod,

          concept:
            `Reserva · ${booking.name} · ${paymentTable.name}`,
        });


      if (
        !paymentResult.success
      ) {
        /*
         * createPayment impide
         * duplicar un cobro.
         */
        setPaymentError(
          paymentResult.message ||
          "No se pudo registrar el pago."
        );

        return;
      }


      /*
      =========================
      MARCAR RESERVA PAGADA
      Y FINALIZADA
      =========================
      */

      const now =
        new Date()
          .toISOString();


      const updatedBooking = {
        ...booking,

        paymentStatus:
          "Pagado",

        amount,

        paymentMethod,

        paidAt:
          now,

        status:
          "Finalizada",

        updatedAt:
          now,
      };


      updateBooking(
        updatedBooking
      );


      setBookings(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              updatedBooking.id
                ? updatedBooking
                : item
          )
      );


      /*
      =========================
      LIBERAR MESA
      =========================
      */

      releaseTable(
        paymentTable.id
      );


      /*
      =========================
      CERRAR MODAL
      =========================
      */

      setPaymentTable(
        null
      );

      setPaymentAmount(
        ""
      );

      setPaymentMethod(
        "Tarjeta"
      );

      setPaymentError(
        ""
      );


      setMessage(
        `${paymentTable.name} cobrada y finalizada correctamente. Pago registrado: ${amount.toFixed(
          2
        )} €.`
      );
    };


  /*
  =========================
  FINALIZAR YA PAGADA
  =========================
  */

  const finalizeBookingAndTable = (
    booking,
    table
  ) => {
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


    releaseTable(
      table.id
    );


    setMessage(
      `${table.name} finalizada y liberada. La reserva ya estaba pagada.`
    );
  };


  /*
  =========================
  LIBERAR MESA
  =========================
  */

  const releaseTable = (
    tableId
  ) => {
    const updatedTables =
      tables.map(
        (item) =>
          item.id ===
          tableId
            ? {
                ...item,

                status:
                  "Libre",

                bookingId:
                  null,

                visitId:
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


    releaseTable(
      table.id
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
  ESTADÍSTICAS
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


        {areaTables.length ===
        0 ? (

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
                    key={
                      table.id
                    }
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


                        <p>

                          Pago:{" "}

                          <strong>
                            {
                              assignedBooking.paymentStatus ||
                              "Pendiente"
                            }
                          </strong>

                        </p>


                        {assignedBooking.paymentStatus ===
                          "Pagado" &&
                          assignedBooking.amount >
                            0 && (

                          <p>

                            Importe:{" "}

                            {Number(
                              assignedBooking.amount
                            ).toFixed(
                              2
                            )}{" "}
                            €

                          </p>

                        )}


                        <div className="table-card__booking-actions">

                          <button
                            type="button"
                            className="table-complete-button"
                            onClick={
                              () =>
                                handleFinishRequest(
                                  table
                                )
                            }
                          >

                            {assignedBooking.paymentStatus ===
                            "Pagado"
                              ? "✓ Finalizar mesa"
                              : "💳 Cobrar y finalizar"}

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
              Gestiona las mesas,
              reservas y cobros desde
              el mismo lugar.
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


        {renderArea(
          "Interior",
          interiorTables
        )}


        {renderArea(
          "Terraza",
          terraceTables
        )}

      </main>


      {/* =========================
          MODAL COBRO
      ========================= */}

      {paymentTable && (

        <div
          className="customer-modal-overlay"
          onClick={
            () => {
              setPaymentTable(
                null
              );

              setPaymentError(
                ""
              );
            }
          }
        >

          <article
            className="customer-modal walkin-payment-modal"
            onClick={
              (event) =>
                event.stopPropagation()
            }
          >

            <button
              type="button"
              className="customer-modal__close"
              onClick={
                () => {
                  setPaymentTable(
                    null
                  );

                  setPaymentError(
                    ""
                  );
                }
              }
            >
              ×
            </button>


            <span className="customer-modal__label">
              Cobro de mesa
            </span>


            <h2>
              {
                paymentTable.name
              }
            </h2>


            {(() => {
              const booking =
                bookings.find(
                  (item) =>
                    item.id ===
                    paymentTable.bookingId
                );


              return booking ? (

                <p className="walkin-payment-info">

                  {booking.name}
                  {" · "}
                  {booking.guests} personas

                </p>

              ) : null;
            })()}


            <div className="walkin-form">

              <label>

                Importe total

                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={
                    paymentAmount
                  }
                  onChange={
                    (event) =>
                      setPaymentAmount(
                        event.target.value
                      )
                  }
                  autoFocus
                />

              </label>


              <label>

                Método de pago

                <select
                  value={
                    paymentMethod
                  }
                  onChange={
                    (event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                  }
                >

                  <option>
                    Tarjeta
                  </option>

                  <option>
                    Efectivo
                  </option>

                  <option>
                    Bizum
                  </option>

                  <option>
                    Transferencia
                  </option>

                </select>

              </label>


              {paymentError && (

                <div className="maintenance-message maintenance-message--error">
                  {paymentError}
                </div>

              )}


              <button
                type="button"
                className="walkin-pay-button"
                onClick={
                  handlePayAndFinish
                }
              >
                💳 Cobrar y finalizar mesa
              </button>

            </div>

          </article>

        </div>

      )}

    </div>
  );
}


export default AdminTables;