import {
  getBookings,
} from "./bookingService";

import {
  getTables,
} from "./tableService";

import {
  getVisits,
} from "./visitService";

import {
  getCashMovements,
} from "./cashService";

import {
  getCustomers,
} from "./customerService";


function normalizeEmail(
  value = ""
) {
  return String(value)
    .trim()
    .toLowerCase();
}


function normalizePhone(
  value = ""
) {
  return String(value)
    .replace(/\s+/g, "")
    .trim();
}


export function runSystemDiagnostics() {
  const bookings =
    getBookings();

  const tables =
    getTables();

  const visits =
    getVisits();

  const movements =
    getCashMovements();

  const customers =
    getCustomers();


  const errors = [];
  const warnings = [];
  const checks = [];


  /*
  =========================
  CLIENTES
  =========================
  */

  const customerIds =
    new Set(
      customers.map(
        (customer) =>
          customer.id
      )
    );


  const duplicatedEmails =
    new Map();

  const duplicatedPhones =
    new Map();


  customers.forEach(
    (customer) => {
      const email =
        normalizeEmail(
          customer.email
        );

      const phone =
        normalizePhone(
          customer.phone
        );


      if (email) {
        if (
          !duplicatedEmails.has(
            email
          )
        ) {
          duplicatedEmails.set(
            email,
            []
          );
        }

        duplicatedEmails
          .get(email)
          .push(customer);
      }


      if (phone) {
        if (
          !duplicatedPhones.has(
            phone
          )
        ) {
          duplicatedPhones.set(
            phone,
            []
          );
        }

        duplicatedPhones
          .get(phone)
          .push(customer);
      }
    }
  );


  duplicatedEmails.forEach(
    (
      duplicatedCustomers,
      email
    ) => {
      if (
        duplicatedCustomers.length >
        1
      ) {
        warnings.push({
          id:
            `duplicate-email-${email}`,

          category:
            "Clientes",

          title:
            "Email duplicado",

          description:
            `${duplicatedCustomers.length} clientes utilizan el email ${email}.`,
        });
      }
    }
  );


  duplicatedPhones.forEach(
    (
      duplicatedCustomers,
      phone
    ) => {
      if (
        duplicatedCustomers.length >
        1
      ) {
        warnings.push({
          id:
            `duplicate-phone-${phone}`,

          category:
            "Clientes",

          title:
            "Teléfono duplicado",

          description:
            `${duplicatedCustomers.length} clientes utilizan el teléfono ${phone}.`,
        });
      }
    }
  );


  checks.push({
    name:
      "Clientes cargados",

    value:
      customers.length,

    status:
      "ok",
  });


  /*
  =========================
  RESERVAS
  =========================
  */

  const bookingIds =
    new Set(
      bookings.map(
        (booking) =>
          booking.id
      )
    );


  bookings.forEach(
    (booking) => {
      if (
        booking.customerId &&
        !customerIds.has(
          booking.customerId
        )
      ) {
        errors.push({
          id:
            `booking-customer-${booking.id}`,

          category:
            "Reservas",

          title:
            "Reserva con cliente inexistente",

          description:
            `La reserva de ${booking.name || "cliente desconocido"} apunta a un customerId que no existe.`,
        });
      }


      if (
        booking.tableId
      ) {
        const tableExists =
          tables.some(
            (table) =>
              Number(
                table.id
              ) ===
              Number(
                booking.tableId
              )
          );


        if (!tableExists) {
          warnings.push({
            id:
              `booking-table-${booking.id}`,

            category:
              "Reservas",

            title:
              "Reserva con mesa inexistente",

            description:
              `La reserva de ${booking.name || "cliente desconocido"} tiene asignada ${booking.tableName || `Mesa ${booking.tableId}`}, pero esa mesa no existe actualmente.`,
          });
        }
      }
    }
  );


  checks.push({
    name:
      "Reservas cargadas",

    value:
      bookings.length,

    status:
      "ok",
  });


  /*
  =========================
  VISITAS
  =========================
  */

  const visitIds =
    new Set(
      visits.map(
        (visit) =>
          visit.id
      )
    );


  visits.forEach(
    (visit) => {
      /*
       * customerId puede ser null
       * porque permitimos clientes
       * anónimos.
       */
      if (
        visit.customerId &&
        !customerIds.has(
          visit.customerId
        )
      ) {
        errors.push({
          id:
            `visit-customer-${visit.id}`,

          category:
            "Entradas directas",

          title:
            "Visita con cliente inexistente",

          description:
            `La visita de ${visit.customerName || "cliente desconocido"} apunta a un cliente que ya no existe.`,
        });
      }


      if (
        visit.tableId
      ) {
        const tableExists =
          tables.some(
            (table) =>
              Number(
                table.id
              ) ===
              Number(
                visit.tableId
              )
          );


        if (!tableExists) {
          warnings.push({
            id:
              `visit-table-${visit.id}`,

            category:
              "Entradas directas",

            title:
              "Visita con mesa inexistente",

            description:
              `La visita de ${visit.customerName || "cliente desconocido"} tiene una mesa que no existe actualmente.`,
          });
        }
      }
    }
  );


  checks.push({
    name:
      "Visitas cargadas",

    value:
      visits.length,

    status:
      "ok",
  });


  /*
  =========================
  MESAS
  =========================
  */

  tables.forEach(
    (table) => {
      if (
        table.bookingId &&
        !bookingIds.has(
          table.bookingId
        )
      ) {
        errors.push({
          id:
            `table-booking-${table.id}`,

          category:
            "Mesas",

          title:
            "Mesa vinculada a reserva inexistente",

          description:
            `${table.name} contiene un bookingId que no corresponde a ninguna reserva.`,
        });
      }


      if (
        table.visitId &&
        !visitIds.has(
          table.visitId
        )
      ) {
        errors.push({
          id:
            `table-visit-${table.id}`,

          category:
            "Mesas",

          title:
            "Mesa vinculada a visita inexistente",

          description:
            `${table.name} contiene un visitId que no corresponde a ninguna entrada directa.`,
        });
      }


      if (
        table.status ===
          "Reservada" &&
        !table.bookingId
      ) {
        warnings.push({
          id:
            `reserved-without-booking-${table.id}`,

          category:
            "Mesas",

          title:
            "Mesa reservada sin reserva",

          description:
            `${table.name} figura como Reservada pero no tiene bookingId.`,
        });
      }


      if (
        table.status ===
          "Ocupada" &&
        !table.bookingId &&
        !table.visitId
      ) {
        warnings.push({
          id:
            `occupied-empty-${table.id}`,

          category:
            "Mesas",

          title:
            "Mesa ocupada sin cliente",

          description:
            `${table.name} figura como Ocupada pero no tiene reserva ni visita vinculada.`,
        });
      }
    }
  );


  checks.push({
    name:
      "Mesas cargadas",

    value:
      tables.length,

    status:
      "ok",
  });


  /*
  =========================
  CAJA
  =========================
  */

  movements.forEach(
    (movement) => {
      if (
        movement.bookingId &&
        !bookingIds.has(
          movement.bookingId
        )
      ) {
        warnings.push({
          id:
            `cash-booking-${movement.id}`,

          category:
            "Caja",

          title:
            "Cobro con reserva inexistente",

          description:
            `El movimiento "${movement.concept || movement.id}" está vinculado a una reserva que ya no existe.`,
        });
      }


      if (
        movement.visitId &&
        !visitIds.has(
          movement.visitId
        )
      ) {
        warnings.push({
          id:
            `cash-visit-${movement.id}`,

          category:
            "Caja",

          title:
            "Cobro con visita inexistente",

          description:
            `El movimiento "${movement.concept || movement.id}" está vinculado a una visita que ya no existe.`,
        });
      }


      /*
       * Los gastos y clientes
       * anónimos pueden no tener
       * customerId.
       */
      if (
        movement.customerId &&
        !customerIds.has(
          movement.customerId
        )
      ) {
        warnings.push({
          id:
            `cash-customer-${movement.id}`,

          category:
            "Caja",

          title:
            "Movimiento con cliente inexistente",

          description:
            `El movimiento "${movement.concept || movement.id}" apunta a un cliente que ya no existe.`,
        });
      }
    }
  );


  checks.push({
    name:
      "Movimientos de caja",

    value:
      movements.length,

    status:
      "ok",
  });


  /*
  =========================
  RESULTADO
  =========================
  */

  let status =
    "healthy";

  if (
    warnings.length > 0
  ) {
    status =
      "warning";
  }


  if (
    errors.length > 0
  ) {
    status =
      "error";
  }


  return {
    status,

    checkedAt:
      new Date()
        .toISOString(),

    totals: {
      customers:
        customers.length,

      bookings:
        bookings.length,

      visits:
        visits.length,

      tables:
        tables.length,

      movements:
        movements.length,

      errors:
        errors.length,

      warnings:
        warnings.length,
    },

    checks,

    errors,

    warnings,
  };
}