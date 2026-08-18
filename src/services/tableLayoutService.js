const TABLE_LAYOUTS_KEY =
  "laToscanaTableLayouts";

export function getTableLayouts() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(
          TABLE_LAYOUTS_KEY
        )
      ) || {}
    );
  } catch (error) {
    console.error(
      "No se pudieron cargar las distribuciones:",
      error
    );

    return {};
  }
}

export function getTableLayoutByDate(
  date
) {
  const layouts =
    getTableLayouts();

  return (
    layouts[date] || null
  );
}

export function saveTableLayout(
  date,
  layout
) {
  const layouts =
    getTableLayouts();

  const updatedLayouts = {
    ...layouts,

    [date]: {
      ...layout,

      date,

      updatedAt:
        new Date()
          .toISOString(),
    },
  };

  localStorage.setItem(
    TABLE_LAYOUTS_KEY,
    JSON.stringify(
      updatedLayouts
    )
  );

  return updatedLayouts[date];
}

export function deleteTableLayout(
  date
) {
  const layouts =
    getTableLayouts();

  delete layouts[date];

  localStorage.setItem(
    TABLE_LAYOUTS_KEY,
    JSON.stringify(
      layouts
    )
  );

  return layouts;
}

export function createDefaultLayout({
  date,
  interiorCount,
  terraceCount,
}) {
  const interior = [];

  const terrace = [];

  for (
    let index = 0;
    index < interiorCount;
    index++
  ) {
    const number =
      11 + index;

    interior.push({
      id: number,

      name:
        `Mesa ${number}`,

      area:
        "Interior",

      capacity: 4,

      status:
        "Libre",

      bookingId:
        null,

      visitId:
        null,
    });
  }

  for (
    let index = 0;
    index < terraceCount;
    index++
  ) {
    const number =
      21 + index;

    terrace.push({
      id: number,

      name:
        `Mesa ${number}`,

      area:
        "Terraza",

      capacity: 4,

      status:
        "Libre",

      bookingId:
        null,

      visitId:
        null,
    });
  }

  return {
    date,

    interior,

    terrace,

    createdAt:
      new Date()
        .toISOString(),
  };
}

export function copyPreviousLayout(
  sourceDate,
  targetDate
) {
  const sourceLayout =
    getTableLayoutByDate(
      sourceDate
    );

  if (!sourceLayout) {
    return {
      success: false,

      message:
        "No existe una distribución para la fecha seleccionada.",
    };
  }

  const copiedLayout = {
    ...sourceLayout,

    date:
      targetDate,

    interior:
      sourceLayout.interior.map(
        (table) => ({
          ...table,

          status:
            "Libre",

          bookingId:
            null,

          visitId:
            null,
        })
      ),

    terrace:
      sourceLayout.terrace.map(
        (table) => ({
          ...table,

          status:
            "Libre",

          bookingId:
            null,

          visitId:
            null,
        })
      ),

    copiedFrom:
      sourceDate,

    createdAt:
      new Date()
        .toISOString(),
  };

  saveTableLayout(
    targetDate,
    copiedLayout
  );

  return {
    success: true,

    layout:
      copiedLayout,
  };
}