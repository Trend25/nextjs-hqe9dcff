// lib/score-engine/methods/scorecard.ts
import {
  BaseInput,
  MethodResult,
  ScorecardConfig,
  Stage,
} from "../types";
import { applyRunwayAndProfitAdjustments } from "../adjustments";

// Stage'e göre çarpan (benchmark + stage etki)
const STAGE_MULTIPLIER: Record<Stage, number> = {
  idea: 0.6,
  mvp: 0.8,
  seed: 1.0,
  growth: 1.2,
};

export function scorecardValuation(
  input: BaseInput,
  config: ScorecardConfig,
): MethodResult {
  const base = config.basePreMoney;

  // Stage'e göre baz multiplier
  const stageMult = STAGE_MULTIPLIER[input.stage] ?? 1.0;

  // Basit kalite skoru: MRR, growth, teamSize varlığına göre
  let qualityScore = 0.4; // minimum
  if (input.mrr && input.mrr > 0) qualityScore += 0.2;
  if (input.growthRate && input.growthRate > 0) qualityScore += 0.2;
  if (input.teamSize && input.teamSize > 0) qualityScore += 0.2;
  if (qualityScore > 1) qualityScore = 1;

  let value = base * stageMult * qualityScore;

  // Scorecard içindeki bu profit margin etkisini de kaldırıp
  // merkezi adjustments'a taşıyabiliriz.
  // Ama şimdilik UAT mantığı korunuyor.
  if (input.profitMargin != null && !Number.isNaN(input.profitMargin)) {
    const clamped = Math.max(-30, Math.min(30, input.profitMargin));
    const marginFactor = 1 + clamped / 300; // -0.1 ile +0.1 arası etki
    value *= marginFactor;
  }

  // 🚀 Merkezî runway + kâr marjı ayarlaması
  value = applyRunwayAndProfitAdjustments(value, input);

  return {
    method: "scorecard",
    value: Math.round(value),
    notes:
      "Scorecard metodu — pre-money, stage, kalite skoru ve runway/kârlılık etkisi içerir.",
  };
}
