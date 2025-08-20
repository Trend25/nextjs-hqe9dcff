'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token and type from URL params
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || !type) {
          setStatus('error');
          setMessage('Invalid verification link');
          return;
        }

        // Verify the email with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        });

        if (error) {
          setStatus('error');
          setMessage(error.message || 'Verification failed');
          return;
        }

        if (data.user) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting...');
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Verification failed');
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };

    verifyEmail();
  }, [searchParams, supabase.auth, router]);

  const getIcon = () => {
    if (status === 'verifying') {
      return (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      );
    }
    if (status === 'success') {
      return (
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    return (
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  };

  const getTextColor = () => {
    return status === 'error' ? 'text-red-600' : 'text-gray-600';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          {getIcon()}
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {status === 'verifying' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h2>
          <p className={`mt-2 ${getTextColor()}`}>
            {message}
          </p>
          
          {status === 'error' && (
            <div className="mt-6">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
            </div>
          )}
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
