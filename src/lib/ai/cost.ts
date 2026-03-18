const USD_PER_1M = {
  "gemini-2.5-flash-lite": { input: 0.1, output: 0.4 },
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
} as const;

const USD_TO_BRL = 5.19;

export type AiCostModel = keyof typeof USD_PER_1M;

function costUsd(
  model: AiCostModel,
  inputTokens: number,
  outputTokens: number
): number {
  const prices = USD_PER_1M[model];
  const inputCost = (inputTokens / 1_000_000) * prices.input;
  const outputCost = (outputTokens / 1_000_000) * prices.output;
  return inputCost + outputCost;
}

export function logAiCost(
  model: AiCostModel,
  inputTokens: number,
  outputTokens: number,
  operation?: string
): void {
  const usd = costUsd(model, inputTokens, outputTokens);
  const brl = usd * USD_TO_BRL;
  const label = operation ? ` [${operation}]` : "";
  console.log(
    `[AI cost]${label} ${model} | input: ${inputTokens} | output: ${outputTokens} | USD: $${usd.toFixed(6)} | BRL: R$ ${brl.toFixed(4)}`
  );
}
