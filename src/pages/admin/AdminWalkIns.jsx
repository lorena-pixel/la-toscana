import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminSidebar from "../../components/layout/AdminSidebar";
import EmptyState from "../../components/admin/EmptyState";

import {
  createCustomer,
  getStoredCustomers,
} from "../../services/customerStorageService";

import {
  getTables,
} from "../../services/tableService";

import {
  cancelVisit,
  createWalkInVisit,
  finalizeVisit,
  getVisits,
  markVisitAsPaid,
} from "../../services/visitService";

import {
  createPayment,
} from "../../services/cashService";

const initialForm = {
  customerMode: "anonymous",
  existingCustomerId: "",

  name: "",
  phone: "",
  email: "",

  guests: "2",
  tableId: "",
  notes: "",
};

function AdminWalkIns() {
  const [customers, setCustomers] =
    useState([]);

  const [tables, setTables] =
    useState([]);

  const [visits, setVisits] =
    useState([]);

  const [form, setForm] =
    useState(initialForm);

  const [message, setMessage] =
    useState("");

  const [payingVisit, setPayingVisit] =
    useState(null);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("Tarjeta");

  const loadData = () => {
    setCustomers(
      getStoredCustomers()
    );

    setTables(
      getTables()
    );

    setVisits(
      getVisits()
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const freeTables =
    useMemo(() => {
      return tables.filter(
        (table) =>
          table.status === "Libre" &&
          !table.bookingId &&
          !table.visitId &&
          Number(table.capacity) >=
            Number(form.guests)
      );
    }, [tables, form.guests]);

  const activeVisits =
    useMemo(() => {
      return visits.filter(
        (visit) =>
          visit.status === "Activa"
      );
    }, [visits]);

  const finishedToday =
    useMemo(() => {
      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      return visits.filter(
        (visit) =>
          visit.status ===
            "Finalizada" &&
          visit.finishedAt?.startsWith(
            today
          )
      );
    }, [visits]);

  const totalGuestsInside =
    activeVisits.reduce(
      (total, visit) =>
        total +
        Number(
          visit.guests || 0
        ),
      0
    );

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,

      [name]: value,

      ...(name === "guests"
        ? {
            tableId: "",
          }
        : {}),
    }));

    setMessage("");
  };

  const handleCustomerMode = (
    mode
  ) => {
    setForm({
      ...initialForm,
      customerMode: mode,
    });

    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setMessage("");

    if (!form.tableId) {
      setMessage(
        "Selecciona una mesa."
      );

      return;
    }

    let customerId = null;

    let customerName =
      "Cliente anónimo";

    let phone = "";
    let email = "";

    if (
      form.customerMode ===
      "existing"
    ) {
      const customer =
        customers.find(
          (item) =>
            item.id ===
            form.existingCustomerId
        );

      if (!customer) {
        setMessage(
          "Selecciona un cliente."
        );

        return;
      }

      customerId =
        customer.id;

      customerName =
        customer.name;

      phone =
        customer.phone || "";

      email =
        customer.email || "";
    }

    if (
      form.customerMode === "new"
    ) {
      if (!form.name.trim()) {
        setMessage(
          "Escribe el nombre del cliente."
        );

        return;
      }

      if (
        !form.phone.trim() &&
        !form.email.trim()
      ) {
        setMessage(
          "Introduce teléfono o email para crear la ficha."
        );

        return;
      }

      const customer =
        createCustomer({
          name:
            form.name.trim(),

          phone:
            form.phone.trim(),

          email:
            form.email.trim(),
        });

      customerId =
        customer.id;

      customerName =
        customer.name;

      phone =
        customer.phone;

      email =
        customer.email;
    }

    const result =
      createWalkInVisit({
        customerId,
        customerName,

        phone,
        email,

        guests:
          Number(
            form.guests
          ),

        tableId:
          Number(
            form.tableId
          ),

        notes:
          form.notes.trim(),
      });

    if (!result.success) {
      setMessage(
        result.message
      );

      loadData();

      return;
    }

    setForm(initialForm);

    setMessage(
      `${customerName} ha sido registrado correctamente.`
    );

    loadData();
  };

  const openPayment = (visit) => {
    setPayingVisit(visit);

    setPaymentAmount("");

    setPaymentMethod(
      "Tarjeta"
    );

    setMessage("");
  };

  const closePayment = () => {
    setPayingVisit(null);

    setPaymentAmount("");

    setPaymentMethod(
      "Tarjeta"
    );
  };

  const handlePayment = (event) => {
    event.preventDefault();

    if (!payingVisit) {
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
        visitId:
          payingVisit.id,

        customerId:
          payingVisit.customerId,

        customerName:
          payingVisit.customerName,

        amount:
          Number(
            paymentAmount
          ),

        paymentMethod,

        concept:
          `Entrada directa · ${payingVisit.customerName} · ${payingVisit.tableName}`,
      });

    if (!result.success) {
      setMessage(
        result.message
      );

      return;
    }

    markVisitAsPaid({
      visitId:
        payingVisit.id,

      amount:
        Number(
          paymentAmount
        ),

      paymentMethod,
    });

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
    loadData();
  };

  const handleFinalize = (visit) => {
    if (
      visit.paymentStatus !==
      "Pagado"
    ) {
      const confirmed =
        window.confirm(
          "Esta visita todavía no está pagada. ¿Quieres finalizarla igualmente?"
        );

      if (!confirmed) {
        return;
      }
    }

    finalizeVisit(visit.id);

    loadData();
  };

  const handleCancel = (visit) => {
    const confirmed =
      window.confirm(
        `¿Cancelar la visita de ${visit.customerName}?`
      );

    if (!confirmed) {
      return;
    }

    cancelVisit(visit.id);

    loadData();
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-header">
          <span>
            Entrada directa
          </span>

          <h1>
            Clientes sin reserva
          </h1>

          <p>
            Registra clientes que llegan directamente,
            cobra su cuenta y controla la mesa.
          </p>
        </header>

        <section className="admin-stats">
          <article className="stat-card">
            <span>
              Visitas activas
            </span>

            <strong>
              {activeVisits.length}
            </strong>

            <p>
              Mesas ocupadas sin reserva
            </p>
          </article>

          <article className="stat-card">
            <span>
              Comensales
            </span>

            <strong>
              {totalGuestsInside}
            </strong>

            <p>
              Actualmente dentro
            </p>
          </article>

          <article className="stat-card">
            <span>
              Mesas disponibles
            </span>

            <strong>
              {
                tables.filter(
                  (table) =>
                    table.status ===
                      "Libre" &&
                    !table.bookingId &&
                    !table.visitId
                ).length
              }
            </strong>

            <p>
              Libres actualmente
            </p>
          </article>

          <article className="stat-card">
            <span>
              Finalizadas hoy
            </span>

            <strong>
              {finishedToday.length}
            </strong>

            <p>
              Visitas completadas
            </p>
          </article>
        </section>

        {message && (
          <div className="cash-message">
            {message}
          </div>
        )}

        <div className="walkin-layout">
          <section className="admin-panel">
            <div className="admin-panel__heading">
              <div>
                <span>
                  Nueva entrada
                </span>

                <h2>
                  Registrar cliente
                </h2>
              </div>
            </div>

            <div className="walkin-customer-types">
              <button
                type="button"
                className={
                  form.customerMode ===
                  "anonymous"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleCustomerMode(
                    "anonymous"
                  )
                }
              >
                Cliente anónimo
              </button>

              <button
                type="button"
                className={
                  form.customerMode ===
                  "existing"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleCustomerMode(
                    "existing"
                  )
                }
              >
                Cliente existente
              </button>

              <button
                type="button"
                className={
                  form.customerMode ===
                  "new"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleCustomerMode(
                    "new"
                  )
                }
              >
                Nuevo cliente
              </button>
            </div>

            <form
              className="walkin-form"
              onSubmit={handleSubmit}
            >
              {form.customerMode ===
                "existing" && (
                <label>
                  Cliente

                  <select
                    name="existingCustomerId"
                    value={
                      form.existingCustomerId
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Selecciona un cliente
                    </option>

                    {customers.map(
                      (customer) => (
                        <option
                          key={
                            customer.id
                          }
                          value={
                            customer.id
                          }
                        >
                          {customer.name} ·{" "}
                          {customer.phone ||
                            customer.email}
                        </option>
                      )
                    )}
                  </select>
                </label>
              )}

              {form.customerMode ===
                "new" && (
                <>
                  <label>
                    Nombre *

                    <input
                      type="text"
                      name="name"
                      value={
                        form.name
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </label>

                  <label>
                    Teléfono

                    <input
                      type="tel"
                      name="phone"
                      value={
                        form.phone
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </label>

                  <label>
                    Email

                    <input
                      type="email"
                      name="email"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </label>
                </>
              )}

              <label>
                Personas *

                <select
                  name="guests"
                  value={
                    form.guests
                  }
                  onChange={
                    handleChange
                  }
                >
                  {Array.from(
                    {
                      length: 8,
                    },
                    (_, index) =>
                      index + 1
                  ).map(
                    (number) => (
                      <option
                        key={
                          number
                        }
                        value={
                          number
                        }
                      >
                        {number}{" "}
                        {number ===
                        1
                          ? "persona"
                          : "personas"}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Mesa *

                <select
                  name="tableId"
                  value={
                    form.tableId
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="">
                    Selecciona una mesa
                  </option>

                  {freeTables.map(
                    (table) => (
                      <option
                        key={
                          table.id
                        }
                        value={
                          table.id
                        }
                      >
                        {table.name} ·{" "}
                        {table.area} · hasta{" "}
                        {table.capacity} personas
                      </option>
                    )
                  )}
                </select>
              </label>

              {freeTables.length ===
                0 && (
                <div className="booking-form__error">
                  No hay ninguna mesa libre con
                  capacidad suficiente.
                </div>
              )}

              <label>
                Observaciones

                <textarea
                  name="notes"
                  rows="3"
                  value={
                    form.notes
                  }
                  onChange={
                    handleChange
                  }
                />
              </label>

              <button
                className="cash-primary-button"
                type="submit"
                disabled={
                  freeTables.length ===
                  0
                }
              >
                Registrar entrada
              </button>
            </form>
          </section>

          <section className="admin-panel">
            <div className="admin-panel__heading">
              <div>
                <span>Ahora</span>

                <h2>
                  Visitas activas
                </h2>
              </div>
            </div>

            {activeVisits.length === 0 ? (
              <EmptyState
                icon="🍽️"
                title="No hay visitas activas"
                description="En este momento no hay clientes de entrada directa ocupando una mesa."
              />
            ) : (
              <div className="walkin-active-list">
                {activeVisits.map(
                  (visit) => (
                    <article
                      className="walkin-card"
                      key={
                        visit.id
                      }
                    >
                      <div className="walkin-card__top">
                        <div>
                          <span>
                            {
                              visit.tableName
                            }
                          </span>

                          <h3>
                            {
                              visit.customerName
                            }
                          </h3>
                        </div>

                        <strong>
                          {visit.guests} 👤
                        </strong>
                      </div>

                      <div className="walkin-card__details">
                        <p>
                          Entrada:{" "}
                          {new Date(
                            visit.startedAt
                          ).toLocaleTimeString(
                            "es-ES",
                            {
                              hour:
                                "2-digit",
                              minute:
                                "2-digit",
                            }
                          )}
                        </p>

                        <p>
                          Estado de pago:{" "}
                          <strong>
                            {
                              visit.paymentStatus
                            }
                          </strong>
                        </p>

                        {visit.paymentStatus ===
                          "Pagado" && (
                          <p>
                            Cuenta:{" "}
                            {Number(
                              visit.amount
                            ).toLocaleString(
                              "es-ES",
                              {
                                style:
                                  "currency",
                                currency:
                                  "EUR",
                              }
                            )}{" "}
                            ·{" "}
                            {
                              visit.paymentMethod
                            }
                          </p>
                        )}

                        {visit.notes && (
                          <p>
                            {visit.notes}
                          </p>
                        )}
                      </div>

                      <div className="walkin-card__actions">
                        {visit.paymentStatus !==
                          "Pagado" && (
                          <button
                            type="button"
                            className="walkin-pay-button"
                            onClick={() =>
                              openPayment(
                                visit
                              )
                            }
                          >
                            💳 Cobrar
                          </button>
                        )}

                        <button
                          type="button"
                          className="table-complete-button"
                          onClick={() =>
                            handleFinalize(
                              visit
                            )
                          }
                        >
                          ✓ Finalizar
                        </button>

                        <button
                          type="button"
                          className="table-cancel-button"
                          onClick={() =>
                            handleCancel(
                              visit
                            )
                          }
                        >
                          Cancelar
                        </button>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </div>

        {payingVisit && (
          <div
            className="customer-modal-overlay"
            onClick={closePayment}
          >
            <article
              className="customer-modal walkin-payment-modal"
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
                Cobrar cuenta
              </span>

              <h2>
                {payingVisit.customerName}
              </h2>

              <p className="walkin-payment-info">
                {payingVisit.tableName} ·{" "}
                {payingVisit.guests} personas
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
                    value={
                      paymentAmount
                    }
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
                    value={
                      paymentMethod
                    }
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

export default AdminWalkIns;