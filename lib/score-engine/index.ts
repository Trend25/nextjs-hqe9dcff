// lib/score-engine/index.ts
import {
  AggregateResult,
  BaseInput,
  MethodConfig,
  MethodResult,
  ValuationMethod,
} from "./types";
import { berkusValuation } from "./methods/berkus";
import { scorecardValuation } from "./methods/scorecard";
import { riskFactorValuation } from "./methods/riskfactor";
import { vcMethodValuation } from "./methods/vcmethod";
import { dcfValuation } from "./methods/dcf";

/**
 * UAT v0.5: Stage + method + temel finansal verilere göre
 * basit bir bileşik değerleme hesaplar.
 */
export function evaluateStartup(
  input: BaseInput,
  methods: ValuationMethod[],
  config: MethodConfig,
): AggregateResult {
  const results: MethodResult[] = [];

  for (const m of methods) {
    if (m === "berkus") {
      results.push(berkusValuation(input, config));
    } else if (m === "scorecard") {
      results.push(scorecardValuation(input, config));
    } else if (m === "riskfactor") {
      results.push(riskFactorValuation(input, config));
    } else if (m === "vcmethod") {
      results.push(vcMethodValuation(input, config));
    } else if (m === "dcf") {
      results.push(dcfValuation(input, config));
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
