const POSTHOG_LOGIN_METHOD_KEY = "posthog_login_method";

export type PosthogLoginMethod = "email" | "google";

export const setPosthogLoginMethod = (method: PosthogLoginMethod): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(POSTHOG_LOGIN_METHOD_KEY, method);
};

export const getPosthogLoginMethod = (): PosthogLoginMethod | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.sessionStorage.getItem(POSTHOG_LOGIN_METHOD_KEY);

  if (stored === "email" || stored === "google") {
    return stored;
  }

  return null;
};

export const clearPosthogLoginMethod = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(POSTHOG_LOGIN_METHOD_KEY);
};
