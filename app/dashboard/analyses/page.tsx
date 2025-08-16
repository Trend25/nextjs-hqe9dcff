'use client';

import React from 'react';
import Link from 'next/link';

export default function AnalysesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Analyses</h1>
        <p className="mt-2 text-gray-600">
          View all your startup stage analyses
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📊</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No analyses yet
        </h3>
        <p className="text-gray-600 mb-6">
          Submit your first startup data to get started.
        </p>
        <Link href="/dashboard/submit">
          <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
            Create Your First Analysis
          </button>
        </Link>
      </div>
    </div>
  );
}
