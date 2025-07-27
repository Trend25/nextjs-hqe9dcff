// app/stage-detection/page.tsx içine SADECE BU KISMI EKLE/DEĞİŞTİR

// 1. Utility function ekle (dosyanın başına, import'lardan sonra)
function createSafeInput(input: StageDetectionInput) {
  return {
    companyName: input.companyName || '',
    industry: input.industry || '',
    foundedYear: input.foundedYear || new Date().getFullYear(),
    teamSize: input.teamSize || 0,
    monthlyRevenue: input.monthlyRevenue || 0,
    totalFunding: input.totalFunding || 0,
    burnRate: input.burnRate || 0,
    runway: input.runway || 0,
    customerCount: input.customerCount || 0,
    growthRate: input.growthRate || 0,
    activeCustomers: input.activeCustomers || 0,
    monthlyGrowthRate: input.monthlyGrowthRate || 0,
    lifetimeValue: input.lifetimeValue || 0,
    customerAcquisitionCost: input.customerAcquisitionCost || 0,
    marketSize: input.marketSize || 0,
    hasLiveProduct: input.hasLiveProduct || false,
    hasPaidCustomers: input.hasPaidCustomers || false,
    hasRecurringRevenue: input.hasRecurringRevenue || false,
    hasScalableBusinessModel: input.hasScalableBusinessModel || false,
    isOperationallyProfitable: input.isOperationallyProfitable || false,
    ...input
  };
}

// 2. Mevcut calculation fonksiyonlarını DEĞIŞTIR (safe input kullanacak şekilde)

function calculatePreSeedScore(input: StageDetectionInput): number {
  const safe = createSafeInput(input);
  let score = 0;
  score += Math.min(safe.teamSize / 5, 1) * 35;
  score += safe.hasLiveProduct ? 25 : 15;
  score += safe.activeCustomers > 10 ? 20 : 10;
  score += safe.totalFunding > 0 ? 10 : 5;
  score += safe.marketSize > 100000 ? 10 : 5;
  return Math.min(score, 100);
}

function calculateSeedScore(input: StageDetectionInput): number {
  const safe = createSafeInput(input);
  let score = 0;
  score += safe.hasPaidCustomers ? 30 : 15;
  score += safe.monthlyRevenue > 1000 ? 25 : 10;
  score += safe.hasRecurringRevenue ? 20 : 10;
  score += Math.min(safe.monthlyGrowthRate / 20, 1) * 15;
  score += safe.activeCustomers > 100 ? 10 : 5;
  return Math.min(score, 100);
}

function calculateSeriesAScore(input: StageDetectionInput): number {
  const safe = createSafeInput(input);
  let score = 0;
  score += safe.monthlyRevenue >= 50000 ? 35 : safe.monthlyRevenue >= 20000 ? 20 : 0;
  score += safe.hasScalableBusinessModel ? 25 : 10;
  score += safe.marketSize >= 1000000 ? 20 : 10;
  score += safe.monthlyGrowthRate >= 15 ? 10 : 5;
  score += safe.totalFunding >= 500000 ? 10 : 5;
  return Math.min(score, 100);
}

function calculateGrowthScore(input: StageDetectionInput): number {
  const safe = createSafeInput(input);
  let score = 0;
  score += safe.isOperationallyProfitable ? 40 : 10;
  score += safe.activeCustomers > 1000 ? 25 : 15;
  score += safe.monthlyRevenue >= 200000 ? 20 : 5;
  score += (safe.lifetimeValue > 0 && safe.customerAcquisitionCost > 0 && 
           safe.lifetimeValue / safe.customerAcquisitionCost > 3) ? 15 : 5;
  return Math.min(score, 100);
}

// 3. analyzeStage fonksiyonunda createSafeInput kullan
// Mevcut analyzeStage fonksiyonunda şu satırı değiştir:
// ❌ ESKI: const input: StageDetectionInput = { ...formData };
// ✅ YENİ: const input = createSafeInput(formData as StageDetectionInput);
