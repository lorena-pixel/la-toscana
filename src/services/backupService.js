const BACKUP_KEYS = {
  bookings: "laToscanaBookings",
  customers: "laToscanaCustomers",
  visits: "laToscanaVisits",
  cash: "laToscanaCash",
  tables: "laToscanaTables",
  menu: "laToscanaMenu",
  settings: "laToscanaSettings",
};

function getStoredValue(key, fallback) {
  try {
    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function createBackupData() {
  const backup = {
    meta: {
      app: "La Toscana",
      version: 1,
      createdAt:
        new Date().toISOString(),
      type: "full-backup",
    },

    data: {
      bookings:
        getStoredValue(
          BACKUP_KEYS.bookings,
          []
        ),

      customers:
        getStoredValue(
          BACKUP_KEYS.customers,
          []
        ),

      visits:
        getStoredValue(
          BACKUP_KEYS.visits,
          []
        ),

      cash:
        getStoredValue(
          BACKUP_KEYS.cash,
          []
        ),

      tables:
        getStoredValue(
          BACKUP_KEYS.tables,
          []
        ),

      menu:
        getStoredValue(
          BACKUP_KEYS.menu,
          []
        ),

      settings:
        getStoredValue(
          BACKUP_KEYS.settings,
          {}
        ),
    },
  };

  return backup;
}

export function getBackupSummary(
  backup
) {
  return {
    createdAt:
      backup?.meta?.createdAt ||
      null,

    bookings:
      backup?.data?.bookings
        ?.length || 0,

    customers:
      backup?.data?.customers
        ?.length || 0,

    visits:
      backup?.data?.visits
        ?.length || 0,

    cash:
      backup?.data?.cash
        ?.length || 0,

    tables:
      backup?.data?.tables
        ?.length || 0,

    menu:
      backup?.data?.menu
        ?.length || 0,
  };
}

export function downloadBackup() {
  const backup =
    createBackupData();

  const json =
    JSON.stringify(
      backup,
      null,
      2
    );

  const blob =
    new Blob(
      [json],
      {
        type:
          "application/json",
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  const hours =
    String(
      date.getHours()
    ).padStart(2, "0");

  const minutes =
    String(
      date.getMinutes()
    ).padStart(2, "0");

  const filename =
    `la-toscana-backup-${year}-${month}-${day}-${hours}${minutes}.json`;

  const link =
    document.createElement(
      "a"
    );

  link.href = url;
  link.download =
    filename;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  URL.revokeObjectURL(
    url
  );

  return {
    success: true,
    filename,
    backup,
  };
}

export function validateBackup(
  backup
) {
  if (
    !backup ||
    typeof backup !==
      "object"
  ) {
    return {
      valid: false,
      message:
        "El archivo no contiene una copia válida.",
    };
  }

  if (
    backup.meta?.app !==
    "La Toscana"
  ) {
    return {
      valid: false,
      message:
        "El archivo no pertenece a La Toscana.",
    };
  }

  if (
    backup.meta?.type !==
    "full-backup"
  ) {
    return {
      valid: false,
      message:
        "El tipo de copia no es compatible.",
    };
  }

  if (
    !backup.data ||
    typeof backup.data !==
      "object"
  ) {
    return {
      valid: false,
      message:
        "La copia no contiene datos restaurables.",
    };
  }

  const arrayFields = [
    "bookings",
    "customers",
    "visits",
    "cash",
    "tables",
    "menu",
  ];

  for (
    const field
    of arrayFields
  ) {
    if (
      !Array.isArray(
        backup.data[field]
      )
    ) {
      return {
        valid: false,
        message:
          `El bloque "${field}" no es válido.`,
      };
    }
  }

  if (
    !backup.data.settings ||
    typeof backup.data
      .settings !==
      "object"
  ) {
    return {
      valid: false,
      message:
        "La configuración del backup no es válida.",
    };
  }

  return {
    valid: true,
  };
}

export function restoreBackup(
  backup
) {
  const validation =
    validateBackup(
      backup
    );

  if (!validation.valid) {
    return {
      success: false,
      message:
        validation.message,
    };
  }

  try {
    localStorage.setItem(
      BACKUP_KEYS.bookings,
      JSON.stringify(
        backup.data.bookings
      )
    );

    localStorage.setItem(
      BACKUP_KEYS.customers,
      JSON.stringify(
        backup.data.customers
      )
    );

    localStorage.setItem(
      BACKUP_KEYS.visits,
      JSON.stringify(
        backup.data.visits
      )
    );

    localStorage.setItem(
      BACKUP_KEYS.cash,
      JSON.stringify(
        backup.data.cash
      )
    );

    localStorage.setItem(
      BACKUP_KEYS.tables,
      JSON.stringify(
        backup.data.tables
      )
    );

    localStorage.setItem(
      BACKUP_KEYS.menu,
      JSON.stringify(
        backup.data.menu
      )
    );

    localStorage.setItem(
      BACKUP_KEYS.settings,
      JSON.stringify(
        backup.data.settings
      )
    );

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      message:
        "No se pudo restaurar la copia de seguridad.",
    };
  }
}

export function readBackupFile(
  file
) {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const reader =
        new FileReader();

      reader.onload =
        () => {
          try {
            const backup =
              JSON.parse(
                reader.result
              );

            resolve(
              backup
            );
          } catch {
            reject(
              new Error(
                "El archivo seleccionado no contiene JSON válido."
              )
            );
          }
        };

      reader.onerror =
        () => {
          reject(
            new Error(
              "No se pudo leer el archivo."
            )
          );
        };

      reader.readAsText(
        file
      );
    }
  );
}