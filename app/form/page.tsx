'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '../ClientAuthProvider'
import { saveFormSubmission } from '../../lib/database'

export default function FormPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get('type') || 'entrepreneur'
  
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    stage: '',
    teamSize: '',
    revenue: ''
  })
  
  const [saving, setSaving] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const authTimeout = setTimeout(() => {
      setAuthChecked(true)
      if (!loading && !user) {
        router.push('/auth/login')
      }
    }, 1500)
    return () => clearTimeout(authTimeout)
  }, [user, loading, router])

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user && authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Giriş Gerekli</h1>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    )
  }

  const questions = {
    entrepreneur: [
      { key: 'companyName', label: 'Şirket Adı', type: 'text', required: true },
      { key: 'industry', label: 'Sektör', type: 'select', options: ['Teknoloji', 'E-ticaret', 'Fintech', 'Sağlık', 'Eğitim'], required: true },
      { key: 'stage', label: 'Şirket Aşaması', type: 'select', options: ['Fikir', 'Prototip', 'MVP', 'Büyüme', 'Olgunluk'], required: true },
      { key: 'teamSize', label: 'Takım Büyüklüğü', type: 'select', options: ['1-5', '6-10', '11-25', '26-50', '50+'], required: true },
      { key: 'revenue', label: 'Aylık Gelir (TL)', type: 'select', options: ['0', '1-10K', '10-50K', '50-100K', '100K+'], required: true }
    ],
    investor: [
      { key: 'companyName', label: 'Yatırım Şirketi', type: 'text', required: true },
      { key: 'industry', label: 'Odak Sektör', type: 'select', options: ['Teknoloji', 'E-ticaret', 'Fintech', 'Sağlık', 'Eğitim'], required: true },
      { key: 'stage', label: 'Yatırım Deneyimi', type: 'select', options: ['Yeni başladım', '1-3 yıl', '3-5 yıl', '5-10 yıl', '10+ yıl'], required: true },
      { key: 'teamSize', label: 'Portföy Büyüklüğü', type: 'select', options: ['1-5 şirket', '6-10 şirket', '11-25 şirket', '26-50 şirket', '50+ şirket'], required: true },
      { key: 'revenue', label: 'Ortalama Yatırım Tutarı', type: 'select', options: ['10K-50K', '50K-100K', '100K-500K', '500K-1M', '1M+'], required: true }
    ],
    angel: [
      { key: 'companyName', label: 'Ad Soyad', type: 'text', required: true },
      { key: 'industry', label: 'Uzmanlık Alanı', type: 'select', options: ['Teknoloji', 'E-ticaret', 'Fintech', 'Sağlık', 'Eğitim'], required: true },
      { key: 'stage', label: 'Melek Yatırım Deneyimi', type: 'select', options: ['İlk defa', '1-2 yatırım', '3-5 yatırım', '6-10 yatırım', '10+ yatırım'], required: true },
      { key: 'teamSize', label: 'Mentorluk Kapasitesi', type: 'select', options: ['1-2 şirket', '3-5 şirket', '6-10 şirket', '10+ şirket'], required: true },
      { key: 'revenue', label: 'Yatırım Bütçesi', type: 'select', options: ['5K-25K', '25K-50K', '50K-100K', '100K-250K', '250K+'], required: true }
    ]
  }

  const currentQuestions = questions[userType as keyof typeof questions] || questions.entrepreneur

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    const requiredFields = currentQuestions.filter(q => q.required)
    const missingFields = requiredFields.filter(q => !formData[q.key as keyof typeof formData])
    
    if (missingFields.length > 0) {
      alert('Lütfen tüm zorunlu alanları doldurun!')
      return
    }

    setSaving(true)

    try {
      const userId = user?.id || 'user-' + Date.now()
      const result = await saveFormSubmission(userId, userType, formData)
      
      if (result.error) {
        alert('Form kaydedilirken hata oluştu: ' + result.error.message)
      } else {
        alert('Form başarıyla kaydedildi! 🎉')
        router.push(`/results?type=${userType}&submissionId=${result.data[0]?.id || 'temp'}`)
      }
    } catch (error) {
      alert('Beklenmeyen bir hata oluştu!')
    } finally {
      setSaving(false)
    }
  }

  const userTypeNames = {
    entrepreneur: 'Girişimci',
    investor: 'Yatırımcı', 
    angel: 'Melek Yatırımcı'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📋 {userTypeNames[userType as keyof typeof userTypeNames]} Formu
              </h1>
              <p className="text-gray-600 mt-2">Değerlendirme için gerekli bilgileri girin</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                👋 <strong>{user?.email}</strong>
              </span>
              <button
                onClick={async () => {
                  if (typeof window !== 'undefined') {
                    localStorage.clear()
                    sessionStorage.clear()
                  }
                  router.push('/')
                  setTimeout(() => window.location.reload(), 100)
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            {currentQuestions.map((question) => (
              <div key={question.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {question.label} {question.required && <span className="text-red-500">*</span>}
                </label>
                
                {question.type === 'text' ? (
                  <input
                    type="text"
                    value={formData[question.key as keyof typeof formData]}
                    onChange={(e) => handleInputChange(question.key, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={`${question.label} girin...`}
                  />
                ) : (
                  <select
                    value={formData[question.key as keyof typeof formData]}
                    onChange={(e) => handleInputChange(question.key, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Seçiniz...</option>
                    {question.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Kaydediliyor...
                </span>
              ) : (
                'Değerlendirmeyi Başlat 🚀'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
