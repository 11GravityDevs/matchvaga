const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return value.trim().length > 0 && EMAIL_REGEX.test(value.trim());
}
