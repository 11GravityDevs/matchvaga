const envSupportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();

export const SUPPORT_EMAIL =
  envSupportEmail && envSupportEmail.length > 0
    ? envSupportEmail
    : "11gravitydevs@gmail.com";
