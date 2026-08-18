import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminSidebar from "../../components/layout/AdminSidebar";
import StatCard from "../../components/admin/StatCard";
import EmptyState from "../../components/admin/EmptyState";

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
  formatMoney,
} from "../../services/customerService";

import "../../styles/admin.css";


function AdminDashboard() {
  const [bookings, setBookings] =
    useState([]);

  const [tables, setTables] =
    useState([]);

  const [visits, setVisits] =
    useState([]);

  const [movements, setMovements] =
    useState([]);

  const [customers, setCustomers] =
    useState([]);


  useEffect(() => {
    setBookings(
      getBookings()
    );

    setTables(
      getTables()
    );

    setVisits(
      getVisits()
    );

    setMovements(
      getCashMovements()
    );

    setCustomers(
      getCustomers()
    );
  }, []);


  /*
  =========================
  FECHA LOCAL
  =========================
  */

  const today = useMemo(() => {
    const date =
      new Date();

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);


  /*
  =========================
  RESERVAS
  =========================
  */

  const todayBookings =
    useMemo(() => {
      return bookings.filter(
        (booking) =>
          booking.date ===
            today &&
          booking.status !==
            "Cancelada"
      );
    }, [
      bookings,
      today,
    ]);


  const pendingBookings =
    useMemo(() => {
      return bookings.filter(
        (booking) =>
          booking.status ===
          "Pendiente"
      );
    }, [bookings]);


  const todayCompletedBookings =
    useMemo(() => {
      return bookings.filter(
        (booking) =>
          booking.status ===
            "Finalizada" &&
          booking.updatedAt?.startsWith(
            today
          )
      );
    }, [
      bookings,
      today,
    ]);


  const upcomingToday =
    useMemo(() => {
      return [...todayBookings]
        .filter(
          (booking) =>
            booking.status !==
            "Finalizada"
        )
        .sort(
          (a, b) =>
            (a.time || "")
              .localeCompare(
                b.time || ""
              )
        );
    }, [todayBookings]);


  /*
  =========================
  MESAS
  =========================
  */

  const occupiedTables =
    useMemo(() => {
      return tables.filter(
        (table) =>
          table.status ===
          "Ocupada"
      );
    }, [tables]);


  const reservedTables =
    useMemo(() => {
      return tables.filter(
        (table) =>
          table.status ===
          "Reservada"
      );
    }, [tables]);


  const freeTables =
    useMemo(() => {
      return tables.filter(
        (table) =>
          table.status ===
          "Libre"
      );
    }, [tables]);


  /*
  =========================
  ENTRADAS DIRECTAS
  =========================
  */

  const activeWalkIns =
    useMemo(() => {
      return visits.filter(
        (visit) =>
          visit.status ===
          "Activa"
      );
    }, [visits]);


  const todayCompletedVisits =
    useMemo(() => {
      return visits.filter(
        (visit) =>
          visit.status ===
            "Finalizada" &&
          visit.finishedAt?.startsWith(
            today
          )
      );
    }, [
      visits,
      today,
    ]);


  /*
  =========================
  CAJA DE HOY
  =========================
  */

  const todayMovements =
    useMemo(() => {
      return movements.filter(
        (movement) =>
          movement.createdAt?.startsWith(
            today
          )
      );
    }, [
      movements,
      today,
    ]);


  const todayPaidMovements =
    useMemo(() => {
      return todayMovements.filter(
        (movement) =>
          movement.type ===
          "Ingreso"
      );
    }, [todayMovements]);


  const todayExpenseMovements =
    useMemo(() => {
      return todayMovements.filter(
        (movement) =>
          movement.type ===
          "Gasto"
      );
    }, [todayMovements]);


  const todayIncome =
    useMemo(() => {
      return todayPaidMovements.reduce(
        (total, movement) =>
          total +
          Number(
            movement.amount || 0
          ),
        0
      );
    }, [todayPaidMovements]);


  const todayExpenses =
    useMemo(() => {
      return todayExpenseMovements.reduce(
        (total, movement) =>
          total +
          Number(
            movement.amount || 0
          ),
        0
      );
    }, [todayExpenseMovements]);


  const todayBalance =
    todayIncome -
    todayExpenses;


  const averageTicket =
    todayPaidMovements.length >
    0
      ? todayIncome /
        todayPaidMovements.length
      : 0;


  /*
  =========================
  PERSONAS DENTRO
  =========================
  */

  const activePeople =
    useMemo(() => {
      return occupiedTables.reduce(
        (total, table) => {
          const booking =
            bookings.find(
              (item) =>
                item.id ===
                table.bookingId
            );

          const visit =
            visits.find(
              (item) =>
                item.id ===
                table.visitId
            );

          return (
            total +
            Number(
              booking?.guests ||
                visit?.guests ||
                0
            )
          );
        },
        0
      );
    }, [
      occupiedTables,
      bookings,
      visits,
    ]);


  /*
  =========================
  CLIENTES ATENDIDOS HOY
  =========================
  */

  const customersServedToday =
    todayCompletedBookings.length +
    todayCompletedVisits.length;


  /*
  =========================
  CRM
  =========================
  */

  const recurrentCustomers =
    useMemo(() => {
      return customers.filter(
        (customer) =>
          Number(
            customer.totalVisits || 0
          ) > 1
      ).length;
    }, [customers]);


  const accumulatedVisits =
    useMemo(() => {
      return customers.reduce(
        (total, customer) =>
          total +
          Number(
            customer.totalVisits || 0
          ),
        0
      );
    }, [customers]);


  const customerRevenue =
    useMemo(() => {
      return customers.reduce(
        (total, customer) =>
          total +
          Number(
            customer.totalSpent || 0
          ),
        0
      );
    }, [customers]);


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
            Panel de control
          </span>

          <h1>
            Resumen
          </h1>

          <p>
            Estado actual de La Toscana.
          </p>

        </header>


        {/* CAJA Y OPERATIVA */}

        <section className="admin-stats">

          <StatCard
            label="Ingresos hoy"
            value={formatMoney(
              todayIncome
            )}
            helper="Cobros registrados"
          />


          <StatCard
            label="Caja hoy"
            value={formatMoney(
              todayBalance
            )}
            helper={`${formatMoney(
              todayExpenses
            )} en gastos`}
          />


          <StatCard
            label="Reservas pendientes"
            value={
              pendingBookings.length
            }
            helper="Esperando confirmación"
          />


          <StatCard
            label="Mesas ocupadas"
            value={
              occupiedTables.length
            }
            helper={`${activePeople} personas dentro`}
          />

        </section>


        {/* RESTAURANTE */}

        <section className="admin-stats">

          <StatCard
            label="Mesas libres"
            value={
              freeTables.length
            }
            helper={`${tables.length} mesas en total`}
          />


          <StatCard
            label="Reservadas"
            value={
              reservedTables.length
            }
            helper="Mesas preparadas"
          />


          <StatCard
            label="Entrada directa"
            value={
              activeWalkIns.length
            }
            helper="Visitas activas sin reserva"
          />


          <StatCard
            label="Atendidos hoy"
            value={
              customersServedToday
            }
            helper="Visitas finalizadas"
          />

        </section>


        {/* FACTURACIÓN */}

        <section className="admin-stats">

          <StatCard
            label="Ticket medio"
            value={formatMoney(
              averageTicket
            )}
            helper="Por cobro realizado hoy"
          />


          <StatCard
            label="Cobros hoy"
            value={
              todayPaidMovements.length
            }
            helper="Movimientos de ingreso"
          />


          <StatCard
            label="Reservas hoy"
            value={
              todayBookings.length
            }
            helper="No canceladas"
          />


          <StatCard
            label="Personas dentro"
            value={
              activePeople
            }
            helper="En mesas ocupadas"
          />

        </section>


        <div className="dashboard-main-grid">

          {/* PRÓXIMAS RESERVAS */}

          <section className="admin-panel">

            <div className="admin-panel__heading">

              <div>

                <span>
                  Hoy
                </span>

                <h2>
                  Próximas reservas
                </h2>

              </div>

            </div>


            {upcomingToday.length ===
            0 ? (

              <EmptyState
                icon="📅"
                title="Sin reservas pendientes"
                description="No quedan reservas pendientes para hoy."
              />

            ) : (

              <div className="dashboard-bookings">

                {upcomingToday.map(
                  (booking) => (

                    <article
                      className="dashboard-booking-card"
                      key={
                        booking.id
                      }
                    >

                      <div>

                        <span className="dashboard-booking-card__time">
                          {
                            booking.time
                          }
                        </span>

                        <h3>
                          {
                            booking.name
                          }
                        </h3>

                        <p>

                          {
                            booking.guests
                          }{" "}
                          personas ·{" "}

                          {booking.tableName ||
                            "Sin mesa"}

                        </p>

                      </div>


                      <div className="dashboard-status-block">

                        <span>
                          {
                            booking.status
                          }
                        </span>

                        <small>

                          {booking.paymentStatus ===
                          "Pagado"
                            ? "Pagado"
                            : "Pendiente de pago"}

                        </small>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </section>


          {/* SALÓN */}

          <section className="admin-panel">

            <div className="admin-panel__heading">

              <div>

                <span>
                  Ahora
                </span>

                <h2>
                  Salón
                </h2>

              </div>

            </div>


            {tables.length === 0 ? (

              <EmptyState
                icon="🍽️"
                title="No hay mesas"
                description="Todavía no existen mesas configuradas en el restaurante."
              />

            ) : (

              <div className="dashboard-table-summary">

                {tables.map(
                  (table) => {
                    const booking =
                      bookings.find(
                        (item) =>
                          item.id ===
                          table.bookingId
                      );

                    const visit =
                      visits.find(
                        (item) =>
                          item.id ===
                          table.visitId
                      );

                    const customerName =
                      booking?.name ||
                      visit?.customerName ||
                      "";

                    return (

                      <article
                        key={
                          table.id
                        }
                        className={`dashboard-table-item dashboard-table-item--${(
                          table.status ||
                          "libre"
                        ).toLowerCase()}`}
                      >

                        <div>

                          <strong>
                            {
                              table.name
                            }
                          </strong>

                          <span>

                            {
                              table.area
                            }{" "}
                            ·{" "}
                            {
                              table.capacity
                            }{" "}
                            pers.

                          </span>

                        </div>


                        <div>

                          <b>
                            {
                              table.status
                            }
                          </b>

                          {customerName && (

                            <small>
                              {
                                customerName
                              }
                            </small>

                          )}

                        </div>

                      </article>

                    );
                  }
                )}

              </div>

            )}

          </section>

        </div>


        {/* CRM */}

        <section className="admin-panel dashboard-customer-summary">

          <div className="admin-panel__heading">

            <div>

              <span>
                CRM
              </span>

              <h2>
                Clientes
              </h2>

            </div>

          </div>


          {customers.length === 0 ? (

            <EmptyState
              icon="👤"
              title="Todavía no hay clientes"
              description="Las fichas de clientes aparecerán al registrar reservas y entradas directas."
            />

          ) : (

            <div className="dashboard-customer-stats">

              <div>

                <span>
                  Registrados
                </span>

                <strong>
                  {
                    customers.length
                  }
                </strong>

              </div>


              <div>

                <span>
                  Recurrentes
                </span>

                <strong>
                  {
                    recurrentCustomers
                  }
                </strong>

              </div>


              <div>

                <span>
                  Visitas acumuladas
                </span>

                <strong>
                  {
                    accumulatedVisits
                  }
                </strong>

              </div>


              <div>

                <span>
                  Facturación clientes
                </span>

                <strong>
                  {formatMoney(
                    customerRevenue
                  )}
                </strong>

              </div>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}


export default AdminDashboard;