export type EmailLoginErrorType =
  | "invalid_email"
  | "otp_expired"
  | "network_error"
  | "unknown";

export const mapEmailLoginErrorType = (error: unknown): EmailLoginErrorType => {
  if (!(error instanceof Error)) {
    return "unknown";
  }

  const normalizedMessage = error.message.toLowerCase();

  const isInvalidEmailError =
    normalizedMessage.includes("email") || normalizedMessage.includes("válido");

  if (isInvalidEmailError) {
    return "invalid_email";
  }

  const isOtpExpiredError =
    normalizedMessage.includes("otp") ||
    normalizedMessage.includes("expirado") ||
    normalizedMessage.includes("código");

  if (isOtpExpiredError) {
    return "otp_expired";
  }

  const isNetworkError =
    normalizedMessage.includes("network") || normalizedMessage.includes("rede");

  if (isNetworkError) {
    return "network_error";
  }

  return "unknown";
};
