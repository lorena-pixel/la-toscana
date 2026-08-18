import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminSidebar from "../../components/layout/AdminSidebar";
import EmptyState from "../../components/admin/EmptyState";

import {
  formatCustomerDate,
  formatMoney,
  getCustomers,
} from "../../services/customerService";

import {
  addCustomerIncident,
  deleteCustomerIncident,
  getStoredCustomers,
} from "../../services/customerStorageService";


const INCIDENT_TYPES = {
  positive: {
    label: "Experiencia positiva",
    icon: "⭐",
  },

  unhappy: {
    label: "Cliente descontento",
    icon: "⚠️",
  },

  conflict: {
    label: "Incidencia / conflictivo",
    icon: "🔴",
  },

  note: {
    label: "Nota interna",
    icon: "📝",
  },
};


function AdminCustomers() {
  const [
    customers,
    setCustomers,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState(null);

  const [
    incidentType,
    setIncidentType,
  ] = useState("note");

  const [
    incidentNote,
    setIncidentNote,
  ] = useState("");


  /*
  =========================
  CARGAR CLIENTES
  =========================
  */

  const loadCustomers = () => {
    setCustomers(
      getCustomers()
    );
  };


  useEffect(() => {
    loadCustomers();
  }, []);


  /*
  =========================
  BÚSQUEDA
  =========================
  */

  const filteredCustomers =
    useMemo(() => {
      const text =
        search
          .trim()
          .toLowerCase();


      if (!text) {
        return customers;
      }


      return customers.filter(
        (customer) =>
          customer.name
            ?.toLowerCase()
            .includes(text) ||

          customer.email
            ?.toLowerCase()
            .includes(text) ||

          customer.phone
            ?.toLowerCase()
            .includes(text)
      );
    }, [
      customers,
      search,
    ]);


  /*
  =========================
  ESTADÍSTICAS
  =========================
  */

  const totalVisits =
    customers.reduce(
      (total, customer) =>
        total +
        Number(
          customer.totalVisits ||
          0
        ),
      0
    );


  const totalRevenue =
    customers.reduce(
      (total, customer) =>
        total +
        Number(
          customer.totalSpent ||
          0
        ),
      0
    );


  const repeatCustomers =
    customers.filter(
      (customer) =>
        Number(
          customer.totalVisits ||
          0
        ) > 1
    ).length;


  /*
  =========================
  INCIDENCIAS
  =========================
  */

  const refreshSelectedCustomer = (
    customerId
  ) => {
    const calculatedCustomers =
      getCustomers();


    setCustomers(
      calculatedCustomers
    );


    const refreshed =
      calculatedCustomers.find(
        (customer) =>
          customer.id ===
          customerId
      );


    setSelectedCustomer(
      refreshed || null
    );
  };


  const handleAddIncident = () => {
    if (
      !selectedCustomer
    ) {
      return;
    }


    const cleanNote =
      incidentNote.trim();


    if (!cleanNote) {
      window.alert(
        "Escribe una descripción antes de guardar."
      );

      return;
    }


    addCustomerIncident(
      selectedCustomer.id,
      {
        type:
          incidentType,

        note:
          cleanNote,
      }
    );


    setIncidentNote("");
    setIncidentType("note");


    refreshSelectedCustomer(
      selectedCustomer.id
    );
  };


  const handleDeleteIncident = (
    incidentId
  ) => {
    if (
      !selectedCustomer
    ) {
      return;
    }


    const confirmed =
      window.confirm(
        "¿Eliminar esta incidencia de la ficha del cliente?"
      );


    if (!confirmed) {
      return;
    }


    deleteCustomerIncident(
      selectedCustomer.id,
      incidentId
    );


    refreshSelectedCustomer(
      selectedCustomer.id
    );
  };


  /*
  =========================
  OBTENER INCIDENCIAS
  =========================
  */

  const getIncidents = (
    customerId
  ) => {
    const storedCustomers =
      getStoredCustomers();


    const customer =
      storedCustomers.find(
        (item) =>
          item.id ===
          customerId
      );


    return (
      customer?.incidents ||
      []
    );
  };


  const selectedIncidents =
    selectedCustomer
      ? getIncidents(
          selectedCustomer.id
        )
      : [];


  const sortedIncidents = [
    ...selectedIncidents,
  ].sort(
    (a, b) =>
      new Date(
        b.createdAt
      ) -
      new Date(
        a.createdAt
      )
  );


  /*
  =========================
  AVISOS CLIENTE
  =========================
  */

  const hasImportantIncident = (
    customerId
  ) =>
    getIncidents(
      customerId
    ).some(
      (incident) =>
        incident.type ===
          "unhappy" ||
        incident.type ===
          "conflict"
    );


  /*
  =========================
  RENDER
  =========================
  */

  return (
    <div className="admin-layout">

      <AdminSidebar />


      <main className="admin-main">

        <header className="admin-header admin-header--row">

          <div>

            <span>
              CRM
            </span>

            <h1>
              Clientes
            </h1>

            <p>
              Consulta visitas,
              reservas, entradas
              directas, gasto e
              incidencias de cada
              cliente.
            </p>

          </div>


          <input
            className="admin-search"
            type="search"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </header>


        {/* ESTADÍSTICAS */}

        <section className="admin-stats">

          <article className="stat-card">

            <span>
              Clientes
            </span>

            <strong>
              {customers.length}
            </strong>

            <p>
              Clientes registrados
            </p>

          </article>


          <article className="stat-card">

            <span>
              Visitas
            </span>

            <strong>
              {totalVisits}
            </strong>

            <p>
              Visitas reales finalizadas
            </p>

          </article>


          <article className="stat-card">

            <span>
              Recurrentes
            </span>

            <strong>
              {repeatCustomers}
            </strong>

            <p>
              Más de una visita
            </p>

          </article>


          <article className="stat-card">

            <span>
              Ingresos clientes
            </span>

            <strong>
              {formatMoney(
                totalRevenue
              )}
            </strong>

            <p>
              Facturación asociada
            </p>

          </article>

        </section>


        {/* TABLA */}

        <section className="admin-panel">

          <div className="admin-panel__heading">

            <div>

              <span>
                Base de datos
              </span>

              <h2>
                {
                  filteredCustomers.length
                }{" "}
                clientes
              </h2>

            </div>

          </div>


          {filteredCustomers.length ===
          0 ? (

            <EmptyState
              icon="👤"
              title="No hay clientes"
              description="Todavía no hay clientes registrados o ninguno coincide con la búsqueda."
            />

          ) : (

            <div className="customer-table-wrapper">

              <table className="customer-table">

                <thead>

                  <tr>

                    <th>
                      Cliente
                    </th>

                    <th>
                      Contacto
                    </th>

                    <th>
                      Visitas
                    </th>

                    <th>
                      Gasto
                    </th>

                    <th>
                      Ticket medio
                    </th>

                    <th>
                      Última visita
                    </th>

                    <th>
                      Incidencias
                    </th>

                    <th></th>

                  </tr>

                </thead>


                <tbody>

                  {filteredCustomers.map(
                    (customer) => {

                      const incidents =
                        getIncidents(
                          customer.id
                        );


                      const important =
                        hasImportantIncident(
                          customer.id
                        );


                      return (

                        <tr
                          key={
                            customer.id
                          }
                        >

                          <td>

                            <strong>
                              {
                                customer.name
                              }
                            </strong>


                            {customer.totalVisits >
                              1 && (

                              <span className="customer-badge">
                                Recurrente
                              </span>

                            )}


                            {important && (

                              <span className="customer-alert-badge">
                                ⚠ Aviso
                              </span>

                            )}

                          </td>


                          <td>

                            <span>
                              {customer.phone ||
                                "—"}
                            </span>

                            <span>
                              {customer.email ||
                                "—"}
                            </span>

                          </td>


                          <td>

                            <strong>
                              {
                                customer.totalVisits
                              }
                            </strong>

                          </td>


                          <td>

                            <strong>

                              {formatMoney(
                                customer.totalSpent
                              )}

                            </strong>

                          </td>


                          <td>

                            <strong>

                              {formatMoney(
                                customer.averageTicket
                              )}

                            </strong>

                          </td>


                          <td>

                            <strong>

                              {formatCustomerDate(
                                customer.lastVisit
                              )}

                            </strong>


                            {customer.lastVisitType && (

                              <span>
                                {
                                  customer.lastVisitType
                                }
                              </span>

                            )}

                          </td>


                          <td>

                            {incidents.length >
                            0 ? (

                              <strong className={
                                important
                                  ? "customer-incidents-count customer-incidents-count--warning"
                                  : "customer-incidents-count"
                              }>
                                {
                                  incidents.length
                                }
                              </strong>

                            ) : (

                              <span>
                                —
                              </span>

                            )}

                          </td>


                          <td>

                            <button
                              className="customer-view-button"
                              type="button"
                              onClick={() =>
                                setSelectedCustomer(
                                  customer
                                )
                              }
                            >
                              Ver ficha
                            </button>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* FICHA CLIENTE */}

        {selectedCustomer && (

          <div
            className="customer-modal-overlay"
            onClick={() =>
              setSelectedCustomer(
                null
              )
            }
          >

            <article
              className="customer-modal customer-modal--large"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                className="customer-modal__close"
                type="button"
                onClick={() =>
                  setSelectedCustomer(
                    null
                  )
                }
              >
                ×
              </button>


              <span className="customer-modal__label">
                Ficha de cliente
              </span>


              <h2>
                {selectedCustomer.name}
              </h2>


              {hasImportantIncident(
                selectedCustomer.id
              ) && (

                <div className="customer-important-warning">

                  ⚠ Este cliente tiene
                  incidencias que conviene
                  revisar antes de atender
                  una nueva reserva.

                </div>

              )}


              {/* DATOS */}

              <div className="customer-detail-grid">

                <div>

                  <span>
                    Teléfono
                  </span>

                  <strong>
                    {selectedCustomer.phone ||
                      "No registrado"}
                  </strong>

                </div>


                <div>

                  <span>
                    Email
                  </span>

                  <strong>
                    {selectedCustomer.email ||
                      "No registrado"}
                  </strong>

                </div>


                <div>

                  <span>
                    Visitas totales
                  </span>

                  <strong>
                    {
                      selectedCustomer.totalVisits
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Con reserva
                  </span>

                  <strong>
                    {
                      selectedCustomer.reservations
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Entradas directas
                  </span>

                  <strong>
                    {
                      selectedCustomer.walkIns
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Comensales acumulados
                  </span>

                  <strong>
                    {
                      selectedCustomer.totalGuests
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Gasto total
                  </span>

                  <strong>

                    {formatMoney(
                      selectedCustomer.totalSpent
                    )}

                  </strong>

                </div>


                <div>

                  <span>
                    Ticket medio
                  </span>

                  <strong>

                    {formatMoney(
                      selectedCustomer.averageTicket
                    )}

                  </strong>

                </div>

              </div>


              {/* INCIDENCIAS */}

              <section className="customer-incidents">

                <div className="customer-history__heading">

                  <div>

                    <span>
                      CRM interno
                    </span>

                    <h3>
                      Incidencias y notas
                    </h3>

                  </div>

                </div>


                <div className="customer-incident-form">

                  <label>

                    Tipo

                    <select
                      value={
                        incidentType
                      }
                      onChange={(event) =>
                        setIncidentType(
                          event.target.value
                        )
                      }
                    >

                      <option value="positive">
                        ⭐ Experiencia positiva
                      </option>

                      <option value="unhappy">
                        ⚠️ Cliente descontento
                      </option>

                      <option value="conflict">
                        🔴 Incidencia / conflictivo
                      </option>

                      <option value="note">
                        📝 Nota interna
                      </option>

                    </select>

                  </label>


                  <label>

                    Descripción

                    <textarea
                      rows="4"
                      value={
                        incidentNote
                      }
                      placeholder="Escribe aquí lo ocurrido, preferencias del cliente o cualquier información útil..."
                      onChange={(event) =>
                        setIncidentNote(
                          event.target.value
                        )
                      }
                    />

                  </label>


                  <button
                    type="button"
                    className="customer-incident-save"
                    onClick={
                      handleAddIncident
                    }
                  >
                    Guardar incidencia
                  </button>

                </div>


                {sortedIncidents.length ===
                0 ? (

                  <p className="customer-incidents-empty">
                    Este cliente no tiene
                    incidencias ni notas
                    registradas.
                  </p>

                ) : (

                  <div className="customer-incidents-list">

                    {sortedIncidents.map(
                      (incident) => {

                        const type =
                          INCIDENT_TYPES[
                            incident.type
                          ] ||
                          INCIDENT_TYPES.note;


                        return (

                          <article
                            className={`customer-incident customer-incident--${incident.type}`}
                            key={
                              incident.id
                            }
                          >

                            <div className="customer-incident__top">

                              <strong>

                                {type.icon}{" "}
                                {type.label}

                              </strong>


                              <span>

                                {new Date(
                                  incident.createdAt
                                ).toLocaleString(
                                  "es-ES"
                                )}

                              </span>

                            </div>


                            <p>
                              {
                                incident.note
                              }
                            </p>


                            <button
                              type="button"
                              className="customer-incident-delete"
                              onClick={() =>
                                handleDeleteIncident(
                                  incident.id
                                )
                              }
                            >
                              Eliminar
                            </button>

                          </article>

                        );
                      }
                    )}

                  </div>

                )}

              </section>


              {/* HISTORIAL */}

              <section className="customer-history">

                <div className="customer-history__heading">

                  <div>

                    <span>
                      Historial
                    </span>

                    <h3>
                      Actividad del cliente
                    </h3>

                  </div>

                </div>


                {!selectedCustomer.history ||
                selectedCustomer.history.length ===
                  0 ? (

                  <EmptyState
                    icon="🧾"
                    title="Sin historial"
                    description="Este cliente todavía no tiene reservas ni entradas directas registradas."
                  />

                ) : (

                  <div className="customer-history-list">

                    {selectedCustomer.history.map(
                      (item) => (

                        <article
                          className="customer-history-item"
                          key={
                            item.id
                          }
                        >

                          <div className="customer-history-item__top">

                            <div>

                              <span
                                className={
                                  item.type ===
                                  "Reserva"
                                    ? "customer-history-type customer-history-type--booking"
                                    : "customer-history-type customer-history-type--walkin"
                                }
                              >
                                {
                                  item.type
                                }
                              </span>


                              <h4>

                                {formatCustomerDate(
                                  item.date
                                )}{" "}
                                ·{" "}
                                {
                                  item.time
                                }

                              </h4>

                            </div>


                            <span
                              className={
                                item.status ===
                                "Cancelada"
                                  ? "customer-history-status customer-history-status--cancelled"
                                  : item.status ===
                                    "Finalizada"
                                  ? "customer-history-status customer-history-status--completed"
                                  : "customer-history-status"
                              }
                            >
                              {
                                item.status
                              }
                            </span>

                          </div>


                          <div className="customer-history-details">

                            <div>

                              <span>
                                Mesa
                              </span>

                              <strong>
                                {
                                  item.tableName
                                }
                              </strong>

                            </div>


                            <div>

                              <span>
                                Personas
                              </span>

                              <strong>
                                {
                                  item.guests
                                }
                              </strong>

                            </div>


                            <div>

                              <span>
                                Pago
                              </span>

                              <strong>
                                {
                                  item.paymentStatus
                                }
                              </strong>

                            </div>


                            <div>

                              <span>
                                Importe
                              </span>

                              <strong>

                                {item.amount >
                                0
                                  ? formatMoney(
                                      item.amount
                                    )
                                  : "—"}

                              </strong>

                            </div>


                            <div>

                              <span>
                                Método
                              </span>

                              <strong>
                                {item.paymentMethod ||
                                  "—"}
                              </strong>

                            </div>

                          </div>


                          {item.notes && (

                            <div className="customer-history-notes">

                              <span>
                                Observaciones
                              </span>

                              <p>
                                {
                                  item.notes
                                }
                              </p>

                            </div>

                          )}

                        </article>

                      )
                    )}

                  </div>

                )}

              </section>

            </article>

          </div>

        )}

      </main>

    </div>
  );
}


export default AdminCustomers;