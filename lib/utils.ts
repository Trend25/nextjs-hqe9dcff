import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | null | undefined, currency = 'USD'): string {
  if (value === null || value === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStartupStageColor(stage: string): string {
  const colors = {
    PRE_SEED: 'bg-purple-100 text-purple-800 border-purple-200',
    SEED: 'bg-blue-100 text-blue-800 border-blue-200',
    SERIES_A: 'bg-green-100 text-green-800 border-green-200',
    GROWTH: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getConfidenceScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}
