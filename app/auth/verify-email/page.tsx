'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    // Email doğrulandıysa yönlendir
    setTimeout(() => {
      router.push(redirect);
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Email Doğrulanıyor...</h2>
        <p>Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}
