// lib/score-engine/index.ts
//
// Score engine çekirdeği + default config + YC benchmark entegrasyonu

import {
  BaseInput,
  MethodConfig,
  MethodResult,
  ValuationMethod,
  EngineResult,
} from "./types";

import { berkusValuation } from "./methods/berkus";
import { scorecardValuation } from "./methods/scorecard";
import { riskFactorValuation } from "./methods/riskfactor";
import { vcMethodValuation } from "./methods/vcmethod";
import { dcfValuation } from "./methods/dcf";

import { defaultConfig } from "./config";

// NEW YC benchmark system
import { computeBenchmarkMultiplier } from "./benchmark-generator";

// Legacy baseline benchmark (fallback)
import { getSectorBenchmark } from "./benchmarks";

/**
 * Çekirdek engine — benchmark uygulanmadan çalışan versiyon.
 */
export function evaluateStartup(
  input: BaseInput,
  methods: ValuationMethod[],
  config: MethodConfig,
): EngineResult {
  const results: MethodResult[] = [];

  for (const m of methods) {
    if (m === "berkus") {
      results.push(berkusValuation(input, config.berkus));
    } else if (m === "scorecard") {
      results.push(scorecardValuation(input, config.scorecard));
    } else if (m === "riskfactor") {
      results.push(riskFactorValuation(input, config.riskfactor));
    } else if (m === "vcmethod") {
      results.push(vcMethodValuation(input, config.vcmethod));
    } else if (m === "dcf") {
      results.push(dcfValuation(input, config.dcf));
    }
  }

  const composite =
    results.length === 0
      ? null
      : results.reduce((sum, r) => sum + r.value, 0) / results.length;

  return {
    input,
    methods: results,
    compositeValue: composite,
    currency: "TRY",
    benchmark: null,
  };
}

/**
 * Default config + YC benchmark + fallback baseline benchmark.
 * 
 * Öncelik sırası:
 * 1. YC sektörü bulunursa → YC multiplier uygulanır.
 * 2. YC yok ama basit sektör benchmark’ı varsa → eski çarpan uygulanır.
 * 3. Hiçbiri yok → benchmark uygulanmaz.
 */
export function evaluateStartupWithDefaults(
  input: BaseInput,
  methods: ValuationMethod[],
): EngineResult {
  const base = evaluateStartup(input, methods, defaultConfig);

  // 1) YC benchmark multiplier hesapla
  const yc = computeBenchmarkMultiplier(input.stage, input.sector);

  if (yc.sectorKey !== null) {
    // YC sektörü bulundu → YC multiplier uygulanır
    const mult = yc.multiplier;

    const adjustedComposite =
      base.compositeValue != null
        ? base.compositeValue * mult
        : base.compositeValue;

    const adjustedMethods = base.methods.map((m) => ({
      ...m,
      value: Math.round(m.value * mult),
    }));

    return {
      ...base,
      compositeValue: adjustedComposite,
      methods: adjustedMethods,
      benchmark: {
        sectorKey: yc.sectorKey,
        label: yc.sectorLabel || "",
        multiplier: yc.multiplier,
        stage: input.stage,
      },
    };
  }

  // 2) YC benchmark yoksa → Legacy baseline benchmark’a fallback
  const legacy = getSectorBenchmark(input.stage, input.sector);
  if (!legacy) return base;

  const stageMultiplier = legacy.stageMultipliers[input.stage] ?? 1.0;

  if (stageMultiplier === 1) {
    return {
      ...base,
      benchmark: legacy,
    };
  }

  const adjustedComposite =
    base.compositeValue != null
      ? base.compositeValue * stageMultiplier
      : base.compositeValue;

  const adjustedMethods = base.methods.map((m) => ({
    ...m,
    value: Math.round(m.value * stageMultiplier),
  }));

  return {
    ...base,
    compositeValue: adjustedComposite,
    methods: adjustedMethods,
    benchmark: legacy,
  };
}
