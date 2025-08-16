// components/dashboard/DashboardLayout.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/ClientAuthProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth(); // userProfile'ı kaldırdık
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: '📊' },
    { name: 'Analyses', href: '/dashboard/analyses', icon: '📈' },
    { name: 'Submit', href: '/dashboard/submit', icon: '➕' },
    { name: 'Profile', href: '/dashboard/profile', icon: '👤' },
  ];

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
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-6 py-3 transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
          
          <div className="absolute bottom-0 w-64 p-6 border-t">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Logged in as:</p>
              <p className="text-sm font-medium text-gray-700 truncate">
                {user?.email || 'Loading...'}
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
