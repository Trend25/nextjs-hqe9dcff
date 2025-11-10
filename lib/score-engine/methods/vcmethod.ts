// lib/score-engine/methods/vcmethod.ts
import {
  BaseInput,
  MethodConfig,
  MethodResult,
  VCMethodConfig,
} from "../types";

export function vcMethodValuation(
  input: BaseInput,
  config: MethodConfig,
): MethodResult {
  const vc: VCMethodConfig = config.vcmethod;

  const mrr = input.mrr ?? 0;
  const annualRevenue = mrr * 12;
  const growth = (input.growthRate ?? 0) / 100;

  // exitYear kadar yıl sonrasına gelir projeksiyonu
  let projectedRevenue = annualRevenue;
  for (let i = 0; i < vc.exitYear; i++) {
    projectedRevenue = projectedRevenue * (1 + growth);
  }

  const exitValuation = projectedRevenue * vc.targetReturnMultiple;
  const value = Math.round(exitValuation);

  return {
    method: "vcmethod",
    value,
    notes:
      "VC yöntemi — exit yılına kadar büyüyen gelire hedef çarpan uygulanarak yaklaşık değerleme (UAT basit model).",
  };
}
