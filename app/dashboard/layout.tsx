// app/dashboard/layout.tsx
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
  const { user, loading } = useAuth();
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

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800">
              🚀 RateMyStartup
            </h2>
            <p className="text-sm text-gray-500 mt-1">Dashboard</p>
          </div>
          
          <nav className="mt-6">
            <Link 
              href="/dashboard" 
              className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span className="flex items-center">
                <span className="mr-3">📊</span>
                Overview
              </span>
            </Link>
            
            <Link 
              href="/dashboard/analyses" 
              className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span className="flex items-center">
                <span className="mr-3">📈</span>
                Analyses
              </span>
            </Link>
            
            <Link 
              href="/dashboard/submit" 
              className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span className="flex items-center">
                <span className="mr-3">➕</span>
                Submit Startup
              </span>
            </Link>
            
            <Link 
              href="/dashboard/profile" 
              className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span className="flex items-center">
                <span className="mr-3">👤</span>
                Profile
              </span>
            </Link>
          </nav>
          
          <div className="absolute bottom-0 w-64 p-6 border-t">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Logged in as:</p>
              <p className="text-sm font-medium text-gray-700 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
