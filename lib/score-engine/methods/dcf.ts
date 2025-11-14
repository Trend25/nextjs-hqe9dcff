// lib/score-engine/methods/dcf.ts
import {
  BaseInput,
  MethodResult,
  DCFConfig,
} from "../types";
import { adjustForRunway } from "../runway";

export function dcfValuation(
  input: BaseInput,
  config: DCFConfig,
): MethodResult {
  // Başlangıç yıllık gelir ve varsayılan büyüme / kar marjı
  let revenue = (input.mrr ?? 0) * 12;
  const growthRate = (input.growthRate ?? 15) / 100;      // %15 default
  const profitMargin = (input.profitMargin ?? 20) / 100;  // %20 default

  const discountRate = config.discountRate;               // ör: 0.25
  const horizonYears = config.horizonYears;               // ör: 5
  const terminalGrowth = config.terminalGrowth;           // ör: 0.03

  // Eğer hiç gelir bilgisi yoksa, çok küçük bir baz değere fallback
  if (revenue <= 0) {
    revenue = 100_000;
  }

  let pvSum = 0;

  // Basit DCF: her yıl için gelir büyüyor, kar marjı uygulanıyor, indirgeniyor
  for (let t = 1; t <= horizonYears; t++) {
    revenue *= 1 + growthRate;
    const cashFlow = revenue * profitMargin;
    const discountFactor = Math.pow(1 + discountRate, t);
    pvSum += cashFlow / discountFactor;
  }

  // Terminal value (gordon growth)
  let terminalValue = 0;
  if (discountRate > terminalGrowth) {
    const lastYearCashFlow = revenue * profitMargin * (1 + terminalGrowth);
    terminalValue =
      lastYearCashFlow / (discountRate - terminalGrowth);
    const terminalDiscount = Math.pow(1 + discountRate, horizonYears);
    pvSum += terminalValue / terminalDiscount;
  }

  let value = pvSum;

  // 🔁 Runway etkisini DCF sonucuna da uygula
  value = adjustForRunway(value, input);

  return {
    method: "dcf",
    value: Math.round(value),
    notes:
      "DCF metodu — MRR, büyüme, kar marjı ve runway ile indirgenmiş nakit akışına göre tahmini değer.",
  };
}
