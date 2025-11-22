// lib/score-engine/methods/dcf.ts
import {
  BaseInput,
  MethodResult,
  DCFConfig,
} from "../types";
import { applyRunwayAndProfitAdjustments } from "../adjustments";

/**
 * DCF (Discounted Cash Flow) – UAT Mock
 *
 * 1. MRR → ARR → cash flow
 * 2. Growth + profit margin ile 5 yıl projeksiyon
 * 3. Her yıl discount uygulanır
 * 4. Terminal value (Gordon Growth)
 * 5. Son olarak runway + profit effect merkezi helper ile uygulanır
 */
export function dcfValuation(
  input: BaseInput,
  config: DCFConfig,
): MethodResult {
  // 1) MRR → ARR
  let revenue = (input.mrr ?? 0) * 12;

  // Eğer veri yoksa küçük bir baseline
  if (revenue <= 0) {
    revenue = 100_000;
  }

  // Varsayılanlar (UAT mock)
  const annualGrowth =
    ((input.growthRate ?? 15) / 100); // %15 default
  const profitMargin =
    ((input.profitMargin ?? 20) / 100); // %20 default

  const discountRate = config.discountRate;     // ör: 0.15–0.25
  const horizonYears = config.horizonYears;     // ör: 5
  const terminalGrowth = config.terminalGrowth; // ör: 0.03

  let pvSum = 0;

  // 2) Her yıl için büyüme + kar marjı + discount
  for (let t = 1; t <= horizonYears; t++) {
    revenue *= 1 + annualGrowth;
    const cashFlow = revenue * profitMargin;
    const discountFactor = Math.pow(1 + discountRate, t);
    pvSum += cashFlow / discountFactor;
  }

  // 3) Terminal Value (Gordon Growth Model)
  if (discountRate > terminalGrowth) {
    const lastCashFlow = revenue * profitMargin * (1 + terminalGrowth);
    const tv = lastCashFlow / (discountRate - terminalGrowth);
    const terminalDiscount = Math.pow(1 + discountRate, horizonYears);
    pvSum += tv / terminalDiscount;
  }

  let value = pvSum;

  // 4) Runway + Profit etkisi — DCF için ağırlıklar ayarlanabilir
  value = applyRunwayAndProfitAdjustments(value, input, {
    runwayWeight: 0.8, // runway hafif etkili
    profitWeight: 1.2, // karlılık orta seviye etkili
  });

  return {
    method: "dcf",
    value: Math.round(value),
    notes:
      "DCF metodu — MRR, büyüme, kar marjı ve terminal değeri temel alır; runway ve kârlılık ile ayarlanmıştır.",
  };
}
