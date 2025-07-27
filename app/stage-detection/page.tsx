// app/stage-detection/page.tsx - TÜM UNDEFINED HATALARINI ÇÖZEN UTILITY

// Utility function: Safe input with all defaults
function createSafeInput(input: StageDetectionInput) {
  return {
    // String fields
    companyName: input.companyName || '',
    industry: input.industry || '',
    
    // Number fields with 0 default
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
    revenue: input.revenue || 0,
    annualRevenue: input.annualRevenue || 0,
    monthlyUsers: input.monthlyUsers || 0,
    fundingGoal: input.fundingGoal || 0,
    
    // Boolean fields with false default
    hasLiveProduct: input.hasLiveProduct || false,
    hasPaidCustomers: input.hasPaidCustomers || false,
    hasRecurringRevenue: input.hasRecurringRevenue || false,
    hasScalableBusinessModel: input.hasScalableBusinessModel || false,
    isOperationallyProfitable: input.isOperationallyProfitable || false,
    productMarketFit: input.productMarketFit || false,
    hasIntellectualProperty: input.hasIntellectualProperty || false,
    
    // String fields with empty default
    competitiveAdvantage: input.competitiveAdvantage || '',
    description: input.description || '',
    website: input.website || '',
    location: input.location || '',
    stage: input.stage || '',
    
    // Keep original input for any other fields
    ...input
  };
}

// Updated calculation functions using safe input
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

// Updated main function using safe input
export default function StageDetectionPage() {
  const [formData, setFormData] = useState<Partial<StageDetectionInput>>({
    companyName: '',
    foundedYear: new Date().getFullYear(),
    teamSize: 1,
    monthlyRevenue: 0,
    totalFunding: 0,
    burnRate: 0,
    runway: 12,
    hasLiveProduct: false,
    activeCustomers: 0,
    customerCount: 0,
    growthRate: 0,
    monthlyGrowthRate: 0,
    hasRecurringRevenue: false,
    hasPaidCustomers: false,
    hasScalableBusinessModel: false
  });

  const handleInputChange = (field: keyof StageDetectionInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: (field as string).includes('has') || (field as string).includes('is') ? Boolean(value) : value
    }));
  };

  const analyzeStage = async () => {
    // Form validation
    if (!formData.companyName) {
      alert('Please enter company name');
      return;
    }

    try {
      const safeInput = createSafeInput(formData as StageDetectionInput);
      
      // Calculate scores using safe input
      const scores = {
        PRE_SEED: calculatePreSeedScore(safeInput),
        SEED: calculateSeedScore(safeInput),
        SERIES_A: calculateSeriesAScore(safeInput),
        GROWTH: calculateGrowthScore(safeInput)
      };

      // Determine stage with highest score
      const detectedStage = Object.entries(scores).reduce((a, b) => 
        scores[a[0] as StartupStage] > scores[b[0] as StartupStage] ? a : b
      )[0] as StartupStage;

      const result: StageDetectionResult = {
        detectedStage,
        confidence: Math.min(60 + scores[detectedStage], 95),
        stageScore: scores[detectedStage],
        reasons: getReasons(detectedStage),
        recommendations: getRecommendations(detectedStage),
        nextMilestones: getNextMilestones(detectedStage),
        benchmarkComparison: getBenchmarks(detectedStage, safeInput)
      };

      setResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Error during analysis. Please try again.');
    }
  };

  // Rest of the component...
}
