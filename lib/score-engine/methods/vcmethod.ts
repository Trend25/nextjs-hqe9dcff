// lib/score-engine/methods/vcmethod.ts
import {
  BaseInput,
  MethodResult,
  VCMethodConfig,
} from "../types";
import { applyRunwayAndProfitAdjustments } from "../adjustments";

/**
 * VC Method – çok basitleştirilmiş UAT versiyonu:
 *
 * 1. MRR → yıllık gelir (ARR) hesaplanır.
 * 2. GrowthRate varsa exitYear'e kadar bileşik büyüme uygulanır.
 * 3. Çıkan exit-year revenue, VC targetReturnMultiple ile çarpılır.
 * 4. Son olarak runway + kâr marjı etkisi merkezi helper ile uygulanır.
 */
export function vcMethodValuation(
  input: BaseInput,
  config: VCMethodConfig,
): MethodResult {
  const mrr = input.mrr ?? 0;
  const growth = input.growthRate ?? 0;

  // 1) MRR → ARR
  let projectedRevenue = mrr * 12;

  // 2) growthRate (%) → yıllık bileşik büyüme (exitYear'e kadar)
  if (projectedRevenue > 0 && growth !== null && growth !== undefined) {
    // aşırı uçları kıs: -50% ile +150% arası
    const clampedGrowth = Math.max(-50, Math.min(150, growth)) / 100;
    const years = Math.max(1, config.exitYear || 5);
    projectedRevenue *= Math.pow(1 + clampedGrowth, years);
  }

  // 3) exit-year revenue * targetReturnMultiple
  let value = projectedRevenue * (config.targetReturnMultiple || 10);

  // Eğer hiçbir veri yoksa baz bir minimum ver:
  if (!mrr && !growth) {
    // tamamen boş durumda kaba bir baseline
    value = 1_000_000;
  }

  // 4) Runway + profit etkisi
  // VC bakışında kâr marjı önemli, runway de anlamlı:
  value = applyRunwayAndProfitAdjustments(value, input, {
    runwayWeight: 1.0, // runway etkisi orta
    profitWeight: 1.5, // kârlılık etkisi daha yüksek
  });

  return {
    method: "vcmethod",
    value: Math.round(value),
    notes:
      "VC method — MRR, büyüme ve çıkış yılı varsayımı üzerinden, runway ve kârlılık ile ayarlanmış tahmini exit değeri.",
  };
}
