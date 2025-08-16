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
