const ADMIN_SESSION_KEY =
  "laToscanaAdminSession";

const DEVELOPER_SESSION_KEY =
  "laToscanaDeveloperSession";


/*
=========================
ADMIN
=========================
*/

export function loginAdmin(
  username,
  password
) {
  const cleanUsername =
    String(username || "")
      .normalize("NFKC")
      .replace(/\s+/g, "")
      .toLowerCase();

  const cleanPassword =
    String(password || "")
      .normalize("NFKC")
      .replace(/\s+/g, "");


  if (
    cleanUsername === "admin" &&
    cleanPassword === "latoscana2026"
  ) {
    localStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({
        authenticated: true,
        role: "admin",
        loginAt:
          new Date()
            .toISOString(),
      })
    );


    return {
      success: true,
    };
  }


  return {
    success: false,
    message:
      "Usuario o contraseña incorrectos.",
  };
}


export function logoutAdmin() {
  localStorage.removeItem(
    ADMIN_SESSION_KEY
  );
}


export function isAdminAuthenticated() {
  try {
    const session =
      JSON.parse(
        localStorage.getItem(
          ADMIN_SESSION_KEY
        )
      );


    return (
      session?.authenticated === true &&
      session?.role === "admin"
    );
  } catch {
    return false;
  }
}


/*
=========================
DEVELOPER
=========================
*/

export function loginDeveloper(
  username,
  password
) {
  const cleanUsername =
    String(username || "")
      .normalize("NFKC")
      .replace(/\s+/g, "")
      .toLowerCase();

  const cleanPassword =
    String(password || "")
      .normalize("NFKC")
      .replace(/\s+/g, "");


  const validUsername =
    cleanUsername ===
    "developer";

  const validPassword =
    cleanPassword ===
    "dev2026";


  if (
    validUsername &&
    validPassword
  ) {
    localStorage.setItem(
      DEVELOPER_SESSION_KEY,
      JSON.stringify({
        authenticated: true,
        role: "developer",
        loginAt:
          new Date()
            .toISOString(),
      })
    );


    return {
      success: true,
    };
  }


  return {
    success: false,

    message:
      `Datos recibidos: usuario "${cleanUsername}" · contraseña de ${cleanPassword.length} caracteres.`,
  };
}


export function logoutDeveloper() {
  localStorage.removeItem(
    DEVELOPER_SESSION_KEY
  );
}


export function isDeveloperAuthenticated() {
  try {
    const session =
      JSON.parse(
        localStorage.getItem(
          DEVELOPER_SESSION_KEY
        )
      );


    return (
      session?.authenticated === true &&
      session?.role ===
        "developer"
    );
  } catch {
    return false;
  }
}