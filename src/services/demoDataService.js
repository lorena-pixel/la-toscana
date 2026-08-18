import { initialTables } from "../data/tables";

const KEYS = {
  customers: "laToscanaCustomers",
  bookings: "laToscanaBookings",
  visits: "laToscanaVisits",
  cash: "laToscanaCash",
  tables: "laToscanaTables",
};

function dateOffset(days) {
  const date = new Date();

  date.setDate(
    date.getDate() + days
  );

  return date
    .toISOString()
    .split("T")[0];
}

function dateTimeOffset(
  days,
  hour,
  minute = 0
) {
  const date = new Date();

  date.setDate(
    date.getDate() + days
  );

  date.setHours(
    hour,
    minute,
    0,
    0
  );

  return date.toISOString();
}

export function loadDemoData() {
  const customers = [
    {
      id: "demo-customer-1",
      name: "Laura Martínez",
      phone: "611234501",
      email: "laura.martinez@test.com",
      createdAt: dateTimeOffset(-30, 10),
      updatedAt: dateTimeOffset(-1, 18),
    },
    {
      id: "demo-customer-2",
      name: "Carlos Romero",
      phone: "622345502",
      email: "carlos.romero@test.com",
      createdAt: dateTimeOffset(-25, 11),
      updatedAt: dateTimeOffset(-3, 14),
    },
    {
      id: "demo-customer-3",
      name: "Marta García",
      phone: "633456503",
      email: "marta.garcia@test.com",
      createdAt: dateTimeOffset(-20, 9),
      updatedAt: dateTimeOffset(-2, 21),
    },
    {
      id: "demo-customer-4",
      name: "Daniel Sánchez",
      phone: "644567504",
      email: "daniel.sanchez@test.com",
      createdAt: dateTimeOffset(-18, 12),
      updatedAt: dateTimeOffset(-1, 20),
    },
    {
      id: "demo-customer-5",
      name: "Elena Fernández",
      phone: "655678505",
      email: "elena.fernandez@test.com",
      createdAt: dateTimeOffset(-16, 13),
      updatedAt: dateTimeOffset(-1, 21),
    },
    {
      id: "demo-customer-6",
      name: "Javier López",
      phone: "666789506",
      email: "javier.lopez@test.com",
      createdAt: dateTimeOffset(-12, 10),
      updatedAt: dateTimeOffset(-4, 15),
    },
    {
      id: "demo-customer-7",
      name: "Patricia Moreno",
      phone: "677890507",
      email: "patricia.moreno@test.com",
      createdAt: dateTimeOffset(-10, 17),
      updatedAt: dateTimeOffset(-2, 20),
    },
    {
      id: "demo-customer-8",
      name: "Sergio Ruiz",
      phone: "688901508",
      email: "sergio.ruiz@test.com",
      createdAt: dateTimeOffset(-8, 19),
      updatedAt: dateTimeOffset(-1, 12),
    },
    {
      id: "demo-customer-9",
      name: "Ana Torres",
      phone: "699012509",
      email: "ana.torres@test.com",
      createdAt: dateTimeOffset(-6, 11),
      updatedAt: dateTimeOffset(-1, 19),
    },
    {
      id: "demo-customer-10",
      name: "Roberto Martín",
      phone: "610123510",
      email: "roberto.martin@test.com",
      createdAt: dateTimeOffset(-5, 16),
      updatedAt: dateTimeOffset(-1, 16),
    },
  ];

  const bookings = [
    // FINALIZADAS
    {
      id: "demo-booking-1",
      customerId: "demo-customer-1",
      name: "Laura Martínez",
      phone: "611234501",
      email: "laura.martinez@test.com",

      date: dateOffset(-6),
      time: "21:00",

      guests: 2,
      area: "Interior",

      tableId: 1,
      tableName: "Mesa 1",

      occasion: "Ninguna",
      notes: "",

      status: "Finalizada",
      paymentStatus: "Pagado",

      paidAmount: 48.5,
      paymentMethod: "Tarjeta",

      createdAt: dateTimeOffset(-8, 12),
      updatedAt: dateTimeOffset(-6, 23),
      paidAt: dateTimeOffset(-6, 22, 30),
    },

    {
      id: "demo-booking-2",
      customerId: "demo-customer-3",
      name: "Marta García",
      phone: "633456503",
      email: "marta.garcia@test.com",

      date: dateOffset(-5),
      time: "20:30",

      guests: 4,
      area: "Interior",

      tableId: 3,
      tableName: "Mesa 3",

      occasion: "Cumpleaños",
      notes:
        "Una persona es alérgica a los frutos secos.",

      status: "Finalizada",
      paymentStatus: "Pagado",

      paidAmount: 96.4,
      paymentMethod: "Efectivo",

      createdAt: dateTimeOffset(-7, 13),
      updatedAt: dateTimeOffset(-5, 23),
      paidAt: dateTimeOffset(-5, 22, 20),
    },

    {
      id: "demo-booking-3",
      customerId: "demo-customer-4",
      name: "Daniel Sánchez",
      phone: "644567504",
      email: "daniel.sanchez@test.com",

      date: dateOffset(-3),
      time: "14:00",

      guests: 4,
      area: "Terraza",

      tableId: 4,
      tableName: "Mesa 4",

      occasion: "Ninguna",
      notes:
        "Necesitan una silla infantil.",

      status: "Finalizada",
      paymentStatus: "Pagado",

      paidAmount: 72.8,
      paymentMethod: "Tarjeta",

      createdAt: dateTimeOffset(-5, 11),
      updatedAt: dateTimeOffset(-3, 16),
      paidAt: dateTimeOffset(-3, 15, 30),
    },

    {
      id: "demo-booking-4",
      customerId: "demo-customer-5",
      name: "Elena Fernández",
      phone: "655678505",
      email: "elena.fernandez@test.com",

      date: dateOffset(-2),
      time: "21:00",

      guests: 6,
      area: "Interior",

      tableId: 6,
      tableName: "Mesa 6",

      occasion: "Comida familiar",
      notes:
        "Vienen con carrito de bebé.",

      status: "Finalizada",
      paymentStatus: "Pagado",

      paidAmount: 134.2,
      paymentMethod: "Tarjeta",

      createdAt: dateTimeOffset(-4, 12),
      updatedAt: dateTimeOffset(-2, 23),
      paidAt: dateTimeOffset(-2, 22, 35),
    },

    // HOY / FUTURAS
    {
      id: "demo-booking-5",
      customerId: "demo-customer-2",
      name: "Carlos Romero",
      phone: "622345502",
      email: "carlos.romero@test.com",

      date: dateOffset(0),
      time: "21:00",

      guests: 2,
      area: "Terraza",

      tableId: 2,
      tableName: "Mesa 2",

      occasion: "Aniversario",
      notes:
        "Mesa tranquila si es posible.",

      status: "Confirmada",
      paymentStatus: "Pendiente",

      createdAt: dateTimeOffset(-2, 10),
      updatedAt: dateTimeOffset(-1, 18),
    },

    {
      id: "demo-booking-6",
      customerId: "demo-customer-6",
      name: "Javier López",
      phone: "666789506",
      email: "javier.lopez@test.com",

      date: dateOffset(1),
      time: "14:00",

      guests: 6,
      area: "Interior",

      tableId: 7,
      tableName: "Mesa 7",

      occasion: "Comida de empresa",
      notes:
        "Prefieren mesa amplia.",

      status: "Pendiente",
      paymentStatus: "Pendiente",

      createdAt: dateTimeOffset(-1, 11),
    },

    {
      id: "demo-booking-7",
      customerId: "demo-customer-7",
      name: "Patricia Moreno",
      phone: "677890507",
      email: "patricia.moreno@test.com",

      date: dateOffset(2),
      time: "21:30",

      guests: 8,
      area: "Interior",

      tableId: 8,
      tableName: "Mesa 8",

      occasion: "Cumpleaños",
      notes:
        "Traerán una tarta.",

      status: "Pendiente",
      paymentStatus: "Pendiente",

      createdAt: dateTimeOffset(-1, 13),
    },

    {
      id: "demo-booking-8",
      customerId: "demo-customer-9",
      name: "Ana Torres",
      phone: "699012509",
      email: "ana.torres@test.com",

      date: dateOffset(3),
      time: "20:30",

      guests: 4,
      area: "Terraza",

      tableId: 4,
      tableName: "Mesa 4",

      occasion: "Aniversario",
      notes:
        "Necesitan acceso cómodo.",

      status: "Pendiente",
      paymentStatus: "Pendiente",

      createdAt: dateTimeOffset(0, 10),
    },
  ];

  const visits = [
    {
      id: "demo-visit-1",
      type: "Sin reserva",

      customerId: "demo-customer-4",
      customerName: "Daniel Sánchez",

      phone: "644567504",
      email: "daniel.sanchez@test.com",

      guests: 2,

      tableId: 1,
      tableName: "Mesa 1",

      notes: "",

      status: "Finalizada",

      paymentStatus: "Pagado",
      amount: 42.5,
      paymentMethod: "Tarjeta",

      startedAt: dateTimeOffset(-1, 13),
      paidAt: dateTimeOffset(-1, 14, 20),
      finishedAt: dateTimeOffset(-1, 14, 30),
    },

    {
      id: "demo-visit-2",
      type: "Sin reserva",

      customerId: "demo-customer-5",
      customerName: "Elena Fernández",

      phone: "655678505",
      email: "elena.fernandez@test.com",

      guests: 3,

      tableId: 3,
      tableName: "Mesa 3",

      notes:
        "Una silla infantil.",

      status: "Finalizada",

      paymentStatus: "Pagado",
      amount: 61.3,
      paymentMethod: "Efectivo",

      startedAt: dateTimeOffset(-1, 20),
      paidAt: dateTimeOffset(-1, 22),
      finishedAt: dateTimeOffset(-1, 22, 10),
    },

    {
      id: "demo-visit-3",
      type: "Sin reserva",

      customerId: "demo-customer-8",
      customerName: "Sergio Ruiz",

      phone: "688901508",
      email: "sergio.ruiz@test.com",

      guests: 3,

      tableId: 5,
      tableName: "Mesa 5",

      notes: "",

      status: "Activa",

      paymentStatus: "Pendiente",
      amount: 0,
      paymentMethod: null,

      startedAt: dateTimeOffset(0, 12, 30),
      finishedAt: null,
    },

    {
      id: "demo-visit-4",
      type: "Sin reserva",

      customerId: null,
      customerName: "Cliente anónimo",

      phone: "",
      email: "",

      guests: 2,

      tableId: 3,
      tableName: "Mesa 3",

      notes:
        "Cliente sin ficha.",

      status: "Finalizada",

      paymentStatus: "Pagado",
      amount: 37.9,
      paymentMethod: "Tarjeta",

      startedAt: dateTimeOffset(-4, 20),
      paidAt: dateTimeOffset(-4, 21, 35),
      finishedAt: dateTimeOffset(-4, 21, 45),
    },
  ];

  const cash = [
    // COBROS DE RESERVAS
    {
      id: "demo-cash-1",
      type: "Ingreso",

      bookingId: "demo-booking-1",
      visitId: null,

      customerId: "demo-customer-1",
      customerName: "Laura Martínez",

      amount: 48.5,
      paymentMethod: "Tarjeta",

      concept:
        "Reserva · Laura Martínez · Mesa 1",

      createdAt:
        dateTimeOffset(-6, 22, 30),
    },

    {
      id: "demo-cash-2",
      type: "Ingreso",

      bookingId: "demo-booking-2",
      visitId: null,

      customerId: "demo-customer-3",
      customerName: "Marta García",

      amount: 96.4,
      paymentMethod: "Efectivo",

      concept:
        "Reserva · Marta García · Mesa 3",

      createdAt:
        dateTimeOffset(-5, 22, 20),
    },

    {
      id: "demo-cash-3",
      type: "Ingreso",

      bookingId: "demo-booking-3",
      visitId: null,

      customerId: "demo-customer-4",
      customerName: "Daniel Sánchez",

      amount: 72.8,
      paymentMethod: "Tarjeta",

      concept:
        "Reserva · Daniel Sánchez · Mesa 4",

      createdAt:
        dateTimeOffset(-3, 15, 30),
    },

    {
      id: "demo-cash-4",
      type: "Ingreso",

      bookingId: "demo-booking-4",
      visitId: null,

      customerId: "demo-customer-5",
      customerName: "Elena Fernández",

      amount: 134.2,
      paymentMethod: "Tarjeta",

      concept:
        "Reserva · Elena Fernández · Mesa 6",

      createdAt:
        dateTimeOffset(-2, 22, 35),
    },

    // ENTRADAS DIRECTAS
    {
      id: "demo-cash-5",
      type: "Ingreso",

      bookingId: null,
      visitId: "demo-visit-1",

      customerId: "demo-customer-4",
      customerName: "Daniel Sánchez",

      amount: 42.5,
      paymentMethod: "Tarjeta",

      concept:
        "Entrada directa · Daniel Sánchez · Mesa 1",

      createdAt:
        dateTimeOffset(-1, 14, 20),
    },

    {
      id: "demo-cash-6",
      type: "Ingreso",

      bookingId: null,
      visitId: "demo-visit-2",

      customerId: "demo-customer-5",
      customerName: "Elena Fernández",

      amount: 61.3,
      paymentMethod: "Efectivo",

      concept:
        "Entrada directa · Elena Fernández · Mesa 3",

      createdAt:
        dateTimeOffset(-1, 22),
    },

    {
      id: "demo-cash-7",
      type: "Ingreso",

      bookingId: null,
      visitId: "demo-visit-4",

      customerId: null,
      customerName: "Cliente anónimo",

      amount: 37.9,
      paymentMethod: "Tarjeta",

      concept:
        "Entrada directa · Cliente anónimo · Mesa 3",

      createdAt:
        dateTimeOffset(-4, 21, 35),
    },

    // GASTOS
    {
      id: "demo-expense-1",
      type: "Gasto",

      bookingId: null,
      visitId: null,
      customerId: null,
      customerName: "",

      amount: 82.6,
      paymentMethod: "Tarjeta",

      concept:
        "Compra de verduras y productos frescos",

      createdAt:
        dateTimeOffset(-2, 10),
    },

    {
      id: "demo-expense-2",
      type: "Gasto",

      bookingId: null,
      visitId: null,
      customerId: null,
      customerName: "",

      amount: 45,
      paymentMethod: "Efectivo",

      concept:
        "Productos de limpieza",

      createdAt:
        dateTimeOffset(-1, 9),
    },
  ];

  /*
   * ESTADO ACTUAL DE MESAS
   *
   * Mesa 2 tiene reserva confirmada.
   * Mesa 5 tiene una entrada directa activa.
   * Las demás están libres.
   */
  const tables = initialTables.map(
    (table) => {
      if (table.id === 2) {
        return {
          ...table,
          status: "Reservada",
          bookingId:
            "demo-booking-5",
          visitId: null,
        };
      }

      if (table.id === 5) {
        return {
          ...table,
          status: "Ocupada",
          bookingId: null,
          visitId:
            "demo-visit-3",
        };
      }

      return {
        ...table,
        status: "Libre",
        bookingId: null,
        visitId: null,
      };
    }
  );

  localStorage.setItem(
    KEYS.customers,
    JSON.stringify(customers)
  );

  localStorage.setItem(
    KEYS.bookings,
    JSON.stringify(bookings)
  );

  localStorage.setItem(
    KEYS.visits,
    JSON.stringify(visits)
  );

  localStorage.setItem(
    KEYS.cash,
    JSON.stringify(cash)
  );

  localStorage.setItem(
    KEYS.tables,
    JSON.stringify(tables)
  );

  return {
    customers: customers.length,
    bookings: bookings.length,
    visits: visits.length,
    cashMovements: cash.length,
  };
}

export function clearDemoData() {
  localStorage.removeItem(
    KEYS.customers
  );

  localStorage.removeItem(
    KEYS.bookings
  );

  localStorage.removeItem(
    KEYS.visits
  );

  localStorage.removeItem(
    KEYS.cash
  );

  /*
   * Restauramos las mesas en lugar
   * de eliminarlas.
   */
  const cleanTables =
    initialTables.map(
      (table) => ({
        ...table,
        status: "Libre",
        bookingId: null,
        visitId: null,
      })
    );

  localStorage.setItem(
    KEYS.tables,
    JSON.stringify(cleanTables)
  );

  return true;
}