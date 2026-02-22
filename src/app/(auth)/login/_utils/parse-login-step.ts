export type LoginStep = "email" | "magic-link";

export function parseLoginStepFromSearchParams(
  searchParams: URLSearchParams
): LoginStep {
  const step = searchParams.get("step");
  if (step === "email" || step === "magic-link") {
    return step;
  }

  return "email";
}
