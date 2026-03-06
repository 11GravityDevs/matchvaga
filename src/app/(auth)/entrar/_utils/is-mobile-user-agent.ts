export const isMobileUserAgent = (
  userAgent: string | null | undefined
): boolean => {
  if (!userAgent) {
    return false;
  }

  const normalizedUserAgent = userAgent.toLowerCase();

  const mobilePattern =
    /mobile|android|iphone|ipad|ipod|windows phone|blackberry|opera mini|iemobile/;

  return mobilePattern.test(normalizedUserAgent);
};
