// lib/score-engine/methods/dcf.ts
import {
  BaseInput,
  DCFConfig,
  MethodConfig,
  MethodResult,
} from "../types";

export function dcfValuation(
  input: BaseInput,
  config: MethodConfig,
): MethodResult {
  const dcf: DCFConfig = config.dcf;

  const mrr = input.mrr ?? 0;
  const growth = (input.growthRate ?? 0) / 100;
  const { discountRate, horizonYears, terminalGrowth } = dcf;

  let cashflow = mrr * 12;
  let npv = 0;

  for (let year = 1; year <= horizonYears; year++) {
    const discountFactor = Math.pow(1 + discountRate, year);
    npv += cashflow / discountFactor;
    cashflow = cashflow * (1 + growth);
  }

  const terminalCf = cashflow * (1 + terminalGrowth);
  const terminalValue = terminalCf / (discountRate - terminalGrowth);
  const terminalDiscountFactor = Math.pow(1 + discountRate, horizonYears);
  npv += terminalValue / terminalDiscountFactor;

  const value = Math.round(npv);

  return {
    method: "dcf",
    value,
    notes: "DCF — indirgenmiş nakit akışlarına göre yaklaşık bugünkü değer (UAT).",
  };
}
