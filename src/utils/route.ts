export function getStepIndexFromPathname(
  pathname: string,
  stepPaths: readonly string[]
): number {
  const index = stepPaths.findIndex((path) => pathname.startsWith(path));
  return index >= 0 ? index : 0;
}
