const SETTINGS_STORAGE_KEY = "laToscanaSettings";

const defaultSettings = {
  restaurantName: "La Toscana",
  phone: "+34 910 000 000",
  email: "hola@latoscana.es",
  address: "Calle Toscana, 18 · Madrid",

  lunchStart: "13:00",
  lunchEnd: "15:00",

  dinnerStart: "20:00",
  dinnerEnd: "22:30",

  maxGuestsPerBooking: 8,
  bookingDuration: 120,

  mondayOpen: true,
  tuesdayOpen: true,
  wednesdayOpen: true,
  thursdayOpen: true,
  fridayOpen: true,
  saturdayOpen: true,
  sundayOpen: true,
};

export function getSettings() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(SETTINGS_STORAGE_KEY)
    );

    if (stored) {
      return {
        ...defaultSettings,
        ...stored,
      };
    }

    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(defaultSettings)
    );

    return defaultSettings;
  } catch (error) {
    console.error(
      "No se pudo cargar la configuración:",
      error
    );

    return defaultSettings;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(settings)
  );

  return settings;
}

export function resetSettings() {
  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(defaultSettings)
  );

  return defaultSettings;
}