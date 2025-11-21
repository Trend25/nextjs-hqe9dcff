// lib/score-engine/methods/scorecard.ts
import {
  BaseInput,
  MethodResult,
  ScorecardConfig,
  Stage,
} from "../types";
import { adjustForRunway } from "../runway";

// Stage'e göre çarpan (benchmark'e göre)
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

  // Karlılık bilgisini hafifçe dikkate al (profitMargin opsiyonel)
  if (input.profitMargin != null && !Number.isNaN(input.profitMargin)) {
    const clamped = Math.max(-30, Math.min(30, input.profitMargin));
    const marginFactor = 1 + clamped / 300; // -0.1 ile +0.1 arası etki
    value *= marginFactor;
  }

  // 🔁 Runway etkisini uygula (nakit ömrü kısa ise indir, uzunsa hafif artır)
  value = adjustForRunway(value, input);

  return {
    method: "scorecard",
    value: Math.round(value),
    notes:
      "Scorecard metodu — benchmark pre-money, stage, büyüme, takım ve runway'e göre ayarlanmış skor.",
  };
}
