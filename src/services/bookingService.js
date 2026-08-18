import {
  findCustomerByContact,
  createCustomer,
} from "./customerStorageService";

const STORAGE_KEY = "laToscanaBookings";

export function getBookings() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      ) || []
    );
  } catch (error) {
    console.error(
      "No se pudieron cargar las reservas:",
      error
    );

    return [];
  }
}

export function saveBookings(bookings) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(bookings)
  );
}

export function saveBooking(booking) {
  const bookings = getBookings();

  let customer = findCustomerByContact(
    booking.email,
    booking.phone
  );

  if (!customer) {
    customer = createCustomer({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
    });
  }

  const newBooking = {
    ...booking,

    id: crypto.randomUUID(),

    customerId: customer.id,

    status: "Pendiente",
    paymentStatus: "Pendiente",

    createdAt: new Date().toISOString(),
  };

  const updatedBookings = [
    ...bookings,
    newBooking,
  ];

  saveBookings(updatedBookings);

  return newBooking;
}

export function updateBooking(
  updatedBooking
) {
  const bookings = getBookings();

  const updatedBookings =
    bookings.map((booking) =>
      booking.id === updatedBooking.id
        ? updatedBooking
        : booking
    );

  saveBookings(updatedBookings);

  return updatedBookings;
}

export function deleteBooking(id) {
  const bookings = getBookings();

  const updatedBookings =
    bookings.filter(
      (booking) => booking.id !== id
    );

  saveBookings(updatedBookings);

  return updatedBookings;
}