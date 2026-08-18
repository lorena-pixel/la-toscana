const CUSTOMER_STORAGE_KEY =
  "laToscanaCustomers";


export function getStoredCustomers() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(
          CUSTOMER_STORAGE_KEY
        )
      ) || []
    );
  } catch (error) {
    console.error(
      "No se pudieron cargar los clientes:",
      error
    );

    return [];
  }
}


export function saveCustomers(customers) {
  localStorage.setItem(
    CUSTOMER_STORAGE_KEY,
    JSON.stringify(customers)
  );
}


export function normalizeEmail(
  email = ""
) {
  return email
    .trim()
    .toLowerCase();
}


export function normalizePhone(
  phone = ""
) {
  return phone
    .replace(/\s+/g, "")
    .trim();
}


export function findCustomerByContact(
  email,
  phone
) {
  const customers =
    getStoredCustomers();

  const normalizedEmail =
    normalizeEmail(email);

  const normalizedPhone =
    normalizePhone(phone);


  return customers.find(
    (customer) => {
      const customerEmail =
        normalizeEmail(
          customer.email
        );

      const customerPhone =
        normalizePhone(
          customer.phone
        );


      return (
        (
          normalizedEmail &&
          customerEmail ===
            normalizedEmail
        ) ||
        (
          normalizedPhone &&
          customerPhone ===
            normalizedPhone
        )
      );
    }
  );
}


export function createCustomer({
  name,
  email,
  phone,
}) {
  const customers =
    getStoredCustomers();


  const newCustomer = {
    id: crypto.randomUUID(),

    name,
    email,
    phone,

    incidents: [],

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),
  };


  saveCustomers([
    ...customers,
    newCustomer,
  ]);


  return newCustomer;
}


/*
=========================
INCIDENCIAS / NOTAS
=========================
*/


export function addCustomerIncident(
  customerId,
  {
    type,
    note,
  }
) {
  const customers =
    getStoredCustomers();


  const newIncident = {
    id: crypto.randomUUID(),

    type,

    note:
      String(note || "")
        .trim(),

    createdAt:
      new Date()
        .toISOString(),
  };


  const updatedCustomers =
    customers.map(
      (customer) => {
        if (
          customer.id !==
          customerId
        ) {
          return customer;
        }


        return {
          ...customer,

          incidents: [
            ...(
              customer.incidents ||
              []
            ),

            newIncident,
          ],

          updatedAt:
            new Date()
              .toISOString(),
        };
      }
    );


  saveCustomers(
    updatedCustomers
  );


  return newIncident;
}


export function deleteCustomerIncident(
  customerId,
  incidentId
) {
  const customers =
    getStoredCustomers();


  const updatedCustomers =
    customers.map(
      (customer) => {
        if (
          customer.id !==
          customerId
        ) {
          return customer;
        }


        return {
          ...customer,

          incidents: (
            customer.incidents ||
            []
          ).filter(
            (incident) =>
              incident.id !==
              incidentId
          ),

          updatedAt:
            new Date()
              .toISOString(),
        };
      }
    );


  saveCustomers(
    updatedCustomers
  );


  return updatedCustomers;
}


export function getCustomerIncidents(
  customerId
) {
  const customer =
    getStoredCustomers()
      .find(
        (item) =>
          item.id ===
          customerId
      );


  return (
    customer?.incidents ||
    []
  );
}