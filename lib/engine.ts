// Valuation engine helpers (frontend-only mock implementations)
// All values are numbers in USD

// TODO: bu sonuçları analytics_evaluations tablosuna Anon olarak yaz (org_id + stage + sector + composite)
// TODO: consent_flag === false ise yazma

export function normalizeNumber(x: string | number): number {
  if (x === null || x === undefined || x === '') return 0;
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return n;
}

export function calcBerkus({
  teamQuality,
  productProgress,
  marketSize,
  mvpReady,
}: {
  teamQuality: number;
  productProgress: number;
  marketSize: number;
  mvpReady: number;
}) {
  const total = Number(teamQuality || 0) + Number(productProgress || 0) + Number(marketSize || 0) + Number(mvpReady || 0);
  return { method: 'berkus', value: total };
}

export function calcScorecard({
  baseValuation,
  teamScore,
  marketScore,
  productScore,
  competitionScore,
}: {
  baseValuation: number;
  teamScore: number;
  marketScore: number;
  productScore: number;
  competitionScore: number;
}) {
  const weighted = Number(baseValuation || 0) * (Number(teamScore || 0) + Number(marketScore || 0) + Number(productScore || 0) + Number(competitionScore || 0));
  return { method: 'scorecard', value: weighted };
}

export function calcRiskFactor({ baseValuation, riskAdjustments }: { baseValuation: number; riskAdjustments: number[] }) {
  const sumAdj = (riskAdjustments || []).reduce((s, v) => s + Number(v || 0), 0);
  const finalVal = Number(baseValuation || 0) + sumAdj;
  return { method: 'riskfactor', value: finalVal };
}

export function calcVCMethod({ revenueYear5, expectedMultiple, dilutionPercent }: { revenueYear5: number; expectedMultiple: number; dilutionPercent: number }) {
  const futureVal = Number(revenueYear5 || 0) * Number(expectedMultiple || 0);
  const postMoney = futureVal * (1 - Number(dilutionPercent || 0) / 100);
  return { method: 'vcmethod', value: postMoney };
}

export function calcDCF({ cashflows, discountRate }: { cashflows: number[]; discountRate: number }) {
  const r = Number(discountRate || 0);
  const pv = (cashflows || []).reduce((sum, cf, i) => sum + Number(cf || 0) / Math.pow(1 + r, i + 1), 0);
  return { method: 'dcf', value: pv };
}

export function aggregateValuation(resultsArray: { method: string; value: number }[]) {
  const valid = (resultsArray || []).filter((r) => Number(r.value) > 0).map((r) => Number(r.value));
  if (!valid || valid.length === 0) {
    return { min: 0, target: 0, max: 0 };
  }
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const sum = valid.reduce((s, v) => s + v, 0);
  const target = sum / valid.length;
  return { min, target, max };
}

export default {
  normalizeNumber,
  calcBerkus,
  calcScorecard,
  calcRiskFactor,
  calcVCMethod,
  calcDCF,
  aggregateValuation,
};
