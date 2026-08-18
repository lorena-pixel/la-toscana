import { getBookings } from "./bookingService";
import { getTables } from "./tableService";
import { getSettings } from "./settingsService";

function timeToMinutes(time) {
  if (!time) return 0;

  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

function bookingsOverlap(
  firstTime,
  firstDuration,
  secondTime,
  secondDuration
) {
  const firstStart =
    timeToMinutes(firstTime);

  const firstEnd =
    firstStart +
    Number(firstDuration);

  const secondStart =
    timeToMinutes(secondTime);

  const secondEnd =
    secondStart +
    Number(secondDuration);

  return (
    firstStart < secondEnd &&
    secondStart < firstEnd
  );
}

function getDaySetting(dateString) {
  const date =
    new Date(
      `${dateString}T12:00:00`
    );

  const day =
    date.getDay();

  const settingsByDay = {
    0: "sundayOpen",
    1: "mondayOpen",
    2: "tuesdayOpen",
    3: "wednesdayOpen",
    4: "thursdayOpen",
    5: "fridayOpen",
    6: "saturdayOpen",
  };

  return settingsByDay[day];
}

export function isRestaurantOpenOnDate(
  dateString
) {
  if (!dateString) {
    return false;
  }

  const settings =
    getSettings();

  const key =
    getDaySetting(
      dateString
    );

  return settings[key] !== false;
}

export function isDateInPast(
  dateString
) {
  if (!dateString) {
    return true;
  }

  const selected =
    new Date(
      `${dateString}T00:00:00`
    );

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  return selected < today;
}

export function isTimeInsideOpeningHours(
  time
) {
  const settings =
    getSettings();

  const selected =
    timeToMinutes(time);

  const lunchStart =
    timeToMinutes(
      settings.lunchStart
    );

  const lunchEnd =
    timeToMinutes(
      settings.lunchEnd
    );

  const dinnerStart =
    timeToMinutes(
      settings.dinnerStart
    );

  const dinnerEnd =
    timeToMinutes(
      settings.dinnerEnd
    );

  const insideLunch =
    selected >= lunchStart &&
    selected <= lunchEnd;

  const insideDinner =
    selected >= dinnerStart &&
    selected <= dinnerEnd;

  return (
    insideLunch ||
    insideDinner
  );
}

export function getAvailableTables({
  date,
  time,
  guests,
  area,
}) {
  if (
    !date ||
    !time ||
    !guests
  ) {
    return [];
  }

  if (
    isDateInPast(date)
  ) {
    return [];
  }

  if (
    !isRestaurantOpenOnDate(
      date
    )
  ) {
    return [];
  }

  if (
    !isTimeInsideOpeningHours(
      time
    )
  ) {
    return [];
  }

  const tables =
    getTables();

  const bookings =
    getBookings();

  const settings =
    getSettings();

  const duration =
    Number(
      settings.bookingDuration
    ) || 120;

  const activeBookings =
    bookings.filter(
      (booking) =>
        booking.date === date &&
        booking.status !==
          "Cancelada" &&
        booking.status !==
          "Finalizada"
    );

  return tables.filter(
    (table) => {
      if (
        Number(table.capacity) <
        Number(guests)
      ) {
        return false;
      }

      if (
        area &&
        area !==
          "Sin preferencia" &&
        table.area !== area
      ) {
        return false;
      }

      /*
       * Si existe una visita activa
       * en esa mesa, tampoco puede
       * reservarse.
       */
      if (
        table.visitId &&
        table.status ===
          "Ocupada"
      ) {
        return false;
      }

      const tableBookings =
        activeBookings.filter(
          (booking) =>
            Number(
              booking.tableId
            ) ===
            Number(
              table.id
            )
        );

      const overlap =
        tableBookings.some(
          (booking) =>
            bookingsOverlap(
              booking.time,
              duration,
              time,
              duration
            )
        );

      return !overlap;
    }
  );
}

export function findBestAvailableTable({
  date,
  time,
  guests,
  area,
}) {
  const availableTables =
    getAvailableTables({
      date,
      time,
      guests,
      area,
    });

  if (
    availableTables.length ===
    0
  ) {
    return null;
  }

  return [
    ...availableTables,
  ].sort((a, b) => {
    /*
     * Escogemos primero la mesa
     * más pequeña que pueda atender
     * correctamente al grupo.
     */
    if (
      Number(a.capacity) !==
      Number(b.capacity)
    ) {
      return (
        Number(a.capacity) -
        Number(b.capacity)
      );
    }

    return (
      Number(a.id) -
      Number(b.id)
    );
  })[0];
}

export function validateBookingRequest({
  date,
  time,
  guests,
  area,
}) {
  if (!date) {
    return {
      valid: false,
      message:
        "Selecciona una fecha.",
    };
  }

  if (
    isDateInPast(date)
  ) {
    return {
      valid: false,
      message:
        "No puedes reservar una fecha pasada.",
    };
  }

  if (
    !isRestaurantOpenOnDate(
      date
    )
  ) {
    return {
      valid: false,
      message:
        "El restaurante está cerrado ese día.",
    };
  }

  if (!time) {
    return {
      valid: false,
      message:
        "Selecciona una hora.",
    };
  }

  if (
    !isTimeInsideOpeningHours(
      time
    )
  ) {
    return {
      valid: false,
      message:
        "La hora seleccionada está fuera del horario de servicio.",
    };
  }

  if (
    Number(guests) < 1
  ) {
    return {
      valid: false,
      message:
        "El número de personas no es válido.",
    };
  }

  const table =
    findBestAvailableTable({
      date,
      time,
      guests:
        Number(guests),
      area,
    });

  if (!table) {
    return {
      valid: false,
      message:
        "No hay ninguna mesa disponible para esa fecha, hora y número de personas.",
    };
  }

  return {
    valid: true,
    table,
  };
}