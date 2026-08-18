import { useMemo, useState } from "react";

import { saveBooking } from "../../services/bookingService";

import {
  validateBookingRequest,
} from "../../services/availabilityService";


const initialForm = {
  name: "",
  phone: "",
  email: "",
  date: "",
  time: "",
  guests: "2",
  area: "Sin preferencia",
  occasion: "Ninguna",
  notes: "",
};


function createTimeSlots(start, end) {
  if (!start || !end) {
    return [];
  }

  const [startHours, startMinutes] =
    start
      .split(":")
      .map(Number);

  const [endHours, endMinutes] =
    end
      .split(":")
      .map(Number);

  let current =
    startHours * 60 +
    startMinutes;

  const finish =
    endHours * 60 +
    endMinutes;

  const slots = [];

  while (current <= finish) {
    const hours =
      Math.floor(
        current / 60
      );

    const minutes =
      current % 60;

    slots.push(
      `${String(hours).padStart(
        2,
        "0"
      )}:${String(minutes).padStart(
        2,
        "0"
      )}`
    );

    current += 30;
  }

  return slots;
}


function BookingForm({
  onBookingCreated,
  settings,
}) {
  const [
    formData,
    setFormData,
  ] = useState(initialForm);

  const [
    error,
    setError,
  ] = useState("");

  const [
    checking,
    setChecking,
  ] = useState(false);


  const today =
    new Date()
      .toISOString()
      .split("T")[0];


  const availableTimes =
    useMemo(() => {
      const lunchTimes =
        createTimeSlots(
          settings.lunchStart,
          settings.lunchEnd
        );

      const dinnerTimes =
        createTimeSlots(
          settings.dinnerStart,
          settings.dinnerEnd
        );

      return [
        ...lunchTimes,
        ...dinnerTimes,
      ];
    }, [settings]);


  const maxGuests =
    Number(
      settings.maxGuestsPerBooking
    ) || 8;


  const guestOptions =
    Array.from(
      {
        length: maxGuests,
      },
      (_, index) =>
        index + 1
    );


  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    setError("");
  };


  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim()
    ) {
      setError(
        "Completa todos los datos de contacto obligatorios."
      );

      return;
    }

    const guests =
      Number(
        formData.guests
      );


    setChecking(true);


    const validation =
      validateBookingRequest({
        date:
          formData.date,

        time:
          formData.time,

        guests,

        area:
          formData.area,
      });


    setChecking(false);


    if (!validation.valid) {
      setError(
        validation.message
      );

      return;
    }


    const availableTable =
      validation.table;


    const booking =
      saveBooking({
        ...formData,

        name:
          formData.name.trim(),

        phone:
          formData.phone.trim(),

        email:
          formData.email
            .trim()
            .toLowerCase(),

        guests,

        tableId:
          availableTable.id,

        tableName:
          availableTable.name,

        tableCapacity:
          availableTable.capacity,
      });


    onBookingCreated(
      booking
    );


    setFormData(
      initialForm
    );
  };


  return (
    <form
      className="booking-form"
      onSubmit={handleSubmit}
    >

      <div className="booking-form__section">

        <div className="booking-form__heading">

          <span>
            01
          </span>

          <div>

            <h2>
              Tu reserva
            </h2>

            <p>
              Selecciona cuándo quieres venir.
            </p>

          </div>

        </div>


        <div className="booking-form__grid">

          <label>

            Fecha *

            <input
              type="date"
              name="date"
              min={today}
              value={
                formData.date
              }
              onChange={
                handleChange
              }
            />

          </label>


          <label>

            Hora *

            <select
              name="time"
              value={
                formData.time
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                Selecciona una hora
              </option>


              {availableTimes.map(
                (time) => (

                  <option
                    value={time}
                    key={time}
                  >

                    {time}

                  </option>

                )
              )}

            </select>

          </label>


          <label>

            Personas *

            <select
              name="guests"
              value={
                formData.guests
              }
              onChange={
                handleChange
              }
            >

              {guestOptions.map(
                (number) => (

                  <option
                    value={number}
                    key={number}
                  >

                    {number}{" "}
                    {number === 1
                      ? "persona"
                      : "personas"}

                  </option>

                )
              )}

            </select>

          </label>


          <label>

            Zona

            <select
              name="area"
              value={
                formData.area
              }
              onChange={
                handleChange
              }
            >

              <option>
                Sin preferencia
              </option>

              <option>
                Interior
              </option>

              <option>
                Terraza
              </option>

            </select>

          </label>

        </div>

      </div>


      <div className="booking-form__section">

        <div className="booking-form__heading">

          <span>
            02
          </span>

          <div>

            <h2>
              Tus datos
            </h2>

            <p>
              Los utilizaremos para identificar tu reserva.
            </p>

          </div>

        </div>


        <div className="booking-form__grid">

          <label>

            Nombre y apellidos *

            <input
              type="text"
              name="name"
              placeholder="Ej. Laura Martínez"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
            />

          </label>


          <label>

            Teléfono *

            <input
              type="tel"
              name="phone"
              placeholder="+34 600 000 000"
              value={
                formData.phone
              }
              onChange={
                handleChange
              }
            />

          </label>


          <label className="booking-form__full">

            Email *

            <input
              type="email"
              name="email"
              placeholder="laura@email.com"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
            />

          </label>

        </div>

      </div>


      <div className="booking-form__section">

        <div className="booking-form__heading">

          <span>
            03
          </span>

          <div>

            <h2>
              Detalles adicionales
            </h2>

            <p>
              Opcional, pero nos ayuda a preparar tu visita.
            </p>

          </div>

        </div>


        <div className="booking-form__grid">

          <label>

            Ocasión

            <select
              name="occasion"
              value={
                formData.occasion
              }
              onChange={
                handleChange
              }
            >

              <option>
                Ninguna
              </option>

              <option>
                Cumpleaños
              </option>

              <option>
                Aniversario
              </option>

              <option>
                Comida familiar
              </option>

              <option>
                Comida de empresa
              </option>

              <option>
                Otra
              </option>

            </select>

          </label>


          <label className="booking-form__full">

            Observaciones

            <textarea
              name="notes"
              rows="4"
              placeholder="Carrito de bebé, alergias, silla infantil, accesibilidad..."
              value={
                formData.notes
              }
              onChange={
                handleChange
              }
            />

          </label>

        </div>

      </div>


      {error && (

        <div className="booking-form__error">

          {error}

        </div>

      )}


      <button
        className="booking-submit"
        type="submit"
        disabled={checking}
      >

        {checking
          ? "Comprobando disponibilidad..."
          : "Confirmar solicitud de reserva"}

      </button>


      <p className="booking-form__notice">

        Comprobaremos automáticamente el horario,
        el día de apertura y la disponibilidad de mesas.

      </p>

    </form>
  );
}


export default BookingForm;