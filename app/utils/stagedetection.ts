'use client';

import { useState } from 'react';

// Types directly in component for now
export type StartupStage = 'PRE_SEED' | 'SEED' | 'SERIES_A' | 'GROWTH';

export interface StageDetectionInput {
  companyName: string;
  foundedYear: number;
  teamSize: number;
  monthlyRevenue: number;
  totalFunding: number;
  burnRate: number;
  runway: number;
  hasLiveProduct: boolean;
  activeCustomers: number;
  marketSize: number;
  monthlyGrowthRate: number;
  customerAcquisitionCost: number;
  lifetimeValue: number;
  hasPaidCustomers: boolean;
  hasRecurringRevenue: boolean;
  isOperationallyProfitable: boolean;
  hasScalableBusinessModel: boolean;
}

export interface StageDetectionResult {
  detectedStage: StartupStage;
  confidence: number;
  stageScore: number;
  reasons: string[];
  recommendations: string[];
  nextMilestones: string[];
  benchmarkComparison: {
    stage: StartupStage;
    metric: string;
    yourValue: number;
    benchmark: number;
    percentile: number;
  }[];
}

// Simple detection function
function detectStartupStage(input: StageDetectionInput): StageDetectionResult {
  // Basic scoring logic
  const scores = {
    PRE_SEED: calculatePreSeedScore(input),
    SEED: calculateSeedScore(input),
    SERIES_A: calculateSeriesAScore(input),
    GROWTH: calculateGrowthScore(input)
  };
  
  const detectedStage = Object.entries(scores).reduce((a, b) => 
    scores[a[0] as StartupStage] > scores[b[0] as StartupStage] ? a : b
  )[0] as StartupStage;
  
  return {
    detectedStage,
    confidence: Math.min(60 + scores[detectedStage], 95),
    stageScore: scores[detectedStage],
    reasons: getReasons(detectedStage, input),
    recommendations: getRecommendations(detectedStage, input),
    nextMilestones: getMilestones(detectedStage),
    benchmarkComparison: getBenchmarks(detectedStage, input)
  };
}

function calculatePreSeedScore(input: StageDetectionInput): number {
  let score = 0;
  score += Math.min(input.teamSize / 5, 1) * 35;
  score += input.hasLiveProduct ? 25 : 15;
  score += input.activeCustomers > 10 ? 20 : 10;
  score += input.totalFunding > 0 ? 10 : 5;
  score += input.marketSize > 100000 ? 10 : 5;
  return Math.min(score, 100);
}

function calculateSeedScore(input: StageDetectionInput): number {
  let score = 0;
  score += input.hasPaidCustomers ? 30 : 15;
  score += input.monthlyRevenue > 1000 ? 25 : 10;
  score += input.hasRecurringRevenue ? 20 : 10;
  score += Math.min(input.monthlyGrowthRate / 20, 1) * 15;
  score += input.activeCustomers > 100 ? 10 : 5;
  return Math.min(score, 100);
}

function calculateSeriesAScore(input: StageDetectionInput): number {
  let score = 0;
  score += input.monthlyRevenue >= 50000 ? 35 : input.monthlyRevenue >= 20000 ? 20 : 0;
  score += input.hasScalableBusinessModel ? 25 : 10;
  score += input.marketSize >= 1000000 ? 20 : 10;
  score += input.monthlyGrowthRate >= 15 ? 10 : 5;
  score += input.totalFunding >= 500000 ? 10 : 5;
  return Math.min(score, 100);
}

function calculateGrowthScore(input: StageDetectionInput): number {
  let score = 0;
  score += input.isOperationallyProfitable ? 40 : 10;
  score += input.activeCustomers > 1000 ? 25 : 15;
  score += input.monthlyRevenue >= 200000 ? 20 : 5;
  score += (input.lifetimeValue > 0 && input.customerAcquisitionCost > 0 && 
           (input.lifetimeValue / input.customerAcquisitionCost) >= 5) ? 15 : 5;
  return Math.min(score, 100);
}

function getReasons(stage: StartupStage, input: StageDetectionInput): string[] {
  const reasons: { [K in StartupStage]: string[] } = {
    PRE_SEED: ['Erken aşama ekip yapısı', 'MVP geliştirme aşamasında'],
    SEED: ['Ürün-pazar uyumu arayışında', 'İlk gelir akışları'],
    SERIES_A: ['Ölçeklenebilir iş modeli', 'Sürdürülebilir büyüme'],
    GROWTH: ['Operasyonel verimlilik', 'Pazar liderliği odaklı']
  };
  return reasons[stage];
}

function getRecommendations(stage: StartupStage, input: StageDetectionInput): string[] {
  const recommendations: { [K in StartupStage]: string[] } = {
    PRE_SEED: ['Müşteri geliştirme odaklı çalışın', 'MVP geliştirin'],
    SEED: ['AARRR metriklerini takip edin', 'Unit economics optimize edin'],
    SERIES_A: ['Satış kanallarını ölçeklendirin', 'Süreçleri standartlaştırın'],
    GROWTH: ['Yeni pazarlara genişleyin', 'Operasyonel mükemmellik']
  };
  return recommendations[stage];
}

function getMilestones(stage: StartupStage): string[] {
  const milestones: { [K in StartupStage]: string[] } = {
    PRE_SEED: ['İlk 100 beta kullanıcı', 'PMF sinyalleri', 'Seed hazırlık'],
    SEED: ['Aylık €10K+ gelir', 'LTV/CAC 3:1', 'Series A hazırlık'],
    SERIES_A: ['Aylık €100K+ gelir', 'Ölçeklenebilir satış', 'Büyüme fonlaması'],
    GROWTH: ['Coğrafi genişleme', 'Operasyonel kârlılık', 'Stratejik ortaklıklar']
  };
  return milestones[stage];
}

function getBenchmarks(stage: StartupStage, input: StageDetectionInput): StageDetectionResult['benchmarkComparison'] {
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
      yourValue: input.teamSize,
      benchmark: benchmark.teamSize,
      percentile: calculatePercentile(input.teamSize, benchmark.teamSize)
    },
    {
      stage,
      metric: 'Aktif Müşteri',
      yourValue: input.activeCustomers,
      benchmark: benchmark.activeCustomers,
      percentile: calculatePercentile(input.activeCustomers, benchmark.activeCustomers)
    },
    {
      stage,
      metric: 'Aylık Gelir (€)',
      yourValue: input.monthlyRevenue,
      benchmark: benchmark.monthlyRevenue,
      percentile: calculatePercentile(input.monthlyRevenue, benchmark.monthlyRevenue)
    }
  ];
}

function calculatePercentile(value: number, benchmark: number): number {
  if (benchmark === 0) return value > 0 ? 75 : 50;
  const ratio = value / benchmark;
  if (ratio >= 2) return 90;
  if (ratio >= 1.5) return 80;
  if (ratio >= 1.2) return 70;
  if (ratio >= 1) return 60;
  if (ratio >= 0.8) return 50;
  return 40;
}

const StageDetectionPage = () => {
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
    marketSize: 0,
    monthlyGrowthRate: 0,
    customerAcquisitionCost: 0,
    lifetimeValue: 0,
    hasPaidCustomers: false,
    hasRecurringRevenue: false,
    isOperationallyProfitable: false,
    hasScalableBusinessModel: false
  });

  const [result, setResult] = useState<StageDetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleInputChange = (field: keyof StageDetectionInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: field.includes('has') || field.includes('is') ? Boolean(value) : value
    }));
  };

  const analyzeStage = async () => {
    if (!formData.companyName) {
      alert('Lütfen şirket adını girin');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Form verisini tam StageDetectionInput'a dönüştür
      const input: StageDetectionInput = {
        companyName: formData.companyName || '',
        foundedYear: formData.foundedYear || new Date().getFullYear(),
        teamSize: Number(formData.teamSize) || 1,
        monthlyRevenue: Number(formData.monthlyRevenue) || 0,
        totalFunding: Number(formData.totalFunding) || 0,
        burnRate: Number(formData.burnRate) || 0,
        runway: Number(formData.runway) || 12,
        hasLiveProduct: Boolean(formData.hasLiveProduct),
        activeCustomers: Number(formData.activeCustomers) || 0,
        marketSize: Number(formData.marketSize) || 0,
        monthlyGrowthRate: Number(formData.monthlyGrowthRate) || 0,
        customerAcquisitionCost: Number(formData.customerAcquisitionCost) || 0,
        lifetimeValue: Number(formData.lifetimeValue) || 0,
        hasPaidCustomers: Boolean(formData.hasPaidCustomers),
        hasRecurringRevenue: Boolean(formData.hasRecurringRevenue),
        isOperationallyProfitable: Boolean(formData.isOperationallyProfitable),
        hasScalableBusinessModel: Boolean(formData.hasScalableBusinessModel)
      };

      const analysis = detectStartupStage(input);
      setResult(analysis);
      
    } catch (error) {
      console.error('Stage detection error:', error);
      alert('Analiz sırasında hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      foundedYear: new Date().getFullYear(),
      teamSize: 1,
      monthlyRevenue: 0,
      totalFunding: 0,
      burnRate: 0,
      runway: 12,
      hasLiveProduct: false,
      activeCustomers: 0,
      marketSize: 0,
      monthlyGrowthRate: 0,
      customerAcquisitionCost: 0,
      lifetimeValue: 0,
      hasPaidCustomers: false,
      hasRecurringRevenue: false,
      isOperationallyProfitable: false,
      hasScalableBusinessModel: false
    });
    setResult(null);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'PRE_SEED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SEED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SERIES_A': return 'bg-green-100 text-green-800 border-green-200';
      case 'GROWTH': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageDescription = (stage: string) => {
    switch (stage) {
      case 'PRE_SEED': return 'İlk aşama: Fikir doğrulama ve MVP geliştirme';
      case 'SEED': return 'Büyüme aşaması: Ürün-pazar uyumu arayışı';
      case 'SERIES_A': return 'Ölçeklendirme: Kanıtlanmış iş modeli büyütme';
      case 'GROWTH': return 'Büyüme+: Pazar liderliği ve karlılık odaklı';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Startup Stage Detection
          </h1>
          <p className="text-lg text-gray-600">
            AI destekli startup aşama belirleme aracı - Ücretsiz ve anonim
          </p>
        </div>

        {!result ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Temel Bilgiler */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şirket Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Örnek: TechStartup Inc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kuruluş Yılı
                  </label>
                  <input
                    type="number"
                    value={formData.foundedYear}
                    onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="2000"
                    max="2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ekip Büyüklüğü
                  </label>
                  <input
                    type="number"
                    value={formData.teamSize}
                    onChange={(e) => handleInputChange('teamSize', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aylık Gelir (€)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyRevenue}
                    onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Toplam Fonlama (€)
                  </label>
                  <input
                    type="number"
                    value={formData.totalFunding}
                    onChange={(e) => handleInputChange('totalFunding', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Metrikler */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Performans Metrikleri</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aktif Müşteri Sayısı
                  </label>
                  <input
                    type="number"
                    value={formData.activeCustomers}
                    onChange={(e) => handleInputChange('activeCustomers', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aylık Büyüme Oranı (%)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyGrowthRate}
                    onChange={(e) => handleInputChange('monthlyGrowthRate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Müşteri Edinim Maliyeti (€)
                  </label>
                  <input
                    type="number"
                    value={formData.customerAcquisitionCost}
                    onChange={(e) => handleInputChange('customerAcquisitionCost', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Müşteri Yaşam Boyu Değeri (€)
                  </label>
                  <input
                    type="number"
                    value={formData.lifetimeValue}
                    onChange={(e) => handleInputChange('lifetimeValue', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hedef Pazar Büyüklüğü (€)
                  </label>
                  <input
                    type="number"
                    value={formData.marketSize}
                    onChange={(e) => handleInputChange('marketSize', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Boolean Alanları */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Durum Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hasLiveProduct}
                    onChange={(e) => handleInputChange('hasLiveProduct', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Canlı ürünümüz var</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hasPaidCustomers}
                    onChange={(e) => handleInputChange('hasPaidCustomers', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Ödeme yapan müşterilerimiz var</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hasRecurringRevenue}
                    onChange={(e) => handleInputChange('hasRecurringRevenue', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Tekrarlayan gelir modelimiz var</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isOperationallyProfitable}
                    onChange={(e) => handleInputChange('isOperationallyProfitable', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Operasyonel olarak karlıyız</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hasScalableBusinessModel}
                    onChange={(e) => handleInputChange('hasScalableBusinessModel', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Ölçeklenebilir iş modelimiz var</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-center space-x-4">
              <button
                onClick={analyzeStage}
                disabled={isAnalyzing || !formData.companyName}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? '🤖 Analiz Ediliyor...' : '🚀 Stage Analizi Yap'}
              </button>
              <button
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                🔄 Formu Temizle
              </button>
            </div>
          </div>
        ) : (
          /* Sonuçlar */
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                📊 {formData.companyName} - Stage Analizi
              </h2>
              <div className={`inline-block px-6 py-3 rounded-full border ${getStageColor(result.detectedStage)}`}>
                <span className="text-xl font-bold">{result.detectedStage.replace('_', '-')}</span>
              </div>
              <p className="text-gray-600 mt-2">{getStageDescription(result.detectedStage)}</p>
            </div>

            {/* Skor ve Güven */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Stage Skoru</h4>
                <div className="text-3xl font-bold text-blue-600">{result.stageScore.toFixed(0)}/100</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Güven Seviyesi</h4>
                <div className="text-3xl font-bold text-green-600">{result.confidence.toFixed(0)}%</div>
              </div>
            </div>

            {/* Nedenler */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Belirleme Nedenleri</h3>
              <ul className="space-y-2">
                {result.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-gray-700">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Öneriler */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Gelişim Önerileri</h3>
              <ul className="space-y-2">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Milestone */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🏁 Sonraki Hedefler</h3>
              <ul className="space-y-2">
                {result.nextMilestones.map((milestone, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-purple-500 mt-1">→</span>
                    <span className="text-gray-700">{milestone}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benchmark Karşılaştırma */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 Benchmark Karşılaştırması</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Metrik</th>
                      <th className="text-right py-2">Sizin Değer</th>
                      <th className="text-right py-2">Benchmark</th>
                      <th className="text-right py-2">Persentil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.benchmarkComparison.map((comparison, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">{comparison.metric}</td>
                        <td className="text-right py-2 font-medium">{comparison.yourValue.toLocaleString()}</td>
                        <td className="text-right py-2 text-gray-500">{comparison.benchmark.toLocaleString()}</td>
                        <td className="text-right py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            comparison.percentile >= 70 ? 'bg-green-100 text-green-800' :
                            comparison.percentile >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {comparison.percentile}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={resetForm}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                🔄 Yeni Analiz Yap
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                🏠 Ana Sayfaya Dön
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>🤖 Bu analiz AI tarafından gerçekleştirilmiştir ve tavsiye niteliğindedir.</p>
          <p>Detaylı değerlendirme için form doldurarak kayıt olabilirsiniz.</p>
        </div>
      </div>
    </div>
  );
};

export default StageDetectionPage;