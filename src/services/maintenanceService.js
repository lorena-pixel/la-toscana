import {
  getBookings,
  saveBookings,
} from "./bookingService";

import {
  getTables,
  saveTables,
} from "./tableService";

import {
  getVisits,
  saveVisits,
} from "./visitService";

import {
  getCashMovements,
  saveCashMovements,
} from "./cashService";


const AUTO_BACKUP_KEY =
  "laToscanaMaintenanceBackups";


/*
=========================
BACKUP DE SEGURIDAD
=========================
*/

export function createMaintenanceBackup() {
  try {
    const backups =
      JSON.parse(
        localStorage.getItem(
          AUTO_BACKUP_KEY
        )
      ) || [];


    const backup = {
      id:
        crypto.randomUUID(),

      createdAt:
        new Date()
          .toISOString(),

      reason:
        "Backup automático antes de mantenimiento",

      data: {
        bookings:
          getBookings(),

        tables:
          getTables(),

        visits:
          getVisits(),

        cash:
          getCashMovements(),
      },
    };


    const updatedBackups = [
      backup,
      ...backups,
    ].slice(0, 10);


    localStorage.setItem(
      AUTO_BACKUP_KEY,
      JSON.stringify(
        updatedBackups
      )
    );


    return {
      success: true,
      backup,
    };
  } catch (error) {
    console.error(
      "No se pudo crear el backup de mantenimiento:",
      error
    );


    return {
      success: false,

      message:
        "No se pudo crear la copia de seguridad.",
    };
  }
}


/*
=========================
ANALIZAR REPARACIONES
=========================
*/

export function getSafeRepairs() {
  const bookings =
    getBookings();

  const tables =
    getTables();

  const visits =
    getVisits();

  const movements =
    getCashMovements();


  const bookingIds =
    new Set(
      bookings.map(
        (booking) =>
          booking.id
      )
    );


  const visitIds =
    new Set(
      visits.map(
        (visit) =>
          visit.id
      )
    );


  const tableIds =
    new Set(
      tables.map(
        (table) =>
          Number(table.id)
      )
    );


  const repairs = [];


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
        repairs.push({
          id:
            `table-booking-${table.id}`,

          type:
            "release-table",

          category:
            "Mesas",

          title:
            `${table.name}: reserva inexistente`,

          description:
            "La mesa apunta a una reserva que ya no existe. Se eliminará la referencia y la mesa quedará libre.",

          tableId:
            table.id,
        });

        return;
      }


      if (
        table.visitId &&
        !visitIds.has(
          table.visitId
        )
      ) {
        repairs.push({
          id:
            `table-visit-${table.id}`,

          type:
            "release-table",

          category:
            "Mesas",

          title:
            `${table.name}: visita inexistente`,

          description:
            "La mesa apunta a una entrada directa que ya no existe. Se eliminará la referencia y la mesa quedará libre.",

          tableId:
            table.id,
        });

        return;
      }


      if (
        table.status ===
          "Reservada" &&
        !table.bookingId
      ) {
        repairs.push({
          id:
            `reserved-empty-${table.id}`,

          type:
            "release-table",

          category:
            "Mesas",

          title:
            `${table.name}: reservada sin reserva`,

          description:
            "La mesa figura como reservada pero no tiene ninguna reserva asociada. Se cambiará a Libre.",

          tableId:
            table.id,
        });

        return;
      }


      if (
        table.status ===
          "Ocupada" &&
        !table.bookingId &&
        !table.visitId
      ) {
        repairs.push({
          id:
            `occupied-empty-${table.id}`,

          type:
            "release-table",

          category:
            "Mesas",

          title:
            `${table.name}: ocupada sin cliente`,

          description:
            "La mesa figura como ocupada sin reserva ni visita asociada. Se cambiará a Libre.",

          tableId:
            table.id,
        });
      }
    }
  );


  /*
  =========================
  RESERVAS
  =========================
  */

  bookings.forEach(
    (booking) => {

      if (
        booking.tableId &&
        !tableIds.has(
          Number(
            booking.tableId
          )
        )
      ) {
        repairs.push({
          id:
            `booking-table-${booking.id}`,

          type:
            "remove-booking-table",

          category:
            "Reservas",

          title:
            `Reserva de ${
              booking.name ||
              "cliente"
            }: mesa inexistente`,

          description:
            "La mesa asociada ya no existe. Se eliminará la asignación de mesa, pero la reserva se conservará.",

          bookingId:
            booking.id,
        });
      }
    }
  );


  /*
  =========================
  CAJA
  =========================

  Nunca eliminamos el movimiento
  económico automáticamente.
  */

  movements.forEach(
    (movement) => {

      if (
        movement.bookingId &&
        !bookingIds.has(
          movement.bookingId
        )
      ) {
        repairs.push({
          id:
            `cash-booking-${movement.id}`,

          type:
            "remove-cash-booking-reference",

          category:
            "Caja",

          title:
            "Movimiento con reserva inexistente",

          description:
            "El movimiento económico se conservará. Solo se eliminará la referencia a la reserva inexistente.",

          movementId:
            movement.id,
        });
      }


      if (
        movement.visitId &&
        !visitIds.has(
          movement.visitId
        )
      ) {
        repairs.push({
          id:
            `cash-visit-${movement.id}`,

          type:
            "remove-cash-visit-reference",

          category:
            "Caja",

          title:
            "Movimiento con visita inexistente",

          description:
            "El movimiento económico se conservará. Solo se eliminará la referencia a la visita inexistente.",

          movementId:
            movement.id,
        });
      }
    }
  );


  return repairs;
}


/*
=========================
REPARAR UN PROBLEMA
=========================
*/

export function applySafeRepair(
  repair
) {
  try {

    /*
    -------------------------
    LIBERAR MESA
    -------------------------
    */

    if (
      repair.type ===
      "release-table"
    ) {
      const tables =
        getTables();


      const updatedTables =
        tables.map(
          (table) =>
            Number(table.id) ===
            Number(
              repair.tableId
            )
              ? {
                  ...table,

                  status:
                    "Libre",

                  bookingId:
                    null,

                  visitId:
                    null,
                }
              : table
        );


      saveTables(
        updatedTables
      );


      return {
        success: true,
      };
    }


    /*
    -------------------------
    QUITAR MESA DE RESERVA
    -------------------------
    */

    if (
      repair.type ===
      "remove-booking-table"
    ) {
      const bookings =
        getBookings();


      const updatedBookings =
        bookings.map(
          (booking) =>
            booking.id ===
            repair.bookingId
              ? {
                  ...booking,

                  tableId:
                    null,

                  tableName:
                    null,

                  updatedAt:
                    new Date()
                      .toISOString(),
                }
              : booking
        );


      saveBookings(
        updatedBookings
      );


      return {
        success: true,
      };
    }


    /*
    -------------------------
    CAJA / RESERVA
    -------------------------
    */

    if (
      repair.type ===
      "remove-cash-booking-reference"
    ) {
      const movements =
        getCashMovements();


      const updatedMovements =
        movements.map(
          (movement) =>
            movement.id ===
            repair.movementId
              ? {
                  ...movement,

                  bookingId:
                    null,
                }
              : movement
        );


      saveCashMovements(
        updatedMovements
      );


      return {
        success: true,
      };
    }


    /*
    -------------------------
    CAJA / VISITA
    -------------------------
    */

    if (
      repair.type ===
      "remove-cash-visit-reference"
    ) {
      const movements =
        getCashMovements();


      const updatedMovements =
        movements.map(
          (movement) =>
            movement.id ===
            repair.movementId
              ? {
                  ...movement,

                  visitId:
                    null,
                }
              : movement
        );


      saveCashMovements(
        updatedMovements
      );


      return {
        success: true,
      };
    }


    return {
      success: false,

      message:
        "Este problema no dispone de reparación automática.",
    };

  } catch (error) {
    console.error(
      "Error durante la reparación:",
      error
    );


    return {
      success: false,

      message:
        "No se pudo realizar la reparación.",
    };
  }
}


/*
=========================
REPARAR TODO LO SEGURO
=========================
*/

export function applyAllSafeRepairs() {
  const repairs =
    getSafeRepairs();


  if (
    repairs.length === 0
  ) {
    return {
      success: true,

      repaired: 0,

      message:
        "No hay problemas reparables automáticamente.",
    };
  }


  const backupResult =
    createMaintenanceBackup();


  if (
    !backupResult.success
  ) {
    return {
      success: false,

      repaired: 0,

      message:
        "La reparación se ha cancelado porque no se pudo crear la copia de seguridad.",
    };
  }


  let repaired = 0;


  repairs.forEach(
    (repair) => {
      const result =
        applySafeRepair(
          repair
        );


      if (
        result.success
      ) {
        repaired += 1;
      }
    }
  );


  return {
    success: true,

    repaired,

    backupId:
      backupResult.backup.id,

    message:
      `${repaired} problemas se han reparado correctamente.`,
  };
}