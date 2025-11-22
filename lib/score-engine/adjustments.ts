// lib/score-engine/adjustments.ts
//
// Tek noktadan runway + profit margin etkilerini yöneten modüler helper.
// Amaç: Bütün valuation method dosyalarında tekrar eden mantığı kaldırmak,
// daha ayarlanabilir (configurable) bir yapı sunmak.
//
// Bu yapı tamamen UAT/mock amaçlıdır — finansal tavsiye değildir.

import { BaseInput } from "./types";

export interface AdjustmentWeights {
  runwayWeight?: number;   // runway etkisinin ağırlığı (default 1.0)
  profitWeight?: number;   // kâr marjı etkisinin ağırlığı (default 1.0)
}

/* -------------------------------------------------------
 *  TEMEL ÇARPANLAR
 *  (tek başına kullanılmaz — applyRunwayAndProfitAdjustments bunu sarar)
 * ------------------------------------------------------*/

/** Runway’e göre çarpan üretir (0–∞ ay) */
function baseRunwayFactor(runwayMonths: number): number {
  if (runwayMonths <= 0) return 0.80;       // runway yok → ciddi risk indirimi
  if (runwayMonths < 6) return 0.85;
  if (runwayMonths < 12) return 0.95;
  if (runwayMonths < 18) return 1.00;
  if (runwayMonths < 24) return 1.05;
  return 1.10;                              // uzun runway → hafif prim
}

/** Profit margin’e göre çarpan üretir (-∞ – +∞ % arası) */
function baseProfitFactor(profitMargin: number): number {
  const clamped = Math.max(-30, Math.min(40, profitMargin));
  // -30 → 0.90 , 40 → 1.13
  return 1 + clamped / 300;
}

/* -------------------------------------------------------
 *  ANA YARDIMCI FONKSİYON
 *  (Tüm valuation metotları BUNU kullanacak)
 * ------------------------------------------------------*/

export function applyRunwayAndProfitAdjustments(
  baseValue: number,
  input: BaseInput,
  weights: AdjustmentWeights = {},
): number {
  if (baseValue <= 0) return baseValue;

  const { runwayWeight = 1.0, profitWeight = 1.0 } = weights;

  let value = baseValue;

  // ----- Runway etkisi -----
  if (input.runwayMonths != null && !Number.isNaN(input.runwayMonths)) {
    const factor = baseRunwayFactor(input.runwayMonths);
    // ağırlıklı etki
    value *= Math.pow(factor, runwayWeight);
  }

  // ----- Profit margin etkisi -----
  if (input.profitMargin != null && !Number.isNaN(input.profitMargin)) {
    const factor = baseProfitFactor(input.profitMargin);
    value *= Math.pow(factor, profitWeight);
  }

  return value;
}
