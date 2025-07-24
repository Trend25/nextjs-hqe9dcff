'use client';

import React from 'react';
import { useAuth } from '@/app/ClientAuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProfileForm from '@/components/dashboard/ProfileForm';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account information and preferences
          </p>
        </div>
        <ProfileForm />
      </div>
    </DashboardLayout>
  );
}
