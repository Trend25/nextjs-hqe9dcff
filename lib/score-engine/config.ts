import type { MethodConfig } from "./types";

/**
 * Default valuation parameters for UAT (v0.6 baseline).
 * These can later be fetched dynamically from Supabase.
 */
export const defaultMethodConfig: MethodConfig = {
  berkus: {
    ideaMax: 1_000_000,
    mvpMax: 2_000_000,
    seedMax: 4_000_000,
    growthMax: 8_000_000,
  },
  scorecard: {
    basePreMoney: 3_000_000,
  },
  riskfactor: {
    basePreMoney: 3_000_000,
    perRiskStep: 250_000,
  },
  vcmethod: {
    targetReturnMultiple: 10,
    exitYear: 5,
  },
  dcf: {
    discountRate: 0.25,
    horizonYears: 5,
    terminalGrowth: 0.03,
  },
};
