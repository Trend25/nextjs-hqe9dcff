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
import { defaultMethodConfig } from "./config";

/**
 * UAT v0.6: Stage + method + temel finansal verilere göre
 * basit bir bileşik değerleme hesaplar.
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
  };
}

/**
 * Convenience helper:
 * Config göndermeden, default UAT config ile çağırmak için.
 */
export function evaluateStartupWithDefaults(
  input: BaseInput,
  methods: ValuationMethod[],
): EngineResult {
  return evaluateStartup(input, methods, defaultMethodConfig);
}
