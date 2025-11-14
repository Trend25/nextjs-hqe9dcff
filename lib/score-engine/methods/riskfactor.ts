// lib/score-engine/methods/riskfactor.ts
import {
  BaseInput,
  MethodResult,
  RiskFactorConfig,
  Stage,
} from "../types";
import { adjustForRunway } from "../runway";

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

  // Baz risk multiplier'ı
  const riskMultiplier = 1 - riskScore * 0.05;
  let value = base * Math.max(riskMultiplier, 0.1);

  // Runway'i ayrıca risk katmanı gibi uygula:
  // Burada runway etkisini biraz daha güçlü hissettirmek için
  // helper çıktısını iki kez blend edebiliriz.
  const firstPass = adjustForRunway(value, input);
  const secondPass = adjustForRunway(firstPass, input);

  value = secondPass;

  return {
    method: "riskfactor",
    value: Math.round(value),
    notes:
      "Risk factor summation — stage risk + runway risk’e göre indirgenmiş değer.",
  };
}
