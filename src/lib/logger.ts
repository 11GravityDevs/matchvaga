export type ServerErrorContext = "ai" | "db" | "server_action" | "api";

export interface ServerErrorPayload {
  level: "error";
  timestamp: string;
  context: ServerErrorContext;
  operation: string;
  message: string;
  model?: string;
  action?: string;
  errorMessage?: string;
  errorName?: string;
}

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return undefined;
}

function getErrorName(error: unknown): string | undefined {
  if (error instanceof Error) return error.name;
  return undefined;
}

export function logServerError(
  payload: Omit<ServerErrorPayload, "level" | "timestamp">,
  error?: unknown
): void {
  const entry: ServerErrorPayload = {
    level: "error",
    timestamp: new Date().toISOString(),
    context: payload.context,
    operation: payload.operation,
    message: payload.message,
    ...(payload.model !== undefined && { model: payload.model }),
    ...(payload.action !== undefined && { action: payload.action }),
    ...(payload.errorMessage !== undefined && {
      errorMessage: payload.errorMessage,
    }),
    ...(payload.errorName !== undefined && { errorName: payload.errorName }),
  };
  if (error !== undefined) {
    if (entry.errorMessage === undefined)
      entry.errorMessage = getErrorMessage(error);
    if (entry.errorName === undefined) entry.errorName = getErrorName(error);
  }
  console.error(JSON.stringify(entry));
}
