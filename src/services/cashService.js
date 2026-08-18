const CASH_STORAGE_KEY = "laToscanaCash";

export function getCashMovements() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(CASH_STORAGE_KEY)
      ) || []
    );
  } catch (error) {
    console.error(
      "No se pudieron cargar los movimientos de caja:",
      error
    );

    return [];
  }
}

export function saveCashMovements(movements) {
  localStorage.setItem(
    CASH_STORAGE_KEY,
    JSON.stringify(movements)
  );
}

export function createPayment({
  bookingId = null,
  visitId = null,
  customerId = null,
  customerName = "",
  amount,
  paymentMethod,
  concept,
}) {
  const movements = getCashMovements();

  const existingPayment = movements.find(
    (movement) =>
      movement.type === "Ingreso" &&
      (
        (bookingId &&
          movement.bookingId === bookingId) ||
        (visitId &&
          movement.visitId === visitId)
      )
  );

  if (existingPayment) {
    return {
      success: false,
      message:
        "Esta cuenta ya tiene un pago registrado.",
    };
  }

  const newMovement = {
    id: crypto.randomUUID(),

    type: "Ingreso",

    bookingId,
    visitId,

    customerId,
    customerName,

    amount: Number(amount),

    paymentMethod,

    concept:
      concept ||
      "Cuenta restaurante",

    createdAt:
      new Date().toISOString(),
  };

  saveCashMovements([
    ...movements,
    newMovement,
  ]);

  return {
    success: true,
    movement: newMovement,
  };
}

export function createExpense({
  concept,
  amount,
  paymentMethod,
}) {
  const movements = getCashMovements();

  const newMovement = {
    id: crypto.randomUUID(),

    type: "Gasto",

    bookingId: null,
    visitId: null,
    customerId: null,

    customerName: "",

    amount: Number(amount),

    paymentMethod,

    concept,

    createdAt:
      new Date().toISOString(),
  };

  saveCashMovements([
    ...movements,
    newMovement,
  ]);

  return newMovement;
}

export function deleteCashMovement(id) {
  const movements = getCashMovements();

  const updatedMovements =
    movements.filter(
      (movement) =>
        movement.id !== id
    );

  saveCashMovements(updatedMovements);

  return updatedMovements;
}

export function getCustomerSpending(
  customerId
) {
  const movements =
    getCashMovements();

  return movements
    .filter(
      (movement) =>
        movement.type === "Ingreso" &&
        movement.customerId ===
          customerId
    )
    .reduce(
      (total, movement) =>
        total +
        Number(
          movement.amount || 0
        ),
      0
    );
}