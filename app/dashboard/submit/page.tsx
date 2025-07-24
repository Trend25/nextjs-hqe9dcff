'use client';

import React from 'react';
import { useAuth } from '@/app/ClientAuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StartupSubmissionForm from '@/components/forms/StartupSubmissionForm';

export default function SubmitPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/auth/login';
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit Startup Data</h1>
          <p className="mt-2 text-gray-600">
            Share your startup's key metrics to get AI-powered stage analysis and personalized insights.
          </p>
        </div>
        <StartupSubmissionForm />
      </div>
    </DashboardLayout>
  );
}
