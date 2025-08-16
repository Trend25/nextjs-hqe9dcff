'use client';

import React from 'react';
import { useAuth } from '@/app/ClientAuthProvider';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to Dashboard! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Logged in as: {user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Analyses</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Recent Activity</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Pending</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to analyze?</h2>
        <p className="text-gray-600 mb-4">
          Submit your startup data for AI-powered stage analysis.
        </p>
        <Link href="/dashboard/submit">
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Submit Startup →
          </button>
        </Link>
      </div>
    </div>
  );
}
