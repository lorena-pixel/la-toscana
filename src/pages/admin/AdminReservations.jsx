import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminSidebar from "../../components/layout/AdminSidebar";

import "../../styles/reservations.css";

import {
  getBookings,
  updateBooking,
} from "../../services/bookingService";

import {
  getTables,
  saveTables,
} from "../../services/tableService";

import {
  createPayment,
} from "../../services/cashService";


function AdminReservations() {
  const [bookings, setBookings] = useState([]);
  const [tables, setTables] = useState([]);

  const [activeTab, setActiveTab] = useState("Hoy");

  const [historySearch, setHistorySearch] = useState("");
  const [historyStatus, setHistoryStatus] = useState("Todos");

  const [payingBooking, setPayingBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tarjeta");

  const [message, setMessage] = useState("");


  const loadData = () => {
    setBookings(getBookings());
    setTables(getTables());
  };


  useEffect(() => {
    loadData();
  }, []);


  /*
  =========================
  FECHA LOCAL
  =========================
  */

  const today = useMemo(() => {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);


  /*
  =========================
  ORDENAR RESERVAS
  =========================
  */

  const sortBookings = (items) => {
    return [...items].sort((a, b) => {
      const first = `${a.date || ""} ${a.time || ""}`;
      const second = `${b.date || ""} ${b.time || ""}`;

      return first.localeCompare(second);
    });
  };


  /*
  =========================
  PENDIENTES GLOBALES
  =========================
  */

  const pendingBookings = useMemo(() => {
    return sortBookings(
      bookings.filter(
        (booking) =>
          booking.status === "Pendiente" &&
          booking.date >= today
      )
    );
  }, [bookings, today]);


  /*
  =========================
  RESERVAS DE HOY
  =========================
  */

  const todayBookings = useMemo(() => {
    return sortBookings(
      bookings.filter(
        (booking) =>
          booking.date === today &&
          booking.status !== "Cancelada"
      )
    );
  }, [bookings, today]);


  const todayPending = useMemo(() => {
    return todayBookings.filter(
      (booking) =>
        booking.status === "Pendiente"
    );
  }, [todayBookings]);


  const todayConfirmed = useMemo(() => {
    return todayBookings.filter(
      (booking) =>
        booking.status === "Confirmada"
    );
  }, [todayBookings]);


  const todaySeated = useMemo(() => {
    return todayBookings.filter(
      (booking) =>
        booking.status === "Sentada"
    );
  }, [todayBookings]);


  const todayFinished = useMemo(() => {
    return todayBookings.filter(
      (booking) =>
        booking.status === "Finalizada"
    );
  }, [todayBookings]);


  /*
  =========================
  PRÓXIMAS RESERVAS
  =========================
  */

  const upcomingBookings = useMemo(() => {
    return sortBookings(
      bookings.filter(
        (booking) =>
          booking.date > today &&
          booking.status !== "Finalizada" &&
          booking.status !== "Cancelada"
      )
    );
  }, [bookings, today]);


  /*
  =========================
  HISTORIAL
  =========================
  */

  const historyBookings = useMemo(() => {
    let result = bookings.filter(
      (booking) =>
        booking.status === "Finalizada" ||
        booking.status === "Cancelada"
    );

    if (historyStatus !== "Todos") {
      result = result.filter(
        (booking) =>
          booking.status === historyStatus
      );
    }

    const search = historySearch
      .trim()
      .toLowerCase();

    if (search) {
      result = result.filter((booking) => {
        return (
          booking.name
            ?.toLowerCase()
            .includes(search) ||
          booking.email
            ?.toLowerCase()
            .includes(search) ||
          booking.phone
            ?.toLowerCase()
            .includes(search)
        );
      });
    }

    return [...result].sort((a, b) => {
      const first = `${a.date || ""} ${a.time || ""}`;
      const second = `${b.date || ""} ${b.time || ""}`;

      return second.localeCompare(first);
    });
  }, [
    bookings,
    historySearch,
    historyStatus,
  ]);


  /*
  =========================
  CAMBIAR ESTADO
  =========================
  */

  const handleStatusChange = (
    booking,
    newStatus
  ) => {
    setMessage("");

    const updatedBooking = {
      ...booking,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    let updatedTables = [...tables];


    if (newStatus === "Sentada") {
      if (!booking.tableId) {
        setMessage(
          "Esta reserva no tiene una mesa asignada."
        );

        return;
      }

      updatedTables = tables.map((table) =>
        Number(table.id) === Number(booking.tableId)
          ? {
              ...table,
              status: "Ocupada",
              bookingId: booking.id,
            }
          : table
      );
    }


    if (newStatus === "Confirmada") {
      if (booking.tableId) {
        updatedTables = tables.map((table) =>
          Number(table.id) === Number(booking.tableId)
            ? {
                ...table,
                status: "Reservada",
                bookingId: booking.id,
              }
            : table
        );
      }
    }


    if (
      newStatus === "Finalizada" ||
      newStatus === "Cancelada"
    ) {
      updatedTables = tables.map((table) =>
        Number(table.id) === Number(booking.tableId)
          ? {
              ...table,
              status: "Libre",
              bookingId: null,
            }
          : table
      );
    }


    updateBooking(updatedBooking);
    saveTables(updatedTables);


    setBookings((current) =>
      current.map((item) =>
        item.id === booking.id
          ? updatedBooking
          : item
      )
    );


    setTables(updatedTables);
  };


  /*
  =========================
  COBRO
  =========================
  */

  const openPayment = (booking) => {
    setPayingBooking(booking);

    setPaymentAmount(
      booking.paidAmount || ""
    );

    setPaymentMethod(
      booking.paymentMethod || "Tarjeta"
    );

    setMessage("");
  };


  const closePayment = () => {
    setPayingBooking(null);
    setPaymentAmount("");
    setPaymentMethod("Tarjeta");
  };


  const handlePayment = (event) => {
    event.preventDefault();

    if (!payingBooking) {
      return;
    }


    if (
      !paymentAmount ||
      Number(paymentAmount) <= 0
    ) {
      setMessage(
        "Introduce un importe válido."
      );

      return;
    }


    const result = createPayment({
      bookingId: payingBooking.id,

      customerId:
        payingBooking.customerId,

      customerName:
        payingBooking.name,

      amount:
        Number(paymentAmount),

      paymentMethod,

      concept:
        `Reserva · ${payingBooking.name} · ${
          payingBooking.tableName || "Sin mesa"
        }`,
    });


    if (!result.success) {
      setMessage(result.message);
      return;
    }


    const updatedBooking = {
      ...payingBooking,

      paymentStatus: "Pagado",

      paidAmount:
        Number(paymentAmount),

      paymentMethod,

      paidAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    };


    updateBooking(updatedBooking);


    setBookings((current) =>
      current.map((item) =>
        item.id === updatedBooking.id
          ? updatedBooking
          : item
      )
    );


    setMessage(
      `Cobro de ${Number(
        paymentAmount
      ).toLocaleString(
        "es-ES",
        {
          style: "currency",
          currency: "EUR",
        }
      )} registrado correctamente.`
    );


    closePayment();
  };


  /*
  =========================
  FINALIZAR
  =========================
  */

  const handleFinalize = (booking) => {
    if (
      booking.paymentStatus !== "Pagado"
    ) {
      const confirmed = window.confirm(
        "Esta reserva todavía no está pagada. ¿Quieres finalizarla igualmente?"
      );

      if (!confirmed) {
        return;
      }
    }

    handleStatusChange(
      booking,
      "Finalizada"
    );
  };


  /*
  =========================
  CANCELAR
  =========================
  */

  const handleCancel = (booking) => {
    const confirmed = window.confirm(
      `¿Cancelar la reserva de ${booking.name}?`
    );

    if (!confirmed) {
      return;
    }

    handleStatusChange(
      booking,
      "Cancelada"
    );
  };


  /*
  =========================
  FORMATEAR DINERO
  =========================
  */

  const formatMoney = (value) => {
    return Number(
      value || 0
    ).toLocaleString(
      "es-ES",
      {
        style: "currency",
        currency: "EUR",
      }
    );
  };


  /*
  =========================
  TABLA REUTILIZABLE
  =========================
  */

  const renderBookingsTable = (
    items,
    emptyMessage
  ) => {
    if (items.length === 0) {
      return (
        <div className="admin-empty">
          {emptyMessage}
        </div>
      );
    }


    return (
      <div className="reservation-table-wrapper">

        <table className="reservation-table">

          <thead>

            <tr>

              <th>
                Cliente
              </th>

              <th>
                Fecha
              </th>

              <th>
                Hora
              </th>

              <th>
                Personas
              </th>

              <th>
                Mesa
              </th>

              <th>
                Estado
              </th>

              <th>
                Pago
              </th>

              <th>
                Acciones
              </th>

            </tr>

          </thead>


          <tbody>

            {items.map((booking) => (

              <tr key={booking.id}>

                <td>

                  <strong>
                    {booking.name}
                  </strong>

                  <span>
                    {booking.phone}
                  </span>

                  <span>
                    {booking.email}
                  </span>

                </td>


                <td>
                  {booking.date}
                </td>


                <td>
                  {booking.time}
                </td>


                <td>
                  {booking.guests}
                </td>


                <td>
                  {booking.tableName || "Sin asignar"}
                </td>


                <td>

                  <select
                    value={booking.status}
                    onChange={(event) =>
                      handleStatusChange(
                        booking,
                        event.target.value
                      )
                    }
                  >

                    <option>
                      Pendiente
                    </option>

                    <option>
                      Confirmada
                    </option>

                    <option>
                      Sentada
                    </option>

                    <option>
                      Finalizada
                    </option>

                    <option>
                      Cancelada
                    </option>

                  </select>

                </td>


                <td>

                  <span
                    className={
                      booking.paymentStatus === "Pagado"
                        ? "reservation-payment reservation-payment--paid"
                        : "reservation-payment reservation-payment--pending"
                    }
                  >

                    {booking.paymentStatus === "Pagado"
                      ? `Pagado · ${formatMoney(
                          booking.paidAmount
                        )}`
                      : "Pendiente"}

                  </span>

                </td>


                <td>

                  <div className="reservation-actions">

                    {booking.paymentStatus !== "Pagado" &&
                      booking.status !== "Cancelada" &&
                      booking.status !== "Finalizada" && (

                        <button
                          type="button"
                          className="reservation-pay-button"
                          onClick={() =>
                            openPayment(booking)
                          }
                        >
                          Cobrar
                        </button>

                      )}


                    {booking.status !== "Finalizada" &&
                      booking.status !== "Cancelada" && (

                        <button
                          type="button"
                          className="table-complete-button"
                          onClick={() =>
                            handleFinalize(booking)
                          }
                        >
                          Finalizar
                        </button>

                      )}


                    {booking.status !== "Cancelada" &&
                      booking.status !== "Finalizada" && (

                        <button
                          type="button"
                          className="table-cancel-button"
                          onClick={() =>
                            handleCancel(booking)
                          }
                        >
                          Cancelar
                        </button>

                      )}

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>
    );
  };


  /*
  =========================
  RENDER
  =========================
  */

  return (
    <div className="admin-layout">

      <AdminSidebar />


      <main className="admin-main">

        <header className="admin-header">

          <span>
            Gestión
          </span>

          <h1>
            Reservas
          </h1>

          <p>
            Gestiona las reservas actuales, próximas
            y el historial del restaurante.
          </p>

        </header>


        {message && (

          <div className="cash-message">
            {message}
          </div>

        )}


        {/* AVISO DE RESERVAS PENDIENTES */}

        {pendingBookings.length > 0 && (

          <section className="reservation-pending-alert">

            <div>

              <strong>
                ⚠️ {pendingBookings.length}{" "}
                {pendingBookings.length === 1
                  ? "reserva pendiente"
                  : "reservas pendientes"}{" "}
                de confirmación
              </strong>

              <span>
                Hay solicitudes que todavía necesitan revisión.
              </span>

            </div>

          </section>

        )}


        {/* PESTAÑAS */}

        <div className="reservation-tabs">

          <button
            type="button"
            className={
              activeTab === "Hoy"
                ? "reservation-tab reservation-tab--active"
                : "reservation-tab"
            }
            onClick={() =>
              setActiveTab("Hoy")
            }
          >
            Hoy
          </button>


          <button
            type="button"
            className={
              activeTab === "Proximas"
                ? "reservation-tab reservation-tab--active"
                : "reservation-tab"
            }
            onClick={() =>
              setActiveTab("Proximas")
            }
          >
            Próximas

            {upcomingBookings.length > 0 &&
              ` (${upcomingBookings.length})`}
          </button>


          <button
            type="button"
            className={
              activeTab === "Historial"
                ? "reservation-tab reservation-tab--active"
                : "reservation-tab"
            }
            onClick={() =>
              setActiveTab("Historial")
            }
          >
            Historial
          </button>

        </div>


        {/* =========================
            HOY
        ========================= */}

        {activeTab === "Hoy" && (

          <>

            <section className="admin-panel reservation-section">

              <div className="admin-panel__heading">

                <div>

                  <span>
                    Requieren atención
                  </span>

                  <h2>
                    🔴 Pendientes de confirmar ({todayPending.length})
                  </h2>

                </div>

              </div>


              {renderBookingsTable(
                todayPending,
                "No hay reservas pendientes de confirmación para hoy."
              )}

            </section>


            <section className="admin-panel reservation-section">

              <div className="admin-panel__heading">

                <div>

                  <span>
                    Preparadas
                  </span>

                  <h2>
                    🟢 Confirmadas ({todayConfirmed.length})
                  </h2>

                </div>

              </div>


              {renderBookingsTable(
                todayConfirmed,
                "No hay reservas confirmadas para hoy."
              )}

            </section>


            <section className="admin-panel reservation-section">

              <div className="admin-panel__heading">

                <div>

                  <span>
                    Ahora
                  </span>

                  <h2>
                    🍽️ En el restaurante ({todaySeated.length})
                  </h2>

                </div>

              </div>


              {renderBookingsTable(
                todaySeated,
                "No hay clientes con reserva sentados actualmente."
              )}

            </section>


            <section className="admin-panel reservation-section">

              <div className="admin-panel__heading">

                <div>

                  <span>
                    Completadas
                  </span>

                  <h2>
                    ✅ Finalizadas hoy ({todayFinished.length})
                  </h2>

                </div>

              </div>


              {renderBookingsTable(
                todayFinished,
                "Todavía no hay reservas finalizadas hoy."
              )}

            </section>

          </>

        )}


        {/* =========================
            PRÓXIMAS
        ========================= */}

        {activeTab === "Proximas" && (

          <section className="admin-panel">

            <div className="admin-panel__heading">

              <div>

                <span>
                  Próximos días
                </span>

                <h2>
                  Próximas reservas ({upcomingBookings.length})
                </h2>

              </div>

            </div>


            {renderBookingsTable(
              upcomingBookings,
              "No hay próximas reservas."
            )}

          </section>

        )}


        {/* =========================
            HISTORIAL
        ========================= */}

        {activeTab === "Historial" && (

          <section className="admin-panel">

            <div className="admin-panel__heading">

              <div>

                <span>
                  Archivo
                </span>

                <h2>
                  Historial de reservas
                </h2>

              </div>

            </div>


            <div className="reservation-history-filters">

              <input
                type="search"
                placeholder="Buscar cliente, teléfono o email..."
                value={historySearch}
                onChange={(event) =>
                  setHistorySearch(
                    event.target.value
                  )
                }
              />


              <select
                value={historyStatus}
                onChange={(event) =>
                  setHistoryStatus(
                    event.target.value
                  )
                }
              >

                <option value="Todos">
                  Todas
                </option>

                <option value="Finalizada">
                  Finalizadas
                </option>

                <option value="Cancelada">
                  Canceladas
                </option>

              </select>

            </div>


            {renderBookingsTable(
              historyBookings,
              "No se han encontrado reservas en el historial."
            )}

          </section>

        )}


        {/* =========================
            MODAL DE COBRO
        ========================= */}

        {payingBooking && (

          <div
            className="customer-modal-overlay"
            onClick={closePayment}
          >

            <article
              className="customer-modal reservation-payment-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                className="customer-modal__close"
                type="button"
                onClick={closePayment}
              >
                ×
              </button>


              <span className="customer-modal__label">
                Cobrar reserva
              </span>


              <h2>
                {payingBooking.name}
              </h2>


              <p className="reservation-payment-info">

                {payingBooking.tableName || "Sin mesa"}
                {" · "}
                {payingBooking.guests}
                {" personas"}

              </p>


              <form
                className="walkin-form"
                onSubmit={handlePayment}
              >

                <label>

                  Importe (€)

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(event) =>
                      setPaymentAmount(
                        event.target.value
                      )
                    }
                    placeholder="0,00"
                    autoFocus
                  />

                </label>


                <label>

                  Método de pago

                  <select
                    value={paymentMethod}
                    onChange={(event) =>
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


                <button
                  className="cash-primary-button"
                  type="submit"
                >
                  Registrar cobro
                </button>

              </form>

            </article>

          </div>

        )}

      </main>

    </div>
  );
}


export default AdminReservations;