// lib/score-engine/methods/riskfactor.ts
import {
  BaseInput,
  MethodResult,
  RiskFactorConfig,
  Stage,
} from "../types";
import { applyRunwayAndProfitAdjustments } from "../adjustments";

const STAGE_RISK_SCORE: Record<Stage, number> = {
  idea: 8,
  mvp: 6,
  seed: 4,
  growth: 2,
};

export function riskFactorValuation(
  input: BaseInput,
  config: RiskFactorConfig,
): MethodResult {
  const base = config.basePreMoney;
  const riskScore = STAGE_RISK_SCORE[input.stage];

  // Baz risk multiplier'ı (risk arttıkça değer düşüyor)
  const riskMultiplier = 1 - riskScore * 0.05;
  let value = base * Math.max(riskMultiplier, 0.1);

  // 🚀 Runway & kâr marjı etkisini merkezi helper üzerinden uygula.
  // RiskFactor için runway etkisini biraz daha güçlü,
  // kâr marjını ise daha düşük ağırlıkta veriyoruz.
  value = applyRunwayAndProfitAdjustments(value, input, {
    runwayWeight: 1.5,
    profitWeight: 0.5,
  });

  return {
    method: "riskfactor",
    value: Math.round(value),
    notes:
      "Risk factor summation — stage risk + runway/kârlılık riskine göre ayarlanmış değer.",
  };
}
