export type GoogleLoginErrorType =
  | "oauth_popup_blocked"
  | "network_error"
  | "oauth_error";

export const mapGoogleLoginErrorType = (
  rawMessage: string
): GoogleLoginErrorType => {
  const normalizedMessage = rawMessage.toLowerCase();

  const isPopupBlocked = normalizedMessage.includes("popup");
  if (isPopupBlocked) {
    return "oauth_popup_blocked";
  }

  const isNetworkError = normalizedMessage.includes("network");
  if (isNetworkError) {
    return "network_error";
  }

  return "oauth_error";
};
