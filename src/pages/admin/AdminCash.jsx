import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminSidebar from "../../components/layout/AdminSidebar";
import EmptyState from "../../components/admin/EmptyState";

import "../../styles/cashFilters.css";

import {
  createExpense,
  createPayment,
  deleteCashMovement,
  getCashMovements,
} from "../../services/cashService";

import {
  getBookings,
  updateBooking,
} from "../../services/bookingService";


function AdminCash() {
  const [bookings, setBookings] =
    useState([]);

  const [movements, setMovements] =
    useState([]);

  const [
    selectedBookingId,
    setSelectedBookingId,
  ] = useState("");

  const [amount, setAmount] =
    useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("Tarjeta");

  const [
    expenseConcept,
    setExpenseConcept,
  ] = useState("");

  const [
    expenseAmount,
    setExpenseAmount,
  ] = useState("");

  const [
    expenseMethod,
    setExpenseMethod,
  ] = useState("Tarjeta");

  const [message, setMessage] =
    useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("Todos");

  const [
    methodFilter,
    setMethodFilter,
  ] = useState("Todos");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");


  const loadData = () => {
    setBookings(
      getBookings()
    );

    setMovements(
      getCashMovements()
    );
  };


  useEffect(() => {
    loadData();
  }, []);


  const unpaidBookings =
    useMemo(() => {
      return bookings.filter(
        (booking) =>
          booking.status !==
            "Cancelada" &&
          booking.paymentStatus !==
            "Pagado"
      );
    }, [bookings]);


  const selectedBooking =
    bookings.find(
      (booking) =>
        booking.id ===
        selectedBookingId
    );


  const filteredMovements =
    useMemo(() => {
      return movements.filter(
        (movement) => {
          const movementDate =
            movement.createdAt
              ?.split("T")[0];

          const matchesType =
            typeFilter ===
              "Todos" ||
            movement.type ===
              typeFilter;

          const matchesMethod =
            methodFilter ===
              "Todos" ||
            movement.paymentMethod ===
              methodFilter;

          const matchesFrom =
            !dateFrom ||
            movementDate >=
              dateFrom;

          const matchesTo =
            !dateTo ||
            movementDate <=
              dateTo;

          return (
            matchesType &&
            matchesMethod &&
            matchesFrom &&
            matchesTo
          );
        }
      );
    }, [
      movements,
      typeFilter,
      methodFilter,
      dateFrom,
      dateTo,
    ]);


  const filteredIncome =
    filteredMovements
      .filter(
        (movement) =>
          movement.type ===
          "Ingreso"
      )
      .reduce(
        (total, movement) =>
          total +
          Number(
            movement.amount || 0
          ),
        0
      );


  const filteredExpenses =
    filteredMovements
      .filter(
        (movement) =>
          movement.type ===
          "Gasto"
      )
      .reduce(
        (total, movement) =>
          total +
          Number(
            movement.amount || 0
          ),
        0
      );


  const filteredBalance =
    filteredIncome -
    filteredExpenses;


  const filteredPayments =
    filteredMovements.filter(
      (movement) =>
        movement.type ===
        "Ingreso"
    );


  const averageTicket =
    filteredPayments.length > 0
      ? filteredIncome /
        filteredPayments.length
      : 0;


  const formatMoney = (
    value
  ) => {
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


  const handlePayment = (
    event
  ) => {
    event.preventDefault();

    setMessage("");

    if (!selectedBooking) {
      setMessage(
        "Selecciona una reserva."
      );

      return;
    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      setMessage(
        "Introduce un importe válido."
      );

      return;
    }

    const result =
      createPayment({
        bookingId:
          selectedBooking.id,

        customerId:
          selectedBooking.customerId,

        customerName:
          selectedBooking.name,

        amount:
          Number(amount),

        paymentMethod,

        concept:
          `Reserva · ${selectedBooking.name} · ${
            selectedBooking.tableName ||
            "Sin mesa"
          }`,
      });


    if (!result.success) {
      setMessage(
        result.message
      );

      return;
    }


    const updatedBooking = {
      ...selectedBooking,

      paymentStatus:
        "Pagado",

      paidAmount:
        Number(amount),

      paymentMethod,

      paidAt:
        new Date()
          .toISOString(),

      updatedAt:
        new Date()
          .toISOString(),
    };


    updateBooking(
      updatedBooking
    );


    setSelectedBookingId(
      ""
    );

    setAmount(
      ""
    );


    setMessage(
      "Pago registrado correctamente."
    );


    loadData();
  };


  const handleExpense = (
    event
  ) => {
    event.preventDefault();

    setMessage("");

    if (
      !expenseConcept.trim()
    ) {
      setMessage(
        "Escribe el concepto del gasto."
      );

      return;
    }

    if (
      !expenseAmount ||
      Number(
        expenseAmount
      ) <= 0
    ) {
      setMessage(
        "Introduce un importe válido."
      );

      return;
    }


    createExpense({
      concept:
        expenseConcept.trim(),

      amount:
        Number(
          expenseAmount
        ),

      paymentMethod:
        expenseMethod,
    });


    setExpenseConcept(
      ""
    );

    setExpenseAmount(
      ""
    );


    setMessage(
      "Gasto registrado correctamente."
    );


    loadData();
  };


  const handleDelete = (
    movement
  ) => {
    const confirmed =
      window.confirm(
        `¿Seguro que quieres eliminar este movimiento de ${formatMoney(
          movement.amount
        )}?`
      );

    if (!confirmed) {
      return;
    }


    deleteCashMovement(
      movement.id
    );


    if (
      movement.bookingId &&
      movement.type ===
        "Ingreso"
    ) {
      const booking =
        bookings.find(
          (item) =>
            item.id ===
            movement.bookingId
        );

      if (booking) {
        updateBooking({
          ...booking,

          paymentStatus:
            "Pendiente",

          paidAmount: 0,

          paymentMethod:
            null,

          paidAt: null,

          updatedAt:
            new Date()
              .toISOString(),
        });
      }
    }


    setMessage(
      "Movimiento eliminado."
    );


    loadData();
  };


  const clearFilters = () => {
    setTypeFilter(
      "Todos"
    );

    setMethodFilter(
      "Todos"
    );

    setDateFrom(
      ""
    );

    setDateTo(
      ""
    );
  };


  return (
    <div className="admin-layout">

      <AdminSidebar />


      <main className="admin-main">

        <header className="admin-header">

          <span>
            Finanzas
          </span>

          <h1>
            Caja
          </h1>

          <p>
            Controla cobros, gastos y movimientos
            del restaurante.
          </p>

        </header>


        {message && (

          <div className="cash-message">
            {message}
          </div>

        )}


        <section className="admin-stats">

          <article className="stat-card">

            <span>
              Ingresos
            </span>

            <strong>
              {formatMoney(
                filteredIncome
              )}
            </strong>

            <p>
              Según filtros seleccionados
            </p>

          </article>


          <article className="stat-card">

            <span>
              Gastos
            </span>

            <strong>
              {formatMoney(
                filteredExpenses
              )}
            </strong>

            <p>
              Salidas registradas
            </p>

          </article>


          <article className="stat-card">

            <span>
              Balance
            </span>

            <strong>
              {formatMoney(
                filteredBalance
              )}
            </strong>

            <p>
              Ingresos menos gastos
            </p>

          </article>


          <article className="stat-card">

            <span>
              Ticket medio
            </span>

            <strong>
              {formatMoney(
                averageTicket
              )}
            </strong>

            <p>
              Por cobro del periodo
            </p>

          </article>

        </section>


        <div className="cash-grid">

          <section className="admin-panel">

            <div className="admin-panel__heading">

              <div>

                <span>
                  Cobro
                </span>

                <h2>
                  Cobrar reserva
                </h2>

              </div>

            </div>


            <form
              className="cash-form"
              onSubmit={
                handlePayment
              }
            >

              <label>

                Reserva

                <select
                  value={
                    selectedBookingId
                  }
                  onChange={
                    (event) =>
                      setSelectedBookingId(
                        event.target.value
                      )
                  }
                >

                  <option value="">
                    Selecciona una reserva
                  </option>


                  {unpaidBookings.map(
                    (booking) => (

                      <option
                        key={
                          booking.id
                        }
                        value={
                          booking.id
                        }
                      >

                        {booking.name} ·{" "}
                        {booking.date} ·{" "}
                        {booking.time} ·{" "}
                        {booking.guests} pers.

                      </option>

                    )
                  )}

                </select>

              </label>


              {selectedBooking && (

                <div className="cash-booking-preview">

                  <span>
                    Cliente
                  </span>

                  <strong>
                    {
                      selectedBooking.name
                    }
                  </strong>

                  <p>

                    {
                      selectedBooking.guests
                    }{" "}
                    personas ·{" "}
                    {
                      selectedBooking.area
                    }

                  </p>

                  <p>

                    Mesa:{" "}
                    {selectedBooking.tableName ||
                      "Sin asignar"}

                  </p>

                </div>

              )}


              <label>

                Importe

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={
                    (event) =>
                      setAmount(
                        event.target.value
                      )
                  }
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


              <button
                className="cash-primary-button"
                type="submit"
              >

                Registrar pago

              </button>

            </form>

          </section>


          <section className="admin-panel">

            <div className="admin-panel__heading">

              <div>

                <span>
                  Salida
                </span>

                <h2>
                  Registrar gasto
                </h2>

              </div>

            </div>


            <form
              className="cash-form"
              onSubmit={
                handleExpense
              }
            >

              <label>

                Concepto

                <input
                  type="text"
                  placeholder="Ej. Compra de verduras"
                  value={
                    expenseConcept
                  }
                  onChange={
                    (event) =>
                      setExpenseConcept(
                        event.target.value
                      )
                  }
                />

              </label>


              <label>

                Importe

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={
                    expenseAmount
                  }
                  onChange={
                    (event) =>
                      setExpenseAmount(
                        event.target.value
                      )
                  }
                />

              </label>


              <label>

                Método de pago

                <select
                  value={
                    expenseMethod
                  }
                  onChange={
                    (event) =>
                      setExpenseMethod(
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
                    Transferencia
                  </option>

                </select>

              </label>


              <button
                className="cash-secondary-button"
                type="submit"
              >

                Registrar gasto

              </button>

            </form>

          </section>

        </div>


        <section className="admin-panel cash-history">

          <div className="admin-panel__heading">

            <div>

              <span>
                Movimientos
              </span>

              <h2>
                Historial de caja
              </h2>

            </div>

          </div>


          <div className="cash-filters">

            <label>

              Tipo

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

                <option>
                  Ingreso
                </option>

                <option>
                  Gasto
                </option>

              </select>

            </label>


            <label>

              Método

              <select
                value={
                  methodFilter
                }
                onChange={
                  (event) =>
                    setMethodFilter(
                      event.target.value
                    )
                }
              >

                <option>
                  Todos
                </option>

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


            <label>

              Desde

              <input
                type="date"
                value={
                  dateFrom
                }
                onChange={
                  (event) =>
                    setDateFrom(
                      event.target.value
                    )
                }
              />

            </label>


            <label>

              Hasta

              <input
                type="date"
                value={
                  dateTo
                }
                onChange={
                  (event) =>
                    setDateTo(
                      event.target.value
                    )
                }
              />

            </label>


            <button
              type="button"
              className="cash-clear-filters"
              onClick={
                clearFilters
              }
            >

              Limpiar filtros

            </button>

          </div>


          {filteredMovements.length ===
          0 ? (

            <EmptyState
              icon="💶"
              title="Caja sin movimientos"
              description="No existen movimientos que coincidan con los filtros seleccionados."
              actionLabel="Limpiar filtros"
              onAction={
                clearFilters
              }
            />

          ) : (

            <div className="cash-table-wrapper">

              <table className="cash-table">

                <thead>

                  <tr>

                    <th>
                      Fecha
                    </th>

                    <th>
                      Tipo
                    </th>

                    <th>
                      Concepto
                    </th>

                    <th>
                      Cliente
                    </th>

                    <th>
                      Método
                    </th>

                    <th>
                      Importe
                    </th>

                    <th></th>

                  </tr>

                </thead>


                <tbody>

                  {[...filteredMovements]
                    .sort(
                      (a, b) =>
                        new Date(
                          b.createdAt
                        ) -
                        new Date(
                          a.createdAt
                        )
                    )
                    .map(
                      (movement) => (

                        <tr
                          key={
                            movement.id
                          }
                        >

                          <td>

                            {new Date(
                              movement.createdAt
                            ).toLocaleString(
                              "es-ES"
                            )}

                          </td>


                          <td>

                            <span
                              className={`cash-type cash-type--${movement.type.toLowerCase()}`}
                            >

                              {
                                movement.type
                              }

                            </span>

                          </td>


                          <td>

                            {
                              movement.concept
                            }

                          </td>


                          <td>

                            {movement.customerName ||
                              "—"}

                          </td>


                          <td>

                            {movement.paymentMethod ||
                              "—"}

                          </td>


                          <td>

                            <strong>

                              {movement.type ===
                              "Gasto"
                                ? "-"
                                : "+"}

                              {formatMoney(
                                movement.amount
                              )}

                            </strong>

                          </td>


                          <td>

                            <button
                              className="admin-delete"
                              type="button"
                              onClick={
                                () =>
                                  handleDelete(
                                    movement
                                  )
                              }
                            >

                              Eliminar

                            </button>

                          </td>

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}


export default AdminCash;