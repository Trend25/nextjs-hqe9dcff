'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  StartupStage, 
  StageDetectionInput, 
  StageDetectionResult 
} from '@/types';

// ✅ Utility function: Safe input with all defaults
function createSafeInput(input: StageDetectionInput): Required<StageDetectionInput> {
  return {
    // String defaults
    companyName: input.companyName || '',
    industry: input.industry || 'Technology',
    description: input.description || '',
    website: input.website || '',
    location: input.location || '',
    competitiveAdvantage: input.competitiveAdvantage || '',
    stage: input.stage || '',
    
    // Number defaults
    foundedYear: input.foundedYear || new Date().getFullYear(),
    teamSize: input.teamSize || 1,
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
    employees: input.employees || 1,
    valuation: input.valuation || 0,
    fundingGoal: input.fundingGoal || 0,
    
    // Boolean defaults
    hasLiveProduct: input.hasLiveProduct ?? false,
    hasPaidCustomers: input.hasPaidCustomers ?? false,
    hasRecurringRevenue: input.hasRecurringRevenue ?? false,
    hasScalableBusinessModel: input.hasScalableBusinessModel ?? false,
    isOperationallyProfitable: input.isOperationallyProfitable ?? false,
    productMarketFit: input.productMarketFit ?? false,
    hasIntellectualProperty: input.hasIntellectualProperty ?? false,
  };
}

// ✅ Enhanced scoring algorithms
function calculatePreSeedScore(input: StageDetectionInput): number {
  const safe = createSafeInput(input);
  let score = 0;
  
  // Team foundation (30%)
  score += Math.min(safe.teamSize / 5, 1) * 30;
  
  // Product development (25%)
  score += safe.hasLiveProduct ? 25 : (safe.description ? 15 : 10);
  
  // Early traction (20%)
  score += safe.activeCustomers > 50 ? 20 : safe.activeCustomers > 10 ? 15 : 10;
  
  // Market validation (15%)
  score += safe.marketSize > 100000 ? 15 : 10;
  
  // Funding/resources (10%)
  score += safe.totalFunding > 50000 ? 10 : safe.totalFunding > 0 ? 7 : 5;
  
  return Math.min(score, 100);
}

function calculateSeedScore(input: StageDetectionInput): number {
  const safe = createSafeInput(input);
  let score = 0;
  
  // Revenue traction (35%)
  score += safe.hasPaidCustomers ? 25 : 10;
  score += safe.monthlyRevenue > 5000 ? 10 : safe.monthlyRevenue > 1000 ? 7 : 0;
  
  // Product-market fit (25%)
  score += safe.hasRecurringRevenue ? 15 : 5;
  score += safe.productMarketFit ? 10 : 5;
  
  // Growth metrics (25%)
  score += Math.min(safe.monthlyGrowthRate / 20, 1) * 15;
  score += safe.activeCustomers > 200 ? 10 : safe.activeCustomers > 100 ? 7 : 0;
  
  // Business model (15%)
  score += safe.hasScalableBusinessModel ? 15 : 5;
  
  return Math.min(score, 100);
}

function calculateSeriesAScore(input: StageDetectionInput): number {
  const safe = createSafeInput(input);
  let score = 0;
  
  // Revenue scale (40%)
  score += safe.monthlyRevenue >= 100000 ? 30 : safe.monthlyRevenue >= 50000 ? 20 : safe.monthlyRevenue >= 20000 ? 10 : 0;
  score += safe.annualRevenue >= 1000000 ? 10 : safe.annualRevenue >= 500000 ? 7 : 0;
  
  // Market & scaling (30%)
  score += safe.hasScalableBusinessModel ? 15 : 5;
  score += safe.marketSize >= 1000000 ? 15 : safe.marketSize >= 500000 ? 10 : 5;
  
  // Team & operations (20%)
  score += safe.teamSize >= 15 ? 15 : safe.teamSize >= 10 ? 10 : 5;
  score += safe.activeCustomers >= 1000 ? 5 : 0;
  
  // Financial metrics (10%)
  score += safe.totalFunding >= 500000 ? 10 : safe.totalFunding >= 250000 ? 7 : 0;
  
  return Math.min(score, 100);
}

function calculateGrowthScore(input: StageDetectionInput): number {
  const safe = createSafeInput(input);
  let score = 0;
  
  // Profitability & efficiency (40%)
  score += safe.isOperationallyProfitable ? 25 : 5;
  score += (safe.lifetimeValue > 0 && safe.customerAcquisitionCost > 0 && 
           safe.lifetimeValue / safe.customerAcquisitionCost > 3) ? 15 : 5;
  
  // Scale metrics (35%)
  score += safe.monthlyRevenue >= 500000 ? 20 : safe.monthlyRevenue >= 200000 ? 15 : 5;
  score += safe.activeCustomers > 5000 ? 15 : safe.activeCustomers > 1000 ? 10 : 0;
  
  // Market position (25%)
  score += safe.teamSize >= 50 ? 15 : safe.teamSize >= 25 ? 10 : 5;
  score += safe.marketSize >= 10000000 ? 10 : safe.marketSize >= 1000000 ? 7 : 0;
  
  return Math.min(score, 100);
}

// ✅ Enhanced content functions
function getStageInfo(stage: StartupStage) {
  const stageData = {
    PRE_SEED: {
      title: 'Pre-Seed Stage',
      description: 'İdea validation ve MVP geliştirme aşaması',
      color: 'bg-purple-100 text-purple-800',
      icon: '🌱'
    },
    SEED: {
      title: 'Seed Stage', 
      description: 'Ürün-pazar uyumu ve ilk gelir akışları',
      color: 'bg-blue-100 text-blue-800',
      icon: '🌿'
    },
    SERIES_A: {
      title: 'Series A Stage',
      description: 'Ölçeklenebilir büyüme ve pazar genişlemesi',
      color: 'bg-green-100 text-green-800',
      icon: '🌳'
    },
    GROWTH: {
      title: 'Growth Stage',
      description: 'Pazar liderliği ve operasyonel verimlilik',
      color: 'bg-orange-100 text-orange-800',
      icon: '🚀'
    }
  };
  
  return stageData[stage];
}

function getReasons(stage: StartupStage): string[] {
  const reasons: Record<StartupStage, string[]> = {
    PRE_SEED: [
      'Erken aşama ekip yapısı mevcut',
      'MVP geliştirme veya idea validation aşamasında',
      'Minimal finansal traction',
      'Product-market fit arayışında'
    ],
    SEED: [
      'İlk gelir akışları başlamış',
      'Ürün-pazar uyumu sinyalleri var',
      'Müşteri tabanı genişliyor',
      'Sürdürülebilir büyüme modeli gelişiyor'
    ],
    SERIES_A: [
      'Ölçeklenebilir iş modeli kanıtlanmış',
      'Sürdürülebilir gelir büyümesi',
      'Güçlü pazar pozisyonu',
      'Operasyonel sistemler olgunlaşıyor'
    ],
    GROWTH: [
      'Operasyonel kârlılık odaklı',
      'Pazar liderliği konumunda',
      'Güçlü finansal metrikler',
      'Ölçekli operasyonlar'
    ]
  };
  return reasons[stage] || [];
}

function getRecommendations(stage: StartupStage): string[] {
  const recommendations: Record<StartupStage, string[]> = {
    PRE_SEED: [
      'MVP geliştirmeye ve kullanıcı testlerine odaklan',
      'İlk kullanıcı geri bildirimlerini sistematik topla',
      'Minimal viable team oluştur',
      'Founding team equity dağılımını netleştir'
    ],
    SEED: [
      'Ürün-pazar uyumunu kanıtla ve dokümante et',
      'Gelir modelini optimize et ve çeşitlendir',
      'Müşteri kazanım süreçlerini ölçekle',
      'Seed funding için güçlü traction metrics oluştur'
    ],
    SERIES_A: [
      'Büyüme stratejilerini agresif şekilde ölçekle',
      'Operasyonel sistemleri ve süreçleri güçlendir',
      'Pazar payını artırmak için competitive advantage geliştir',
      'Series A için güçlü unit economics kanıtla'
    ],
    GROWTH: [
      'Pazardaki liderlik pozisyonunu güçlendir',
      'Yeni pazar fırsatlarını ve expansion planlarını değerlendir',
      'Operational efficiency ve profitability optimize et',
      'Strategic partnerships ve M&A fırsatlarını araştır'
    ]
  };
  return recommendations[stage] || [];
}

function getNextMilestones(stage: StartupStage): string[] {
  const milestones: Record<StartupStage, string[]> = {
    PRE_SEED: [
      'İlk 100-500 kullanıcıya ulaşmak',
      'MVP\'yi piyasaya sürmek ve feedback toplamak',
      'Founding team\'i tamamlamak',
      'İlk pre-seed funding turunu kapatmak'
    ],
    SEED: [
      'Aylık $10K+ recurring revenue elde etmek',
      'Product-market fit metriklerini kanıtlamak',
      'Ekibi 10-15 kişiye çıkarmak',
      'Seed funding için $500K-2M hedeflemek'
    ],
    SERIES_A: [
      'Aylık $100K+ ARR\'a ulaşmak',
      'Sürdürülebilir 15%+ monthly growth yakalamak',
      'Pazar payını %5+ seviyesine çıkarmak',
      'Series A için $3M-10M funding hedeflemek'
    ],
    GROWTH: [
      'Operational profitability achieve etmek',
      'International expansion planlarını hayata geçirmek',
      'Market leadership position\'ı güçlendirmek',
      'IPO veya strategic exit seçeneklerini değerlendirmek'
    ]
  };
  return milestones[stage] || [];
}

function getBenchmarks(stage: StartupStage, input: any) {
  const safe = createSafeInput(input);
  const benchmarks = {
    PRE_SEED: { 
      teamSize: 3, 
      activeCustomers: 100, 
      monthlyRevenue: 1000,
      totalFunding: 100000
    },
    SEED: { 
      teamSize: 8, 
      activeCustomers: 500, 
      monthlyRevenue: 10000,
      totalFunding: 750000
    },
    SERIES_A: { 
      teamSize: 25, 
      activeCustomers: 2000, 
      monthlyRevenue: 100000,
      totalFunding: 5000000
    },
    GROWTH: { 
      teamSize: 75, 
      activeCustomers: 10000, 
      monthlyRevenue: 500000,
      totalFunding: 25000000
    }
  };

  const benchmark = benchmarks[stage];
  return [
    {
      metric: 'Ekip Büyüklüğü',
      your_value: safe.teamSize,
      benchmark: benchmark.teamSize,
      percentile: calculatePercentile(safe.teamSize, benchmark.teamSize)
    },
    {
      metric: 'Aktif Müşteri',
      your_value: safe.activeCustomers,
      benchmark: benchmark.activeCustomers,
      percentile: calculatePercentile(safe.activeCustomers, benchmark.activeCustomers)
    },
    {
      metric: 'Aylık Gelir ($)',
      your_value: safe.monthlyRevenue,
      benchmark: benchmark.monthlyRevenue,
      percentile: calculatePercentile(safe.monthlyRevenue, benchmark.monthlyRevenue)
    },
    {
      metric: 'Toplam Funding ($)',
      your_value: safe.totalFunding,
      benchmark: benchmark.totalFunding,
      percentile: calculatePercentile(safe.totalFunding, benchmark.totalFunding)
    }
  ];
}

function calculatePercentile(value: number, benchmark: number): number {
  if (benchmark === 0) return value > 0 ? 75 : 50;
  const ratio = value / benchmark;
  if (ratio >= 2) return 95;
  if (ratio >= 1.5) return 85;
  if (ratio >= 1) return 75;
  if (ratio >= 0.7) return 60;
  if (ratio >= 0.5) return 50;
  if (ratio >= 0.3) return 40;
  return 25;
}

export default function StageDetectionPage() {
  const [formData, setFormData] = useState<Partial<StageDetectionInput>>({
    companyName: '',
    industry: 'Technology',
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
    hasScalableBusinessModel: false,
    isOperationallyProfitable: false,
    productMarketFit: false
  });

  const [result, setResult] = useState<StageDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof StageDetectionInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (!formData.companyName?.trim()) {
      newErrors.push('Company name is required');
    }
    
    if (formData.teamSize && formData.teamSize < 1) {
      newErrors.push('Team size must be at least 1');
    }
    
    if (formData.foundedYear && formData.foundedYear > new Date().getFullYear()) {
      newErrors.push('Founded year cannot be in the future');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const analyzeStage = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors([]);
    
    try {
      const safeInput = createSafeInput(formData as StageDetectionInput);
      
      const scores = {
        PRE_SEED: calculatePreSeedScore(safeInput),
        SEED: calculateSeedScore(safeInput),
        SERIES_A: calculateSeriesAScore(safeInput),
        GROWTH: calculateGrowthScore(safeInput)
      };

      const detectedStage = Object.entries(scores).reduce((a, b) => 
        scores[a[0] as StartupStage] > scores[b[0] as StartupStage] ? a : b
      )[0] as StartupStage;

      // Enhanced confidence calculation
      const topScore = scores[detectedStage];
      const secondBestScore = Math.max(
        ...Object.entries(scores)
          .filter(([stage]) => stage !== detectedStage)
          .map(([, score]) => score)
      );
      
      const confidenceBase = 60;
      const scoreBonus = Math.min(topScore * 0.3, 25);
      const separationBonus = Math.min((topScore - secondBestScore) * 0.5, 10);
      const confidence = Math.min(confidenceBase + scoreBonus + separationBonus, 95);

      const analysisResult: StageDetectionResult = {
        detectedStage,
        confidence: Math.round(confidence),
        stageScore: Math.round(topScore),
        reasons: getReasons(detectedStage),
        recommendations: getRecommendations(detectedStage),
        nextMilestones: getNextMilestones(detectedStage),
        benchmarkComparison: getBenchmarks(detectedStage, safeInput)
      };

      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis error:', error);
      setErrors(['Analysis failed. Please check your inputs and try again.']);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      industry: 'Technology',
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
      hasScalableBusinessModel: false,
      isOperationallyProfitable: false,
      productMarketFit: false
    });
    setResult(null);
    setErrors([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 AI-Powered Startup Stage Detection
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your startup's current stage with advanced AI analysis and get personalized recommendations for growth
          </p>
        </div>

        {/* Error Alert */}
        {errors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index} className="text-red-700">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏢 Company Information
                </CardTitle>
                <CardDescription>
                  Tell us about your startup to get accurate stage analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName || ''}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter company name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <select
                      value={formData.industry || 'Technology'}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Fintech">Fintech</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="SaaS">SaaS</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Founded Year
                    </label>
                    <input
                      type="number"
                      value={formData.foundedYear || ''}
                      onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="2000"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Size
                    </label>
                    <input
                      type="number"
                      value={formData.teamSize || ''}
                      onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💰 Financial Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Revenue ($)
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyRevenue || ''}
                      onChange={(e) => handleInputChange('monthlyRevenue', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Funding ($)
                    </label>
                    <input
                      type="number"
                      value={formData.totalFunding || ''}
                      onChange={(e) => handleInputChange('totalFunding', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Active Customers
                    </label>
                    <input
                      type="number"
                      value={formData.activeCustomers || ''}
                      onChange={(e) => handleInputChange('activeCustomers', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Growth Rate (%)
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyGrowthRate || ''}
                      onChange={(e) => handleInputChange('monthlyGrowthRate', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Business Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: 'hasLiveProduct', label: 'Has Live Product' },
                    { key: 'hasPaidCustomers', label: 'Has Paid Customers' },
                    { key: 'hasRecurringRevenue', label: 'Has Recurring Revenue' },
                    { key: 'hasScalableBusinessModel', label: 'Has Scalable Business Model' },
                    { key: 'isOperationallyProfitable', label: 'Operationally Profitable' },
                    { key: 'productMarketFit', label: 'Product-Market Fit Achieved' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={key}
                        checked={formData[key as keyof StageDetectionInput] as boolean || false}
                        onChange={(e) => handleInputChange(key as keyof StageDetectionInput, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <label htmlFor={key} className="text-sm font-medium text-gray-700">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={analyzeStage}
                disabled={loading}
                className="flex-1 h-12 text-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analyzing...
                  </div>
                ) : (
                  '🔍 Analyze Stage'
                )}
              </Button>
              
              <Button
                onClick={resetForm}
                variant="outline"
                className="px-6 h-12"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            {result ? (
              <div className="space-y-6 sticky top-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🎯 Analysis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="mb-4">
                        {(() => {
                          const stageInfo = getStageInfo(result.detectedStage);
                          return (
                            <Badge className={`text-lg px-4 py-2 ${stageInfo.color}`}>
                              {stageInfo.icon} {stageInfo.title}
                            </Badge>
                          );
                        })()}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Confidence</span>
                          <span>{result.confidence}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(Math.max(result.confidence, 0), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                          <span>Stage Score</span>
                          <span>{result.stageScore}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(Math.max(result.stageScore, 0), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        🔍 Key Reasons
                      </h4>
                      <ul className="space-y-2">
                        {result.reasons.slice(0, 3).map((reason, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        💡 Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {result.recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📊 Benchmark Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.benchmarkComparison.map((benchmark, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{benchmark.metric}</span>
                            <span className="text-gray-500">
                              {benchmark.percentile}th percentile
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Your: {benchmark.your_value?.toLocaleString()} | 
                            Benchmark: {benchmark.benchmark?.toLocaleString()}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.min(Math.max(benchmark.percentile || 0, 0), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🎯 Next Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.nextMilestones.slice(0, 4).map((milestone, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-orange-500 mt-1">🎯</span>
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="sticky top-8">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready for Analysis
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Fill out the form and click "Analyze Stage" to discover your startup's current stage and get personalized recommendations.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
