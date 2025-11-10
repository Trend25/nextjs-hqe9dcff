// lib/score-engine/methods/riskfactor.ts
import {
  BaseInput,
  MethodConfig,
  MethodResult,
  RiskFactorConfig,
  Stage,
} from "../types";

const STAGE_RISK_SCORE: Record<Stage, number> = {
  idea: 8,
  mvp: 6,
  seed: 4,
  growth: 2,
};

export function riskFactorValuation(
  input: BaseInput,
  config: MethodConfig,
): MethodResult {
  const rf: RiskFactorConfig = config.riskfactor;
  const base = rf.basePreMoney;
  const riskScore = STAGE_RISK_SCORE[input.stage];

  const riskMultiplier = 1 - riskScore * 0.05;
  const value = Math.round(base * Math.max(riskMultiplier, 0.1));

  return {
    method: "riskfactor",
    value,
    notes:
      "Risk factor summation — toplam risk puanına göre indirgenmiş değer.",
  };
}
