import { useEffect, useState } from "react";

import BookingForm from "../../components/booking/BookingForm";
import BookingConfirmation from "../../components/booking/BookingConfirmation";

import { getSettings } from "../../services/settingsService";

import "../../styles/booking.css";

function Booking() {
  const [createdBooking, setCreatedBooking] = useState(null);

  const [settings, setSettings] = useState(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  if (!settings) {
    return null;
  }

  return (
    <main className="booking-page">
      <section className="booking-hero">
        <span>Benvenuti</span>

        <h1>Reserva tu mesa</h1>

        <p>
          Elige el día, la hora y dinos cuántos sois.
          Nosotros nos encargamos del resto.
        </p>
      </section>

      <section className="booking-layout">
        <div className="booking-layout__main">
          {createdBooking ? (
            <BookingConfirmation
              booking={createdBooking}
              onNewBooking={() =>
                setCreatedBooking(null)
              }
            />
          ) : (
            <BookingForm
              settings={settings}
              onBookingCreated={(booking) =>
                setCreatedBooking(booking)
              }
            />
          )}
        </div>

        <aside className="booking-sidebar">
          <div className="booking-sidebar__card">
            <h3>
              {settings.restaurantName}
            </h3>

            <p>
              Cocina italiana tradicional en un
              ambiente cálido y familiar.
            </p>

            <div className="booking-sidebar__item">
              <span>🕒</span>

              <div>
                <strong>Comidas</strong>

                <p>
                  {settings.lunchStart} -{" "}
                  {settings.lunchEnd}
                </p>
              </div>
            </div>

            <div className="booking-sidebar__item">
              <span>🌙</span>

              <div>
                <strong>Cenas</strong>

                <p>
                  {settings.dinnerStart} -{" "}
                  {settings.dinnerEnd}
                </p>
              </div>
            </div>

            <div className="booking-sidebar__item">
              <span>📞</span>

              <div>
                <strong>
                  ¿Necesitas ayuda?
                </strong>

                <p>{settings.phone}</p>
              </div>
            </div>

            <div className="booking-sidebar__item">
              <span>📍</span>

              <div>
                <strong>
                  Dirección
                </strong>

                <p>
                  {settings.address}
                </p>
              </div>
            </div>
          </div>

          <div className="booking-sidebar__info">
            <strong>
              Grupos grandes
            </strong>

            <p>
              Para reservas de más de{" "}
              {settings.maxGuestsPerBooking} personas,
              contacta directamente con el restaurante.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Booking;