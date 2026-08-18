import {
  getStoredCustomers,
  normalizeEmail,
  normalizePhone,
  saveCustomers,
} from "./customerStorageService";

import {
  getBookings,
  saveBookings,
} from "./bookingService";

import {
  getVisits,
} from "./visitService";

import {
  getCashMovements,
} from "./cashService";


function bookingBelongsToCustomer(
  booking,
  customer
) {
  if (
    booking.customerId &&
    customer.id &&
    booking.customerId === customer.id
  ) {
    return true;
  }

  const bookingEmail =
    normalizeEmail(
      booking.email || ""
    );

  const customerEmail =
    normalizeEmail(
      customer.email || ""
    );

  if (
    bookingEmail &&
    customerEmail &&
    bookingEmail === customerEmail
  ) {
    return true;
  }

  const bookingPhone =
    normalizePhone(
      booking.phone || ""
    );

  const customerPhone =
    normalizePhone(
      customer.phone || ""
    );

  return Boolean(
    bookingPhone &&
      customerPhone &&
      bookingPhone === customerPhone
  );
}


export function migrateExistingBookingsToCustomers() {
  const bookings =
    getBookings();

  const customers =
    [...getStoredCustomers()];

  let customersChanged = false;
  let bookingsChanged = false;

  const updatedBookings =
    bookings.map((booking) => {
      if (booking.customerId) {
        return booking;
      }

      const email =
        normalizeEmail(
          booking.email || ""
        );

      const phone =
        normalizePhone(
          booking.phone || ""
        );

      let customer =
        customers.find((item) => {
          const customerEmail =
            normalizeEmail(
              item.email || ""
            );

          const customerPhone =
            normalizePhone(
              item.phone || ""
            );

          return (
            (email &&
              customerEmail === email) ||
            (phone &&
              customerPhone === phone)
          );
        });

      if (!customer) {
        customer = {
          id: crypto.randomUUID(),

          name:
            booking.name ||
            "Cliente",

          email:
            booking.email || "",

          phone:
            booking.phone || "",

          createdAt:
            booking.createdAt ||
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString(),
        };

        customers.push(customer);

        customersChanged = true;
      }

      bookingsChanged = true;

      return {
        ...booking,

        customerId:
          customer.id,
      };
    });

  if (customersChanged) {
    saveCustomers(customers);
  }

  if (bookingsChanged) {
    saveBookings(
      updatedBookings
    );
  }

  return customers;
}


function getPaymentForBooking(
  bookingId,
  movements
) {
  return movements.find(
    (movement) =>
      movement.type === "Ingreso" &&
      movement.bookingId === bookingId
  );
}


function getPaymentForVisit(
  visitId,
  movements
) {
  return movements.find(
    (movement) =>
      movement.type === "Ingreso" &&
      movement.visitId === visitId
  );
}


export function getCustomerStats(
  customer
) {
  const bookings =
    getBookings();

  const visits =
    getVisits();

  const movements =
    getCashMovements();


  // RESERVAS

  const allCustomerBookings =
    bookings.filter(
      (booking) =>
        bookingBelongsToCustomer(
          booking,
          customer
        )
    );

  const customerBookings =
    allCustomerBookings.filter(
      (booking) =>
        booking.status !== "Cancelada"
    );

  const cancelledBookings =
    allCustomerBookings.filter(
      (booking) =>
        booking.status === "Cancelada"
    );

  const completedBookings =
    customerBookings.filter(
      (booking) =>
        booking.status === "Finalizada"
    );


  // ENTRADAS DIRECTAS

  const allCustomerWalkIns =
    visits.filter(
      (visit) =>
        visit.customerId ===
        customer.id
    );

  const customerWalkIns =
    allCustomerWalkIns.filter(
      (visit) =>
        visit.status !== "Cancelada"
    );

  const completedWalkIns =
    customerWalkIns.filter(
      (visit) =>
        visit.status === "Finalizada"
    );

  const cancelledWalkIns =
    allCustomerWalkIns.filter(
      (visit) =>
        visit.status === "Cancelada"
    );


  // VISITAS TOTALES

  const totalVisits =
    customerBookings.length +
    customerWalkIns.length;


  // COMENSALES

  const bookingGuests =
    customerBookings.reduce(
      (total, booking) =>
        total +
        Number(
          booking.guests || 0
        ),
      0
    );

  const walkInGuests =
    customerWalkIns.reduce(
      (total, visit) =>
        total +
        Number(
          visit.guests || 0
        ),
      0
    );

  const totalGuests =
    bookingGuests +
    walkInGuests;


  // PAGOS

  const customerPayments =
    movements.filter(
      (movement) =>
        movement.type === "Ingreso" &&
        movement.customerId ===
          customer.id
    );

  const totalSpent =
    customerPayments.reduce(
      (total, movement) =>
        total +
        Number(
          movement.amount || 0
        ),
      0
    );

  const averageTicket =
    totalVisits > 0
      ? totalSpent /
        totalVisits
      : 0;


  // HISTORIAL

  const history = [];


  allCustomerBookings.forEach(
    (booking) => {
      if (!booking.date) {
        return;
      }

      const eventDate =
        new Date(
          `${booking.date}T${
            booking.time ||
            "00:00"
          }`
        );

      if (
        Number.isNaN(
          eventDate.getTime()
        )
      ) {
        return;
      }

      const payment =
        getPaymentForBooking(
          booking.id,
          movements
        );

      history.push({
        id:
          `booking-${booking.id}`,

        sourceId:
          booking.id,

        type:
          "Reserva",

        date:
          eventDate,

        dateLabel:
          booking.date,

        time:
          booking.time || "",

        status:
          booking.status ||
          "Pendiente",

        guests:
          Number(
            booking.guests || 0
          ),

        tableName:
          booking.tableName ||
          "Sin mesa",

        area:
          booking.area ||
          "",

        paymentStatus:
          booking.paymentStatus ||
          (payment
            ? "Pagado"
            : "Pendiente"),

        amount:
          Number(
            payment?.amount ||
            booking.paidAmount ||
            0
          ),

        paymentMethod:
          payment?.paymentMethod ||
          booking.paymentMethod ||
          "",

        notes:
          booking.notes || "",
      });
    }
  );


  allCustomerWalkIns.forEach(
    (visit) => {
      if (!visit.startedAt) {
        return;
      }

      const eventDate =
        new Date(
          visit.startedAt
        );

      if (
        Number.isNaN(
          eventDate.getTime()
        )
      ) {
        return;
      }

      const payment =
        getPaymentForVisit(
          visit.id,
          movements
        );

      history.push({
        id:
          `visit-${visit.id}`,

        sourceId:
          visit.id,

        type:
          "Entrada directa",

        date:
          eventDate,

        dateLabel:
          eventDate
            .toISOString()
            .split("T")[0],

        time:
          eventDate.toLocaleTimeString(
            "es-ES",
            {
              hour:
                "2-digit",
              minute:
                "2-digit",
            }
          ),

        status:
          visit.status ||
          "Activa",

        guests:
          Number(
            visit.guests || 0
          ),

        tableName:
          visit.tableName ||
          "Sin mesa",

        area: "",

        paymentStatus:
          visit.paymentStatus ||
          (payment
            ? "Pagado"
            : "Pendiente"),

        amount:
          Number(
            payment?.amount ||
            visit.amount ||
            0
          ),

        paymentMethod:
          payment?.paymentMethod ||
          visit.paymentMethod ||
          "",

        notes:
          visit.notes || "",
      });
    }
  );


  history.sort(
    (a, b) =>
      b.date.getTime() -
      a.date.getTime()
  );


  const lastActivity =
    history[0] || null;


  return {
    reservations:
      customerBookings.length,

    cancelledReservations:
      cancelledBookings.length,

    completedReservations:
      completedBookings.length,

    walkIns:
      customerWalkIns.length,

    completedWalkIns:
      completedWalkIns.length,

    cancelledWalkIns:
      cancelledWalkIns.length,

    totalVisits,

    totalGuests,

    totalSpent,

    averageTicket,

    lastVisit:
      lastActivity?.date ||
      null,

    lastVisitType:
      lastActivity?.type ||
      "",

    lastVisitDate:
      lastActivity?.dateLabel ||
      "",

    lastVisitTime:
      lastActivity?.time ||
      "",

    notes:
      lastActivity?.notes ||
      "",

    bookings:
      customerBookings,

    visits:
      customerWalkIns,

    payments:
      customerPayments,

    history,
  };
}


export function getCustomers() {
  migrateExistingBookingsToCustomers();

  const customers =
    getStoredCustomers();

  return customers.map(
    (customer) => {
      const stats =
        getCustomerStats(
          customer
        );

      return {
        ...customer,
        ...stats,
      };
    }
  );
}


export function formatMoney(
  amount
) {
  return Number(
    amount || 0
  ).toLocaleString(
    "es-ES",
    {
      style:
        "currency",

      currency:
        "EUR",
    }
  );
}


export function formatCustomerDate(
  date
) {
  if (!date) {
    return "Sin visitas";
  }

  const parsedDate =
    date instanceof Date
      ? date
      : new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "Sin visitas";
  }

  return new Intl.DateTimeFormat(
    "es-ES",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",
    }
  ).format(
    parsedDate
  );
}