// lib/score-engine/methods/scorecard.ts
import {
  BaseInput,
  MethodConfig,
  MethodResult,
  ScorecardConfig,
  Stage,
} from "../types";

const STAGE_MULTIPLIER: Record<Stage, number> = {
  idea: 0.5,
  mvp: 0.8,
  seed: 1.0,
  growth: 1.3,
};

export function scorecardValuation(
  input: BaseInput,
  config: MethodConfig,
): MethodResult {
  const sc: ScorecardConfig = config.scorecard;
  const stageFactor = STAGE_MULTIPLIER[input.stage];
  const growthFactor = 1 + (input.growthRate ?? 0) / 200;

  const value = Math.round(sc.basePreMoney * stageFactor * growthFactor);

  return {
    method: "scorecard",
    value,
    notes:
      "Scorecard metodu — aşama ve büyüme varsayımlarına göre oransal değerleme.",
  };
}
