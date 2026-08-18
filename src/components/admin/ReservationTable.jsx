import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminSidebar from "../../components/layout/AdminSidebar";
import EmptyState from "../../components/admin/EmptyState";

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
  const [bookings, setBookings] =
    useState([]);

  const [tables, setTables] =
    useState([]);

  const [statusFilter, setStatusFilter] =
    useState("Todas");

  const [payingBooking, setPayingBooking] =
    useState(null);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("Tarjeta");

  const [message, setMessage] =
    useState("");

  const loadData = () => {
    setBookings(getBookings());
    setTables(getTables());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBookings =
    useMemo(() => {
      const sorted = [...bookings].sort(
        (a, b) => {
          const first =
            `${a.date || ""} ${a.time || ""}`;

          const second =
            `${b.date || ""} ${b.time || ""}`;

          return first.localeCompare(second);
        }
      );

      if (statusFilter === "Todas") {
        return sorted;
      }

      return sorted.filter(
        (booking) =>
          booking.status === statusFilter
      );
    }, [bookings, statusFilter]);

  const handleStatusChange = (
    booking,
    newStatus
  ) => {
    setMessage("");

    const updatedBooking = {
      ...booking,
      status: newStatus,
      updatedAt:
        new Date().toISOString(),
    };

    let updatedTables =
      [...tables];

    if (newStatus === "Sentada") {
      if (!booking.tableId) {
        setMessage(
          "Esta reserva no tiene una mesa asignada."
        );

        return;
      }

      updatedTables =
        tables.map((table) =>
          Number(table.id) ===
          Number(booking.tableId)
            ? {
                ...table,
                status: "Ocupada",
                bookingId:
                  booking.id,
              }
            : table
        );
    }

    if (newStatus === "Confirmada") {
      if (booking.tableId) {
        updatedTables =
          tables.map((table) =>
            Number(table.id) ===
            Number(booking.tableId)
              ? {
                  ...table,
                  status: "Reservada",
                  bookingId:
                    booking.id,
                }
              : table
          );
      }
    }

    if (
      newStatus === "Finalizada" ||
      newStatus === "Cancelada"
    ) {
      updatedTables =
        tables.map((table) =>
          Number(table.id) ===
          Number(booking.tableId)
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

  const openPayment = (booking) => {
    setPayingBooking(booking);

    setPaymentAmount(
      booking.paidAmount || ""
    );

    setPaymentMethod(
      booking.paymentMethod ||
      "Tarjeta"
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

    const result =
      createPayment({
        bookingId:
          payingBooking.id,

        customerId:
          payingBooking.customerId,

        customerName:
          payingBooking.name,

        amount:
          Number(paymentAmount),

        paymentMethod,

        concept:
          `Reserva · ${payingBooking.name} · ${
            payingBooking.tableName ||
            "Sin mesa"
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
      ).toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR",
      })} registrado correctamente.`
    );

    closePayment();
  };

  const handleFinalize = (booking) => {
    if (
      booking.paymentStatus !==
      "Pagado"
    ) {
      const confirmed =
        window.confirm(
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

  const handleCancel = (booking) => {
    const confirmed =
      window.confirm(
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

  const formatMoney = (value) => {
    return Number(
      value || 0
    ).toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR",
    });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-header admin-header--row">
          <div>
            <span>Gestión</span>

            <h1>Reservas</h1>

            <p>
              Confirma, sienta, cobra y finaliza
              las reservas.
            </p>
          </div>

          <select
            className="admin-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option>Todas</option>
            <option>Pendiente</option>
            <option>Confirmada</option>
            <option>Sentada</option>
            <option>Finalizada</option>
            <option>Cancelada</option>
          </select>
        </header>

        {message && (
          <div className="cash-message">
            {message}
          </div>
        )}

        <section className="admin-panel">
          <div className="admin-panel__heading">
            <div>
              <span>Listado</span>

              <h2>
                {filteredBookings.length} reservas
              </h2>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No hay reservas"
              description="No existen reservas que coincidan con el filtro seleccionado."
            />
          ) : (
            <div className="reservation-table-wrapper">
              <table className="reservation-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Personas</th>
                    <th>Mesa</th>
                    <th>Estado</th>
                    <th>Pago</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map(
                    (booking) => (
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
                          {booking.tableName ||
                            "Sin asignar"}
                        </td>

                        <td>
                          <select
                            value={
                              booking.status
                            }
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
                              booking.paymentStatus ===
                              "Pagado"
                                ? "reservation-payment reservation-payment--paid"
                                : "reservation-payment reservation-payment--pending"
                            }
                          >
                            {booking.paymentStatus ===
                            "Pagado"
                              ? `Pagado · ${formatMoney(
                                  booking.paidAmount
                                )}`
                              : "Pendiente"}
                          </span>
                        </td>

                        <td>
                          <div className="reservation-actions">
                            {booking.paymentStatus !==
                              "Pagado" &&
                              booking.status !==
                                "Cancelada" && (
                                <button
                                  type="button"
                                  className="reservation-pay-button"
                                  onClick={() =>
                                    openPayment(
                                      booking
                                    )
                                  }
                                >
                                  Cobrar
                                </button>
                              )}

                            {booking.status !==
                              "Finalizada" &&
                              booking.status !==
                                "Cancelada" && (
                                <button
                                  type="button"
                                  className="table-complete-button"
                                  onClick={() =>
                                    handleFinalize(
                                      booking
                                    )
                                  }
                                >
                                  Finalizar
                                </button>
                              )}

                            {booking.status !==
                              "Cancelada" &&
                              booking.status !==
                                "Finalizada" && (
                                <button
                                  type="button"
                                  className="table-cancel-button"
                                  onClick={() =>
                                    handleCancel(
                                      booking
                                    )
                                  }
                                >
                                  Cancelar
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

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
                {payingBooking.tableName ||
                  "Sin mesa"}{" "}
                · {payingBooking.guests} personas
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
                    <option>Tarjeta</option>
                    <option>Efectivo</option>
                    <option>Bizum</option>
                    <option>Transferencia</option>
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