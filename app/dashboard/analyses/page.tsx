
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/ClientAuthProvider';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          </div>
          
          <nav className="mt-6">
            <Link href="/dashboard" className="block px-6 py-3 text-gray-700 hover:bg-gray-100">
              Overview
            </Link>
            <Link href="/dashboard/analyses" className="block px-6 py-3 text-gray-700 hover:bg-gray-100">
              Analyses
            </Link>
            <Link href="/dashboard/submit" className="block px-6 py-3 text-gray-700 hover:bg-gray-100">
              Submit
            </Link>
            <Link href="/dashboard/profile" className="block px-6 py-3 text-gray-700 hover:bg-gray-100">
              Profile
            </Link>
          </nav>
          
          <div className="absolute bottom-0 w-64 p-6">
            <button
              onClick={() => signOut()}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// ============================================
// 2. DOSYA: app/dashboard/page.tsx
// ============================================
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

// ============================================
// 3. DOSYA: app/dashboard/analyses/page.tsx
// ============================================
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
