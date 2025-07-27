'use client';

import React from 'react';

interface SafeComponentProps {
  children: React.ReactNode;
  fallback?: string;
}

export function SafeComponent({ children, fallback = "Loading..." }: SafeComponentProps) {
  const [error, setError] = React.useState<string | null>(null);

  if (error) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">⚠️ {fallback}</p>
        <button 
          onClick={() => setError(null)}
          className="mt-2 text-sm text-yellow-600 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  try {
    return <>{children}</>;
  } catch (err) {
    setError(err instanceof Error ? err.message : "Something went wrong");
    return null;
  }
}
