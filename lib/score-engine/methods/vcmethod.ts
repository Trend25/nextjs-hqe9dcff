// lib/score-engine/methods/vcmethod.ts
import {
  BaseInput,
  MethodResult,
  VCMethodConfig,
  Stage,
} from "../types";
import { adjustForRunway } from "../runway";

// Stage'e göre risk/iskonto katsayısı
const STAGE_DISCOUNT: Record<Stage, number> = {
  idea: 0.5,   // çok riskli
  mvp: 0.6,
  seed: 0.75,
  growth: 0.9, // daha olgun
};

export function vcMethodValuation(
  input: BaseInput,
  config: VCMethodConfig,
): MethodResult {
  // Yıllık gelir (MRR varsa)
  const annualRevenue = (input.mrr ?? 0) * 12;

  // Eğer MRR yoksa bile, çok düşük bir baz değer kullan
  const baseRevenue = annualRevenue > 0 ? annualRevenue : 100_000;

  // Hedef exit değeri: yıllık gelir * targetReturnMultiple
  let value = baseRevenue * config.targetReturnMultiple;

  // Stage riskine göre iskonto
  const stageDiscount = STAGE_DISCOUNT[input.stage] ?? 0.7;
  value *= stageDiscount;

  // Karlılığa göre küçük bir ayarlama
  if (input.profitMargin != null && !Number.isNaN(input.profitMargin)) {
    // -50% ile +50% aralığına sıkıştır
    const clamped = Math.max(-50, Math.min(50, input.profitMargin));
    // -0.25 ile +0.25 arası etki (yumuşak)
    const marginFactor = 1 + clamped / 200;
    value *= marginFactor;
  }

  // 🔁 Runway etkisini uygula (nakit ömrü kısa ise aşağı çeker, uzunsa hafif yukarı çeker)
  value = adjustForRunway(value, input);

  return {
    method: "vcmethod",
    value: Math.round(value),
    notes:
      "VC metodu — MRR, hedef getiri katsayısı ve stage + runway riskine göre tahmini exit değeri.",
  };
}
