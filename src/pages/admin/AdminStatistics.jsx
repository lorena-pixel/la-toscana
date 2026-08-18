import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import AdminSidebar from "../../components/layout/AdminSidebar";
import EmptyState from "../../components/admin/EmptyState";

import {
  getCashMovements,
} from "../../services/cashService";

import {
  getBookings,
} from "../../services/bookingService";

import {
  getVisits,
} from "../../services/visitService";

import {
  getCustomers,
  formatMoney,
} from "../../services/customerService";


function AdminStatistics() {
  const [movements, setMovements] =
    useState([]);

  const [bookings, setBookings] =
    useState([]);

  const [visits, setVisits] =
    useState([]);

  const [customers, setCustomers] =
    useState([]);


  useEffect(() => {
    setMovements(
      getCashMovements()
    );

    setBookings(
      getBookings()
    );

    setVisits(
      getVisits()
    );

    setCustomers(
      getCustomers()
    );
  }, []);


  /*
  =========================
  CAJA
  =========================
  */

  const incomeMovements =
    useMemo(() => {
      return movements.filter(
        (movement) =>
          movement.type ===
          "Ingreso"
      );
    }, [movements]);


  const expenseMovements =
    useMemo(() => {
      return movements.filter(
        (movement) =>
          movement.type ===
          "Gasto"
      );
    }, [movements]);


  const totalIncome =
    useMemo(() => {
      return incomeMovements.reduce(
        (total, movement) =>
          total +
          Number(
            movement.amount || 0
          ),
        0
      );
    }, [incomeMovements]);


  const totalExpenses =
    useMemo(() => {
      return expenseMovements.reduce(
        (total, movement) =>
          total +
          Number(
            movement.amount || 0
          ),
        0
      );
    }, [expenseMovements]);


  const balance =
    totalIncome -
    totalExpenses;


  const averageTicket =
    incomeMovements.length > 0
      ? totalIncome /
        incomeMovements.length
      : 0;


  /*
  =========================
  RESERVAS Y VISITAS
  =========================
  */

  const completedBookings =
    useMemo(() => {
      return bookings.filter(
        (booking) =>
          booking.status ===
          "Finalizada"
      );
    }, [bookings]);


  const cancelledBookings =
    useMemo(() => {
      return bookings.filter(
        (booking) =>
          booking.status ===
          "Cancelada"
      );
    }, [bookings]);


  const completedWalkIns =
    useMemo(() => {
      return visits.filter(
        (visit) =>
          visit.status ===
          "Finalizada"
      );
    }, [visits]);


  const totalCompletedVisits =
    completedBookings.length +
    completedWalkIns.length;


  /*
  =========================
  CLIENTES
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


  const oneVisitCustomers =
    useMemo(() => {
      return customers.filter(
        (customer) =>
          Number(
            customer.totalVisits || 0
          ) === 1
      ).length;
    }, [customers]);


  const customersWithoutVisits =
    useMemo(() => {
      return customers.filter(
        (customer) =>
          Number(
            customer.totalVisits || 0
          ) === 0
      ).length;
    }, [customers]);


  const totalCustomerVisits =
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


  /*
  =========================
  ÚLTIMOS 7 DÍAS
  =========================
  */

  const last7Days =
    useMemo(() => {
      const result = [];

      for (
        let i = 6;
        i >= 0;
        i--
      ) {
        const date =
          new Date();

        date.setHours(
          0,
          0,
          0,
          0
        );

        date.setDate(
          date.getDate() - i
        );

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

        const key =
          `${year}-${month}-${day}`;


        const income =
          incomeMovements
            .filter(
              (movement) =>
                movement.createdAt
                  ?.startsWith(
                    key
                  )
            )
            .reduce(
              (
                total,
                movement
              ) =>
                total +
                Number(
                  movement.amount ||
                    0
                ),
              0
            );


        result.push({
          date:
            date.toLocaleDateString(
              "es-ES",
              {
                day:
                  "2-digit",

                month:
                  "2-digit",
              }
            ),

          ingresos:
            income,
        });
      }

      return result;
    }, [incomeMovements]);


  const hasLast7DaysIncome =
    last7Days.some(
      (day) =>
        day.ingresos > 0
    );


  /*
  =========================
  MÉTODOS DE PAGO
  =========================
  */

  const paymentMethods =
    useMemo(() => {
      const map = {};

      incomeMovements.forEach(
        (movement) => {
          const method =
            movement.paymentMethod ||
            "Otro";

          map[method] =
            (map[method] || 0) +
            Number(
              movement.amount || 0
            );
        }
      );


      return Object.entries(
        map
      )
        .map(
          ([name, value]) => ({
            name,
            value,
          })
        )
        .sort(
          (a, b) =>
            b.value -
            a.value
        );
    }, [incomeMovements]);


  /*
  =========================
  TIPOS DE VISITA
  =========================
  */

  const visitTypes =
    useMemo(() => {
      return [
        {
          name:
            "Con reserva",

          value:
            completedBookings.length,
        },

        {
          name:
            "Entrada directa",

          value:
            completedWalkIns.length,
        },
      ];
    }, [
      completedBookings,
      completedWalkIns,
    ]);


  const hasVisits =
    totalCompletedVisits > 0;


  /*
  =========================
  PORCENTAJES
  =========================
  */

  const recurrentPercentage =
    customers.length > 0
      ? (
          recurrentCustomers /
          customers.length
        ) *
        100
      : 0;


  const cancellationRate =
    bookings.length > 0
      ? (
          cancelledBookings.length /
          bookings.length
        ) *
        100
      : 0;


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
            Analítica
          </span>

          <h1>
            Estadísticas
          </h1>

          <p>
            Resumen de facturación,
            visitas y comportamiento
            de clientes.
          </p>

        </header>


        {/* FINANZAS */}

        <section className="admin-stats">

          <article className="stat-card">

            <span>
              Ingresos
            </span>

            <strong>
              {formatMoney(
                totalIncome
              )}
            </strong>

            <p>
              Facturación acumulada
            </p>

          </article>


          <article className="stat-card">

            <span>
              Gastos
            </span>

            <strong>
              {formatMoney(
                totalExpenses
              )}
            </strong>

            <p>
              Gastos registrados
            </p>

          </article>


          <article className="stat-card">

            <span>
              Balance
            </span>

            <strong>
              {formatMoney(
                balance
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
              Por cobro registrado
            </p>

          </article>

        </section>


        {/* ACTIVIDAD */}

        <section className="admin-stats">

          <article className="stat-card">

            <span>
              Visitas finalizadas
            </span>

            <strong>
              {
                totalCompletedVisits
              }
            </strong>

            <p>
              Reserva + entrada directa
            </p>

          </article>


          <article className="stat-card">

            <span>
              Con reserva
            </span>

            <strong>
              {
                completedBookings.length
              }
            </strong>

            <p>
              Reservas finalizadas
            </p>

          </article>


          <article className="stat-card">

            <span>
              Entrada directa
            </span>

            <strong>
              {
                completedWalkIns.length
              }
            </strong>

            <p>
              Visitas sin reserva
            </p>

          </article>


          <article className="stat-card">

            <span>
              Cancelaciones
            </span>

            <strong>
              {
                cancelledBookings.length
              }
            </strong>

            <p>
              {cancellationRate.toFixed(
                1
              )}
              % de las reservas
            </p>

          </article>

        </section>


        <div className="statistics-grid">

          {/* FACTURACIÓN */}

          <section className="admin-panel">

            <div className="admin-panel__heading">

              <div>

                <span>
                  Últimos 7 días
                </span>

                <h2>
                  Facturación diaria
                </h2>

              </div>

            </div>


            {hasLast7DaysIncome ? (

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <LineChart
                    data={
                      last7Days
                    }
                  >

                    <XAxis
                      dataKey="date"
                    />

                    <YAxis />

                    <Tooltip
                      formatter={
                        (value) =>
                          formatMoney(
                            value
                          )
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="ingresos"
                      name="Ingresos"
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            ) : (

              <EmptyState
                icon="📈"
                title="Sin facturación reciente"
                description="Todavía no hay ingresos registrados durante los últimos 7 días."
              />

            )}

          </section>


          {/* MÉTODOS DE PAGO */}

          <section className="admin-panel">

            <div className="admin-panel__heading">

              <div>

                <span>
                  Pagos
                </span>

                <h2>
                  Métodos de pago
                </h2>

              </div>

            </div>


            {paymentMethods.length >
            0 ? (

              <>
                <div className="chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <PieChart>

                      <Pie
                        data={
                          paymentMethods
                        }
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                        label={({
                          name,
                          percent,
                        }) =>
                          `${name} ${(
                            percent *
                            100
                          ).toFixed(
                            0
                          )}%`
                        }
                      >

                        {paymentMethods.map(
                          (
                            entry,
                            index
                          ) => (

                            <Cell
                              key={`${entry.name}-${index}`}
                            />

                          )
                        )}

                      </Pie>

                      <Tooltip
                        formatter={
                          (value) =>
                            formatMoney(
                              value
                            )
                        }
                      />

                    </PieChart>

                  </ResponsiveContainer>

                </div>


                <div className="statistics-payment-list">

                  {paymentMethods.map(
                    (method) => (

                      <div
                        key={
                          method.name
                        }
                      >

                        <span>
                          {
                            method.name
                          }
                        </span>

                        <strong>
                          {formatMoney(
                            method.value
                          )}
                        </strong>

                      </div>

                    )
                  )}

                </div>
              </>

            ) : (

              <EmptyState
                icon="💳"
                title="Sin pagos registrados"
                description="Los métodos de pago aparecerán cuando se registren cobros en Caja."
              />

            )}

          </section>


          {/* VISITAS */}

          <section className="admin-panel">

            <div className="admin-panel__heading">

              <div>

                <span>
                  Visitas
                </span>

                <h2>
                  Reserva vs directa
                </h2>

              </div>

            </div>


            {hasVisits ? (

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <BarChart
                    data={
                      visitTypes
                    }
                  >

                    <XAxis
                      dataKey="name"
                    />

                    <YAxis
                      allowDecimals={
                        false
                      }
                    />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      name="Visitas"
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            ) : (

              <EmptyState
                icon="🍽️"
                title="Sin visitas finalizadas"
                description="Cuando finalices reservas o entradas directas aparecerán aquí."
              />

            )}

          </section>


          {/* CLIENTES */}

          <section className="admin-panel">

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


            {customers.length ===
            0 ? (

              <EmptyState
                icon="👤"
                title="Sin clientes"
                description="Los datos de clientes aparecerán cuando empieces a registrar reservas o entradas directas."
              />

            ) : (

              <div className="statistics-customer-grid">

                <div>

                  <span>
                    Total clientes
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

                  <small>
                    {recurrentPercentage.toFixed(
                      1
                    )}
                    %
                  </small>

                </div>


                <div>

                  <span>
                    Una sola visita
                  </span>

                  <strong>
                    {
                      oneVisitCustomers
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Sin visitas
                  </span>

                  <strong>
                    {
                      customersWithoutVisits
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Visitas totales
                  </span>

                  <strong>
                    {
                      totalCustomerVisits
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Media visitas / cliente
                  </span>

                  <strong>
                    {customers.length >
                    0
                      ? (
                          totalCustomerVisits /
                          customers.length
                        ).toFixed(
                          1
                        )
                      : "0.0"}
                  </strong>

                </div>

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}


export default AdminStatistics;