import { initialTables } from "../data/tables";

const STORAGE_KEY = "laToscanaTables";

export function getTables() {
  try {
    const savedTables = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    if (savedTables && savedTables.length > 0) {
      return savedTables;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialTables)
    );

    return initialTables;
  } catch (error) {
    console.error("No se pudieron cargar las mesas:", error);
    return initialTables;
  }
}

export function saveTables(tables) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tables)
  );
}

export function updateTable(updatedTable) {
  const tables = getTables();

  const updatedTables = tables.map((table) =>
    table.id === updatedTable.id
      ? updatedTable
      : table
  );

  saveTables(updatedTables);

  return updatedTables;
}