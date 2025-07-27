'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  StartupStage, 
  StageDetectionInput, 
  StageDetectionResult 
} from '@/types';

// Utility function: Safe input with all defaults
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

function getReasons(stage: StartupStage): string[] {
  const reasons: Record<StartupStage, string[]> = {
    PRE_SEED: ['Erken aşama ekip yapısı', 'MVP geliştirme aşamasında'],
    SEED: ['Ürün-pazar uyumu arayışında', 'İlk gelir akışları'],
    SERIES_A: ['Ölçeklenebilir iş modeli', 'Sürdürülebilir büyüme'],
    GROWTH: ['Operasyonel verimlilik', 'Pazar liderliği odaklı']
  };
  return reasons[stage] || [];
}

function getRecommendations(stage: StartupStage): string[] {
  const recommendations: Record<StartupStage, string[]> = {
    PRE_SEED: ['MVP geliştirmeye odaklan', 'İlk kullanıcı geri bildirimlerini topla'],
    SEED: ['Ürün-pazar uyumunu doğrula', 'Gelir modelini optimize et'],
    SERIES_A: ['Büyüme stratejilerini ölçekle', 'Operasyonel sistemleri güçlendir'],
    GROWTH: ['Pazardaki pozisyonu güçlendir', 'Yeni pazar fırsatlarını değerlendir']
  };
  return recommendations[stage] || [];
}

function getNextMilestones(stage: StartupStage): string[] {
  const milestones: Record<StartupStage, string[]> = {
    PRE_SEED: ['İlk 100 kullanıcıya ulaşmak', 'MVP\'yi piyasaya sürmek'],
    SEED: ['Aylık tekrarlayan gelir elde etmek', 'Ekibi büyütmek'],
    SERIES_A: ['Sürdürülebilir büyüme oranı yakalamak', 'Pazar payını artırmak'],
    GROWTH: ['Operasyonel kârlılığa ulaşmak', 'Uluslararası pazara açılmak']
  };
  return milestones[stage] || [];
}

function getBenchmarks(stage: StartupStage, input: any) {
  const safe = createSafeInput(input);
  const benchmarks = {
    PRE_SEED: { teamSize: 3, activeCustomers: 50, monthlyRevenue: 0 },
    SEED: { teamSize: 8, activeCustomers: 200, monthlyRevenue: 5000 },
    SERIES_A: { teamSize: 25, activeCustomers: 1000, monthlyRevenue: 50000 },
    GROWTH: { teamSize: 50, activeCustomers: 5000, monthlyRevenue: 200000 }
  };

  const benchmark = benchmarks[stage];
  return [
    {
      stage,
      metric: 'Ekip Büyüklüğü',
      your_value: safe.teamSize,
      benchmark: benchmark.teamSize,
      percentile: calculatePercentile(safe.teamSize, benchmark.teamSize)
    },
    {
      stage,
      metric: 'Aktif Müşteri',
      your_value: safe.activeCustomers,
      benchmark: benchmark.activeCustomers,
      percentile: calculatePercentile(safe.activeCustomers, benchmark.activeCustomers)
    },
    {
      stage,
      metric: 'Aylık Gelir',
      your_value: safe.monthlyRevenue,
      benchmark: benchmark.monthlyRevenue,
      percentile: calculatePercentile(safe.monthlyRevenue, benchmark.monthlyRevenue)
    }
  ];
}

function calculatePercentile(value: number, benchmark: number): number {
  if (benchmark === 0) return value > 0 ? 75 : 50;
  const ratio = value / benchmark;
  if (ratio >= 2) return 95;
  if (ratio >= 1.5) return 85;
  if (ratio >= 1) return 75;
  if (ratio >= 0.5) return 50;
  return 25;
}

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

  const [result, setResult] = useState<StageDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof StageDetectionInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: (field as string).includes('has') || (field as string).includes('is') ? Boolean(value) : value
    }));
  };

  const analyzeStage = async () => {
    if (!formData.companyName) {
      alert('Please enter company name');
      return;
    }

    setLoading(true);
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

      const analysisResult: StageDetectionResult = {
        detectedStage,
        confidence: Math.min(60 + scores[detectedStage], 95),
        stageScore: scores[detectedStage],
        reasons: getReasons(detectedStage),
        recommendations: getRecommendations(detectedStage),
        nextMilestones: getNextMilestones(detectedStage),
        benchmarkComparison: getBenchmarks(detectedStage, safeInput)
      };

      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Error during analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Startup Stage Detection
          </h1>
          <p className="text-lg text-gray-600">
            Discover your startup's current stage with AI-powered analysis
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Please provide your startup details for accurate analysis
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
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
                />
              </div>
            </div>

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
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasLiveProduct"
                  checked={formData.hasLiveProduct || false}
                  onChange={(e) => handleInputChange('hasLiveProduct', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="hasLiveProduct" className="text-sm font-medium text-gray-700">
                  Has Live Product
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasPaidCustomers"
                  checked={formData.hasPaidCustomers || false}
                  onChange={(e) => handleInputChange('hasPaidCustomers', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="hasPaidCustomers" className="text-sm font-medium text-gray-700">
                  Has Paid Customers
                </label>
              </div>
            </div>

            <Button
              onClick={analyzeStage}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze Stage'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Detected Stage: {result.detectedStage}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Confidence: {result.confidence}%
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Key Reasons:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {result.reasons.map((reason, index) => (
                      <li key={index} className="text-sm text-gray-600">{reason}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
