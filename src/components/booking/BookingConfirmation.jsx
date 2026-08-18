import { Link } from "react-router-dom";

function BookingConfirmation({
  booking,
  onNewBooking,
}) {
  return (
    <section className="booking-confirmation">
      <div className="booking-confirmation__icon">
        ✓
      </div>

      <span>
        Solicitud recibida
      </span>

      <h2>
        Gracias, {booking.name}
      </h2>

      <p>
        Hemos registrado tu solicitud de reserva
        en La Toscana.
      </p>

      <div className="booking-summary">
        <div>
          <span>Fecha</span>
          <strong>
            {booking.date}
          </strong>
        </div>

        <div>
          <span>Hora</span>
          <strong>
            {booking.time}
          </strong>
        </div>

        <div>
          <span>Personas</span>
          <strong>
            {booking.guests}
          </strong>
        </div>

        <div>
          <span>Mesa</span>
          <strong>
            {booking.tableName ||
              "Por asignar"}
          </strong>
        </div>
      </div>

      <p className="booking-confirmation__status">
        Estado actual:{" "}
        <strong>
          {booking.status}
        </strong>
      </p>

      <div className="booking-confirmation__actions">
        <button
          onClick={
            onNewBooking
          }
        >
          Hacer otra reserva
        </button>

        <Link to="/">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}

export default BookingConfirmation;