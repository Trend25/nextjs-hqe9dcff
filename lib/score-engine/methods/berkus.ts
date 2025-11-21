// lib/score-engine/methods/berkus.ts
import {
  BaseInput,
  BerkusConfig,
  MethodResult,
  Stage,
} from "../types";
import { adjustForRunway } from "../runway";

const STAGE_KEY_MAP: Record<Stage, keyof BerkusConfig> = {
  idea: "ideaMax",
  mvp: "mvpMax",
  seed: "seedMax",
  growth: "growthMax",
};

export function berkusValuation(
  input: BaseInput,
  berkus: BerkusConfig,
): MethodResult {
  const key = STAGE_KEY_MAP[input.stage];
  const max = berkus[key];

  // çok basit bir "completeness" skoru (v0.6 UAT)
  const completeness =
    0.25 +
    (input.mrr ? 0.25 : 0) +
    (input.growthRate ? 0.25 : 0) +
    (input.teamSize ? 0.25 : 0);

  let value = max * completeness;

  // 🚀 runway etkisini uygula
  value = adjustForRunway(value, input);

  return {
    method: "berkus",
    value: Math.round(value),
    notes: `Berkus metodu — ${input.stage} aşaması için tahmini değer (runway etkisi dahil).`,
  };
}
