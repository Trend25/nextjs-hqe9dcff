export const dynamic = 'force-dynamic';

'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ClientAuthProvider, useAuth } from '../ClientAuthProvider'; 

interface FormSubmission {
  id: string;
  user_type: string;
  form_data: {
    companyName: string;
    industry: string;
    stage: string;
    teamSize: string;
    revenue: string;
  };
  rating_score: number;
  rating_level: 'A' | 'B' | 'C' | 'D';
  created_at: string;
}

export default function ResultsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') || 'entrepreneur';
  const submissionId = searchParams.get('submissionId');

  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - gerçekte database'den gelecek
    const mockSubmission: FormSubmission = {
      id: submissionId || 'mock-id',
      user_type: userType,
      form_data: {
        companyName: 'Demo Startup',
        industry: 'Teknoloji',
        stage: 'MVP',
        teamSize: '6-10',
        revenue: '10-50K'
      },
      rating_score: 78,
      rating_level: 'B',
      created_at: new Date().toISOString()
    };

    setSubmission(mockSubmission);
    setLoading(false);
  }, [submissionId, userType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Sonuçlar hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sonuç Bulunamadı</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  const getRatingColor = (level: string) => {
    switch (level) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingDescription = (level: string) => {
    switch (level) {
      case 'A': return 'Mükemmel - Yatırım için çok uygun';
      case 'B': return 'İyi - Gelişim potansiyeli yüksek';
      case 'C': return 'Orta - İyileştirme alanları mevcut';
      case 'D': return 'Gelişim Gerekli - Temel konulara odaklanın';
      default: return 'Değerlendiriliyor';
    }
  };

  const getRecommendations = (submission: FormSubmission) => {
    const recommendations = [];
    
    if (submission.form_data.revenue === '0') {
      recommendations.push('Gelir modeli geliştirmeye odaklanın');
    }
    if (submission.form_data.stage === 'Fikir') {
      recommendations.push('MVP geliştirme sürecini hızlandırın');
    }
    if (submission.form_data.teamSize === '1-5') {
      recommendations.push('Ekip büyütme stratejisi oluşturun');
    }
    
    return recommendations.length > 0 ? recommendations : [
      'Mevcut büyüme momentumunu sürdürün',
      'Yatırımcı sunumunuzu hazırlayın',
      'Ölçekleme stratejinizi netleştirin'
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Değerlendirme Sonuçları
          </h1>
          <p className="text-lg text-gray-600">{submission.form_data.companyName}</p>
        </div>

        {/* Rating Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <div className={`inline-block text-6xl font-bold px-8 py-4 rounded-2xl ${getRatingColor(submission.rating_level)}`}>
              {submission.rating_level}
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">{submission.rating_score}/100</div>
              <div className="text-lg text-gray-600 mt-2">
                {getRatingDescription(submission.rating_level)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${submission.rating_score}%` }}
            ></div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Şirket Bilgileri</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sektör:</span>
                <span className="font-medium">{submission.form_data.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aşama:</span>
                <span className="font-medium">{submission.form_data.stage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ekip:</span>
                <span className="font-medium">{submission.form_data.teamSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gelir:</span>
                <span className="font-medium">{submission.form_data.revenue}</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Öneriler</h3>
            <ul className="space-y-3">
              {getRecommendations(submission).map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => router.push(`/form?type=${userType}`)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            🔄 Yeni Değerlendirme
          </button>
          <button
            onClick={() => router.push('/stage-detection')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
          >
            🎯 Stage Analizi
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
          >
            🏠 Ana Sayfa
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Değerlendirme tarihi: {new Date(submission.created_at).toLocaleDateString('tr-TR')}</p>
          <p>Bu sonuçlar AI destekli analiz ile oluşturulmuştur.</p>
        </div>
      </div>
    </div>
  );
}
