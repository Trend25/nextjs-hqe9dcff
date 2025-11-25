// lib/score-engine/index.ts

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
import { getSectorBenchmark } from "./benchmarks";

/**
 * Çekirdek engine:
 * Verilen config + yöntem listesi ile değerleme yapar.
 * Benchmark uygulamaz.
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
    benchmark: null, // çekirdek engine'de benchmark uygulanmıyor
  };
}

/**
 * Default config + sektör benchmark'ı ile çalışan convenience wrapper.
 * - defaultConfig kullanır
 * - sektöre göre stage bazlı çarpan uygular
 */
export function evaluateStartupWithDefaults(
  input: BaseInput,
  methods: ValuationMethod[],
): EngineResult {
  const baseResult = evaluateStartup(input, methods, defaultConfig);

  const benchmark = getSectorBenchmark(input.stage, input.sector);
  if (!benchmark) {
    // Benchmark yoksa olduğu gibi döndür
    return baseResult;
  }

  const stageMultiplier =
    benchmark.stageMultipliers[input.stage] ?? 1.0;

  // Çarpan 1 ise sadece benchmark bilgisini ekleyip geri dön
  if (stageMultiplier === 1) {
    return {
      ...baseResult,
      benchmark,
    };
  }

  // Composite + method değerlerine çarpan uygula
  const adjustedComposite =
    baseResult.compositeValue != null
      ? baseResult.compositeValue * stageMultiplier
      : baseResult.compositeValue;

  const adjustedMethods = baseResult.methods.map((m) => ({
    ...m,
    value: Math.round(m.value * stageMultiplier),
  }));

  return {
    ...baseResult,
    compositeValue: adjustedComposite,
    methods: adjustedMethods,
    benchmark,
  };
}
