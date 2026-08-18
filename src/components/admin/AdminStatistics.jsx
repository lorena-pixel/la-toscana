import { useEffect, useMemo, useState } from "react";

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
  const [movements, setMovements] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [visits, setVisits] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    setMovements(getCashMovements());
    setBookings(getBookings());
    setVisits(getVisits());
    setCustomers(getCustomers());
  }, []);

  const incomeMovements = useMemo(
    () =>
      movements.filter(
        (movement) =>
          movement.type === "Ingreso"
      ),
    [movements]
  );

  const totalIncome = incomeMovements.reduce(
    (total, movement) =>
      total + Number(movement.amount || 0),
    0
  );

  const totalExpenses = movements
    .filter(
      (movement) =>
        movement.type === "Gasto"
    )
    .reduce(
      (total, movement) =>
        total + Number(movement.amount || 0),
      0
    );

  const balance =
    totalIncome - totalExpenses;

  const averageTicket =
    incomeMovements.length > 0
      ? totalIncome /
        incomeMovements.length
      : 0;

  const last7Days = useMemo(() => {
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(
        date.getDate() - i
      );

      const key =
        date
          .toISOString()
          .split("T")[0];

      const income =
        incomeMovements
          .filter(
            (movement) =>
              movement.createdAt?.startsWith(
                key
              )
          )
          .reduce(
            (total, movement) =>
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
              day: "2-digit",
              month: "2-digit",
            }
          ),
        ingresos: income,
      });
    }

    return result;
  }, [incomeMovements]);

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
      ).map(
        ([name, value]) => ({
          name,
          value,
        })
      );
    }, [incomeMovements]);

  const visitTypes = [
    {
      name: "Con reserva",
      value:
        bookings.filter(
          (booking) =>
            booking.status ===
            "Finalizada"
        ).length,
    },
    {
      name: "Entrada directa",
      value:
        visits.filter(
          (visit) =>
            visit.status ===
            "Finalizada"
        ).length,
    },
  ];

  const recurrentCustomers =
    customers.filter(
      (customer) =>
        customer.totalVisits > 1
    ).length;

  const newCustomers =
    customers.length -
    recurrentCustomers;

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-header">
          <span>Analítica</span>
          <h1>Estadísticas</h1>
          <p>
            Resumen de facturación,
            visitas y comportamiento
            de clientes.
          </p>
        </header>

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

        <div className="statistics-grid">
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
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="ingresos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

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
                    label
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

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

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
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

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
              </div>

              <div>
                <span>
                  Una sola visita
                </span>
                <strong>
                  {
                    newCustomers
                  }
                </strong>
              </div>

              <div>
                <span>
                  Visitas totales
                </span>
                <strong>
                  {customers.reduce(
                    (
                      total,
                      customer
                    ) =>
                      total +
                      Number(
                        customer.totalVisits ||
                          0
                      ),
                    0
                  )}
                </strong>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminStatistics;