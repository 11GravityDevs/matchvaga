import { AUTH_ERROR_MESSAGES_PT } from "@/constants/auth";
import type { AuthError } from "@supabase/supabase-js";

export function translateAuthError(error: AuthError): string {
  const code = "code" in error ? (error as { code?: string }).code : undefined;

  if (code && AUTH_ERROR_MESSAGES_PT[code]) {
    return AUTH_ERROR_MESSAGES_PT[code];
  }

  const message = error.message.toLowerCase();

  if (
    message.includes("rate limit") ||
    message.includes("60") ||
    message.includes("too many")
  ) {
    return AUTH_ERROR_MESSAGES_PT.over_email_send_rate_limit;
  }
  if (message.includes("expired")) {
    return AUTH_ERROR_MESSAGES_PT.otp_expired;
  }
  if (message.includes("invalid") || message.includes("credentials")) {
    return AUTH_ERROR_MESSAGES_PT.invalid_credentials;
  }
  if (message.includes("email") && message.includes("exist")) {
    return AUTH_ERROR_MESSAGES_PT.email_exists;
  }

  return AUTH_ERROR_MESSAGES_PT.unexpected_failure;
}
