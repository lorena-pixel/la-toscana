import {
  initialTables,
} from "../data/tables";

const TABLES_STORAGE_KEY =
  "laToscanaTables";

export function migrateTablesToNewLayout() {
  try {
    const currentTables =
      JSON.parse(
        localStorage.getItem(
          TABLES_STORAGE_KEY
        )
      ) || [];

    /*
    =========================
    CONSERVAR ESTADOS CUANDO SEA POSIBLE
    =========================
    */

    const migratedTables =
      initialTables.map(
        (newTable) => {
          const oldTable =
            currentTables.find(
              (table) =>
                Number(table.id) ===
                Number(newTable.id)
            );

          if (!oldTable) {
            return {
              ...newTable,
            };
          }

          return {
            ...newTable,

            status:
              oldTable.status ||
              "Libre",

            bookingId:
              oldTable.bookingId ||
              null,

            visitId:
              oldTable.visitId ||
              null,
          };
        }
      );

    /*
    =========================
    GUARDAR SOLO MESAS
    =========================
    */

    localStorage.setItem(
      TABLES_STORAGE_KEY,
      JSON.stringify(
        migratedTables
      )
    );

    return {
      success: true,
      tables:
        migratedTables,
    };
  } catch (error) {
    console.error(
      "No se pudieron migrar las mesas:",
      error
    );

    return {
      success: false,

      message:
        "No se pudieron actualizar las mesas.",
    };
  }
}