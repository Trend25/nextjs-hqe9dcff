'use client';

import { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get redirect URL from params or default to dashboard
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    // Automatically redirect after 1 second
    const timer = setTimeout(() => {
      console.log('Redirecting to:', redirectTo);
      
      // Use window.location for guaranteed navigation
      if (redirectTo.startsWith('/')) {
        window.location.href = redirectTo;
      } else {
        window.location.href = '/dashboard';
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Email Verified!
          </h2>
          <p className="mt-2 text-gray-600">
            Email verified successfully! Redirecting...
          </p>
          <div className="mt-4">
            <div className="animate-pulse text-sm text-gray-500">
              Taking you to dashboard...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
