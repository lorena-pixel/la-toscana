const LOG_STORAGE_KEY =
  "laToscanaDeveloperLogs";

const MAX_LOGS = 300;


export function getLogs() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(
          LOG_STORAGE_KEY
        )
      ) || []
    );
  } catch (error) {
    console.error(
      "No se pudieron cargar los logs:",
      error
    );

    return [];
  }
}


export function saveLogs(
  logs
) {
  localStorage.setItem(
    LOG_STORAGE_KEY,
    JSON.stringify(
      logs.slice(
        0,
        MAX_LOGS
      )
    )
  );
}


export function createLog({
  type = "INFO",
  title = "",
  description = "",
  level = "info",
  metadata = null,
}) {
  const logs =
    getLogs();


  const newLog = {
    id:
      crypto.randomUUID(),

    type,
    title,
    description,

    level,

    metadata,

    createdAt:
      new Date()
        .toISOString(),
  };


  saveLogs([
    newLog,
    ...logs,
  ]);


  return newLog;
}


export function deleteLog(
  logId
) {
  const logs =
    getLogs();


  const updated =
    logs.filter(
      (log) =>
        log.id !== logId
    );


  saveLogs(
    updated
  );


  return updated;
}


export function clearLogs() {
  localStorage.removeItem(
    LOG_STORAGE_KEY
  );

  return [];
}


export function getLogStats() {
  const logs =
    getLogs();


  return {
    total:
      logs.length,

    info:
      logs.filter(
        (log) =>
          log.level === "info"
      ).length,

    warning:
      logs.filter(
        (log) =>
          log.level === "warning"
      ).length,

    error:
      logs.filter(
        (log) =>
          log.level === "error"
      ).length,
  };
}