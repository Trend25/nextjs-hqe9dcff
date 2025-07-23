'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../ClientAuthProvider';

// Search params'i conditional olarak al
function useClientSearchParams() {
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  
  useEffect(() => {
    // Sadece client-side'da çalışır
    if (typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search));
    }
  }, []);
  
  return searchParams;
}

interface FormSubmission {
  id: string;
  companyName: string;
  email: string;
  submittedAt: string;
  userType: string;
}

export default function ResultsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useClientSearchParams(); // Custom hook kullan
  
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Search params yüklenene kadar bekle
  const userType = searchParams?.get('type') || 'entrepreneur';

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Mock data - gerçek uygulamada API'den gelecek
    const mockSubmissions: FormSubmission[] = [
      {
        id: '1',
        companyName: 'TechStartup A',
        email: 'founder@techstartup.com',
        submittedAt: '2024-01-15',
        userType: 'entrepreneur'
      },
      {
        id: '2', 
        companyName: 'FinTech B',
        email: 'ceo@fintech.com',
        submittedAt: '2024-01-10',
        userType: 'entrepreneur'
      }
    ];

    setTimeout(() => {
      setSubmissions(mockSubmissions);
      setLoading(false);
    }, 1000);
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              📊 Form Sonuçları - {userType === 'entrepreneur' ? 'Girişimci' : 'Yatırımcı'} Paneli
            </h1>
            <button
              onClick={() => router.push('/form')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Yeni Form
            </button>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Henüz form submission'ı yok.</p>
              <button
                onClick={() => router.push('/form')}
                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                İlk Formu Oluştur
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Şirket Adı</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Kullanıcı Tipi</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{submission.companyName}</td>
                      <td className="py-3 px-4 text-gray-600">{submission.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          submission.userType === 'entrepreneur' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {submission.userType === 'entrepreneur' ? 'Girişimci' : 'Yatırımcı'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{submission.submittedAt}</td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => router.push(`/stage-detection?company=${submission.companyName}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Analiz Et →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                🏠 Ana Sayfa
              </button>
              <button
                onClick={() => router.push('/stage-detection')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                🚀 Stage Analizi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
