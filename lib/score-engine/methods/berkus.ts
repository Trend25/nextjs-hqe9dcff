// lib/score-engine/methods/berkus.ts
import {
  BaseInput,
  BerkusConfig,
  MethodConfig,
  MethodResult,
  Stage,
} from "../types";

const STAGE_KEY_MAP: Record<Stage, keyof BerkusConfig> = {
  idea: "ideaMax",
  mvp: "mvpMax",
  seed: "seedMax",
  growth: "growthMax",
};

export function berkusValuation(
  input: BaseInput,
  config: MethodConfig,
): MethodResult {
  const berkus = config.berkus;
  const key = STAGE_KEY_MAP[input.stage];
  const max = berkus[key];

  const completeness =
    0.25 +
    (input.mrr ? 0.25 : 0) +
    (input.growthRate ? 0.25 : 0) +
    (input.teamSize ? 0.25 : 0);

  const value = Math.round(max * completeness);

  return {
    method: "berkus",
    value,
    notes: `Berkus metodu — ${input.stage} aşaması için tahmini değer.`,
  };
}
