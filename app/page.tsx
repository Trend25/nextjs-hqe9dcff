'use client'

import { useState } from 'react'

export default function Home() {
  const [selectedType, setSelectedType] = useState(null)

  const userTypes = [
    { id: 'entrepreneur', title: 'Girişimci', icon: '🚀' },
    { id: 'investor', title: 'Yatırımcı', icon: '💼' },
    { id: 'angel', title: 'Melek Yatırımcı', icon: '👼' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">🚀 MVP Rating Platform</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-4">Form Doldur</h3>
            <a 
              href="/form?type=entrepreneur"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-blue-700"
            >
              Form'a Git
            </a>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-4">AI Stage Detection</h3>
            <a 
              href="/stage-detection"
              className="bg-green-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-green-700"
            >
              🚀 Stage Analizi
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}