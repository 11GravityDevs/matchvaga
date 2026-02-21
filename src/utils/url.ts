export type LoginStep = "email" | "token";

export function parseLoginStepFromSearchParams(
  searchParams: URLSearchParams
): LoginStep {
  const step = searchParams.get("step");
  if (step === "email" || step === "token") {
    return step;
  }

  return "email";
}
