'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../ClientAuthProvider'

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

export default function FormPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useClientSearchParams(); // Custom hook kullan
  
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    description: '',
    stage: '',
    teamSize: '',
    funding: '',
    market: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Search params yüklenene kadar bekle
  const userType = searchParams?.get('type') || 'entrepreneur';

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.email) {
      setSubmitMessage('Lütfen zorunlu alanları doldurun');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Mock submission - gerçek uygulamada API'ye gönderilecek
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Başarılı submission
      setSubmitMessage('Form başarıyla gönderildi! 🎉');
      
      // 2 saniye sonra results sayfasına yönlendir
      setTimeout(() => {
        router.push(`/results?type=${userType}`);
      }, 2000);
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      email: '',
      description: '',
      stage: '',
      teamSize: '',
      funding: '',
      market: ''
    });
    setSubmitMessage('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Giriş kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📝 Startup Bilgi Formu
            </h1>
            <p className="text-lg text-gray-600">
              {userType === 'entrepreneur' ? 'Girişimci' : 'Yatırımcı'} olarak bilgilerinizi paylaşın
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Temel Bilgiler */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şirket/Proje Adı *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Startup adınızı girin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta Adresi *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Aşama
                </label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="idea">Fikir Aşaması</option>
                  <option value="mvp">MVP Geliştirme</option>
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed</option>
                  <option value="series-a">Series A</option>
                  <option value="growth">Büyüme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ekip Büyüklüğü
                </label>
                <input
                  type="number"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Kaç kişi?"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hedef Fonlama (€)
                </label>
                <input
                  type="number"
                  name="funding"
                  value={formData.funding}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hedef Pazar
                </label>
                <input
                  type="text"
                  name="market"
                  value={formData.market}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="B2B SaaS, E-ticaret, vb."
                />
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proje Açıklaması
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Startup'ınız ne yapıyor? Hangi problemi çözüyor?"
              />
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div className={`p-3 rounded-md text-sm ${
                submitMessage.includes('başarıyla') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {submitMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '📤 Gönderiliyor...' : '🚀 Formu Gönder'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                🔄 Temizle
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                🏠 Ana Sayfa
              </button>
              <button
                onClick={() => router.push('/stage-detection')}
                className="text-blue-600 hover:text-blue-800 font-medium"
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
