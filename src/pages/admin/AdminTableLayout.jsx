import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import AdminSidebar from "../../components/layout/AdminSidebar";

import {
  getBookings,
} from "../../services/bookingService";

import {
  createDefaultLayout,
  getTableLayoutByDate,
  saveTableLayout,
} from "../../services/tableLayoutService";

import "../../styles/tableLayout.css";


function getLocalDate() {
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
}


function AdminTableLayout() {
  const navigate =
    useNavigate();

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    getLocalDate()
  );

  const [
    interiorCount,
    setInteriorCount,
  ] = useState(5);

  const [
    terraceCount,
    setTerraceCount,
  ] = useState(5);

  const [
    layout,
    setLayout,
  ] = useState(null);

  const [
    bookings,
    setBookings,
  ] = useState([]);

  const [
    message,
    setMessage,
  ] = useState("");


  useEffect(() => {
    setBookings(
      getBookings()
    );
  }, []);


  useEffect(() => {
    const stored =
      getTableLayoutByDate(
        selectedDate
      );

    if (stored) {
      setLayout(
        stored
      );

      setInteriorCount(
        stored.interior
          ?.length || 0
      );

      setTerraceCount(
        stored.terrace
          ?.length || 0
      );
    } else {
      setLayout(null);
    }

    setMessage("");
  }, [selectedDate]);


  const dayBookings =
    useMemo(() => {
      return bookings.filter(
        (booking) =>
          booking.date ===
            selectedDate &&
          booking.status !==
            "Cancelada"
      );
    }, [
      bookings,
      selectedDate,
    ]);


  const totalGuests =
    dayBookings.reduce(
      (total, booking) =>
        total +
        Number(
          booking.guests || 0
        ),
      0
    );


  const interiorGuests =
    dayBookings
      .filter(
        (booking) =>
          booking.area ===
          "Interior"
      )
      .reduce(
        (total, booking) =>
          total +
          Number(
            booking.guests || 0
          ),
        0
      );


  const terraceGuests =
    dayBookings
      .filter(
        (booking) =>
          booking.area ===
          "Terraza"
      )
      .reduce(
        (total, booking) =>
          total +
          Number(
            booking.guests || 0
          ),
        0
      );


  const totalCapacity =
    layout
      ? [
          ...layout.interior,
          ...layout.terrace,
        ].reduce(
          (
            total,
            table
          ) =>
            total +
            Number(
              table.capacity ||
              0
            ),
          0
        )
      : 0;


  const handleGenerate =
    () => {
      const newLayout =
        createDefaultLayout({
          date:
            selectedDate,

          interiorCount:
            Number(
              interiorCount
            ),

          terraceCount:
            Number(
              terraceCount
            ),
        });

      setLayout(
        newLayout
      );

      setMessage(
        "Distribución generada. Ajusta las capacidades y pulsa Guardar."
      );
    };


  const updateTableCapacity = (
    area,
    tableId,
    capacity
  ) => {
    if (!layout) {
      return;
    }

    setLayout(
      (current) => ({
        ...current,

        [area]:
          current[
            area
          ].map(
            (table) =>
              table.id ===
              tableId
                ? {
                    ...table,

                    capacity:
                      Number(
                        capacity
                      ),
                  }
                : table
          ),
      })
    );
  };


  const handleSave =
    () => {
      if (!layout) {
        setMessage(
          "Primero genera una distribución."
        );

        return;
      }

      saveTableLayout(
        selectedDate,
        layout
      );

      setMessage(
        "Distribución guardada correctamente."
      );
    };


  const renderTables = (
    area,
    title
  ) => {
    if (!layout) {
      return null;
    }

    const tables =
      layout[area];

    return (
      <section className="table-layout-section">

        <div className="table-layout-section__heading">

          <h2>
            {title}
          </h2>

          <span>
            {tables.length} mesas
          </span>

        </div>


        <div className="table-layout-grid">

          {tables.map(
            (table) => (

              <article
                className="table-layout-card"
                key={
                  table.id
                }
              >

                <strong>
                  {
                    table.name
                  }
                </strong>


                <label>

                  Capacidad

                  <select
                    value={
                      table.capacity
                    }
                    onChange={
                      (event) =>
                        updateTableCapacity(
                          area,
                          table.id,
                          event.target.value
                        )
                    }
                  >

                    <option value="2">
                      2 personas
                    </option>

                    <option value="4">
                      4 personas
                    </option>

                    <option value="6">
                      6 personas
                    </option>

                    <option value="8">
                      8 personas
                    </option>

                    <option value="10">
                      10 personas
                    </option>

                  </select>

                </label>

              </article>

            )
          )}

        </div>

      </section>
    );
  };


  return (
    <div className="admin-layout">

      <AdminSidebar />


      <main className="admin-main">

        <header className="admin-header admin-header--row">

          <div>

            <span>
              Organización diaria
            </span>

            <h1>
              Distribuir mesas
            </h1>

            <p>
              Configura cuántas mesas se montarán
              en Interior y Terraza según las
              reservas del día.
            </p>

          </div>


          <button
            type="button"
            className="table-layout-back"
            onClick={
              () =>
                navigate(
                  "/admin/mesas"
                )
            }
          >
            ← Volver a Mesas
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
              Reservas
            </span>

            <strong>
              {
                dayBookings.length
              }
            </strong>

            <p>
              Para la fecha elegida
            </p>

          </article>


          <article className="stat-card">

            <span>
              Comensales
            </span>

            <strong>
              {
                totalGuests
              }
            </strong>

            <p>
              Personas reservadas
            </p>

          </article>


          <article className="stat-card">

            <span>
              Interior
            </span>

            <strong>
              {
                interiorGuests
              }
            </strong>

            <p>
              Personas solicitadas
            </p>

          </article>


          <article className="stat-card">

            <span>
              Terraza
            </span>

            <strong>
              {
                terraceGuests
              }
            </strong>

            <p>
              Personas solicitadas
            </p>

          </article>

        </section>


        <section className="admin-panel table-layout-config">

          <div className="admin-panel__heading">

            <div>

              <span>
                Configuración
              </span>

              <h2>
                Distribución del día
              </h2>

            </div>

          </div>


          <div className="table-layout-controls">

            <label>

              Fecha

              <input
                type="date"
                value={
                  selectedDate
                }
                onChange={
                  (event) =>
                    setSelectedDate(
                      event.target.value
                    )
                }
              />

            </label>


            <label>

              Mesas Interior

              <input
                type="number"
                min="0"
                max="10"
                value={
                  interiorCount
                }
                onChange={
                  (event) =>
                    setInteriorCount(
                      event.target.value
                    )
                }
              />

            </label>


            <label>

              Mesas Terraza

              <input
                type="number"
                min="0"
                max="10"
                value={
                  terraceCount
                }
                onChange={
                  (event) =>
                    setTerraceCount(
                      event.target.value
                    )
                }
              />

            </label>


            <button
              type="button"
              onClick={
                handleGenerate
              }
            >
              Generar distribución
            </button>

          </div>

        </section>


        {layout && (

          <>

            {totalCapacity <
              totalGuests && (

              <div className="table-layout-warning">

                ⚠ Capacidad insuficiente:
                tienes {totalGuests} comensales
                reservados y la distribución
                actual admite {totalCapacity}.

              </div>

            )}


            {renderTables(
              "interior",
              "Interior"
            )}


            {renderTables(
              "terrace",
              "Terraza"
            )}


            <div className="table-layout-save">

              <button
                type="button"
                onClick={
                  handleSave
                }
              >
                Guardar distribución
              </button>

            </div>

          </>

        )}

      </main>

    </div>
  );
}


export default AdminTableLayout;