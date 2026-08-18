import {
  getTables,
  saveTables,
} from "./tableService";

const VISITS_STORAGE_KEY = "laToscanaVisits";

export function getVisits() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(VISITS_STORAGE_KEY)
      ) || []
    );
  } catch (error) {
    console.error(
      "No se pudieron cargar las visitas:",
      error
    );

    return [];
  }
}

export function saveVisits(visits) {
  localStorage.setItem(
    VISITS_STORAGE_KEY,
    JSON.stringify(visits)
  );
}

export function createWalkInVisit({
  customerId = null,
  customerName = "Cliente anónimo",
  phone = "",
  email = "",
  guests,
  tableId,
  notes = "",
}) {
  const visits = getVisits();
  const tables = getTables();

  const table = tables.find(
    (item) =>
      Number(item.id) === Number(tableId)
  );

  if (!table) {
    return {
      success: false,
      message:
        "La mesa seleccionada no existe.",
    };
  }

  if (
    table.status !== "Libre" ||
    table.bookingId ||
    table.visitId
  ) {
    return {
      success: false,
      message:
        "La mesa ya no está disponible.",
    };
  }

  if (
    Number(guests) >
    Number(table.capacity)
  ) {
    return {
      success: false,
      message:
        "La mesa seleccionada no tiene capacidad suficiente.",
    };
  }

  const newVisit = {
    id: crypto.randomUUID(),

    type: "Sin reserva",

    customerId,
    customerName,
    phone,
    email,

    guests: Number(guests),

    tableId: table.id,
    tableName: table.name,

    notes,

    status: "Activa",

    paymentStatus: "Pendiente",
    amount: 0,
    paymentMethod: null,
    paidAt: null,

    startedAt:
      new Date().toISOString(),

    finishedAt: null,
  };

  saveVisits([
    ...visits,
    newVisit,
  ]);

  const updatedTables =
    tables.map((item) =>
      item.id === table.id
        ? {
            ...item,
            status: "Ocupada",
            visitId: newVisit.id,
          }
        : item
    );

  saveTables(updatedTables);

  return {
    success: true,
    visit: newVisit,
  };
}

export function updateVisit(
  updatedVisit
) {
  const visits = getVisits();

  const updatedVisits =
    visits.map((visit) =>
      visit.id === updatedVisit.id
        ? updatedVisit
        : visit
    );

  saveVisits(updatedVisits);

  return updatedVisits;
}

export function markVisitAsPaid({
  visitId,
  amount,
  paymentMethod,
}) {
  const visits = getVisits();

  const visit = visits.find(
    (item) =>
      item.id === visitId
  );

  if (!visit) {
    return null;
  }

  const updatedVisit = {
    ...visit,

    paymentStatus: "Pagado",

    amount:
      Number(amount),

    paymentMethod,

    paidAt:
      new Date().toISOString(),
  };

  const updatedVisits =
    visits.map((item) =>
      item.id === visitId
        ? updatedVisit
        : item
    );

  saveVisits(updatedVisits);

  return updatedVisit;
}

export function finalizeVisit(
  visitId
) {
  const visits = getVisits();

  const visit = visits.find(
    (item) =>
      item.id === visitId
  );

  if (!visit) {
    return {
      success: false,
      message:
        "No se encontró la visita.",
    };
  }

  const updatedVisit = {
    ...visit,

    status: "Finalizada",

    finishedAt:
      new Date().toISOString(),
  };

  const updatedVisits =
    visits.map((item) =>
      item.id === visitId
        ? updatedVisit
        : item
    );

  saveVisits(updatedVisits);

  const tables = getTables();

  const updatedTables =
    tables.map((table) =>
      Number(table.id) ===
      Number(visit.tableId)
        ? {
            ...table,
            status: "Libre",
            visitId: null,
          }
        : table
    );

  saveTables(updatedTables);

  return {
    success: true,
    visit: updatedVisit,
  };
}

export function cancelVisit(
  visitId
) {
  const visits = getVisits();

  const visit = visits.find(
    (item) =>
      item.id === visitId
  );

  if (!visit) {
    return {
      success: false,
      message:
        "No se encontró la visita.",
    };
  }

  const updatedVisit = {
    ...visit,

    status: "Cancelada",

    finishedAt:
      new Date().toISOString(),
  };

  const updatedVisits =
    visits.map((item) =>
      item.id === visitId
        ? updatedVisit
        : item
    );

  saveVisits(updatedVisits);

  const tables = getTables();

  const updatedTables =
    tables.map((table) =>
      Number(table.id) ===
      Number(visit.tableId)
        ? {
            ...table,
            status: "Libre",
            visitId: null,
          }
        : table
    );

  saveTables(updatedTables);

  return {
    success: true,
    visit: updatedVisit,
  };
}