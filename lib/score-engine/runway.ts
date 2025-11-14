// lib/score-engine/runway.ts
import { BaseInput, Stage } from "./types";

/**
 * Runway'a göre temel multiplier tablosu
 * 0–3 ay   → 0.65
 * 3–6 ay   → 0.80
 * 6–9 ay   → 0.92
 * 9–12 ay  → 1.00
 * 12+ ay   → 1.05
 */
function baseRunwayMultiplier(runway: number): number {
  if (runway <= 3) return 0.65;
  if (runway <= 6) return 0.8;
  if (runway <= 9) return 0.92;
  if (runway <= 12) return 1.0;
  return 1.05;
}

/**
 * Stage'e göre runway etkisinin ağırlığı
 * idea  → 0.3
 * mvp   → 0.5
 * seed  → 0.8
 * growth→ 1.0
 */
const STAGE_WEIGHT: Record<Stage, number> = {
  idea: 0.3,
  mvp: 0.5,
  seed: 0.8,
  growth: 1.0,
};

/**
 * Verilen değeri (value) runway + stage'e göre ayarlar.
 * runway yoksa / bilinmiyorsa değeri değiştirmez.
 */
export function adjustForRunway(value: number, input: BaseInput): number {
  const runway = input.runwayMonths;

  if (runway == null || Number.isNaN(runway)) {
    // Runway bilgisi yoksa, hiçbir değişiklik yapma
    return value;
  }

  const baseMult = baseRunwayMultiplier(runway);
  const rawAdjusted = value * baseMult;

  const stageWeight = STAGE_WEIGHT[input.stage] ?? 1.0;

  // weighted blend: value + (adjusted - value) * weight
  return value + (rawAdjusted - value) * stageWeight;
}
