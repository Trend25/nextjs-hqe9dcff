import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// FORMAT FONKSİYONLARI - BUNLAR OLMADAN BUILD HATA VERİR!
export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

export function getStartupStageColor(stage: string): string {
  const stageColors: Record<string, string> = {
    'pre_seed': 'bg-purple-100 text-purple-800',
    'pre-seed': 'bg-purple-100 text-purple-800',
    'seed': 'bg-blue-100 text-blue-800',
    'series_a': 'bg-green-100 text-green-800',
    'series_b': 'bg-yellow-100 text-yellow-800',
    'series_c': 'bg-orange-100 text-orange-800',
    'growth': 'bg-red-100 text-red-800',
    'ipo': 'bg-indigo-100 text-indigo-800',
  };

  return stageColors[stage?.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

export function getConfidenceScoreColor(score: number): string {
  if (score >= 80) {
    return 'text-green-600';
  } else if (score >= 60) {
    return 'text-yellow-600';
  } else if (score >= 40) {
    return 'text-orange-600';
  } else {
    return 'text-red-600';
  }
}

export function calculateRunway(
  totalFunding: number, 
  monthlyRevenue: number, 
  burnRate: number
): { months: number; status: 'critical' | 'warning' | 'healthy' | 'unlimited' } {
  if (burnRate === 0) {
    return { months: Infinity, status: 'unlimited' };
  }
  
  const netBurn = burnRate - monthlyRevenue;
  
  if (netBurn <= 0) {
    return { months: Infinity, status: 'unlimited' };
  }
  
  const runwayMonths = Math.floor(totalFunding / netBurn);
  
  let status: 'critical' | 'warning' | 'healthy' | 'unlimited';
  if (runwayMonths < 3) {
    status = 'critical';
  } else if (runwayMonths < 6) {
    status = 'warning';
  } else {
    status = 'healthy';
  }
  
  return { months: runwayMonths, status };
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function getGrowthRateStatus(rate: number): {
  label: string;
  color: string;
} {
  if (rate >= 20) {
    return { label: 'Excellent', color: 'text-green-600' };
  } else if (rate >= 10) {
    return { label: 'Good', color: 'text-blue-600' };
  } else if (rate >= 5) {
    return { label: 'Moderate', color: 'text-yellow-600' };
  } else if (rate > 0) {
    return { label: 'Slow', color: 'text-orange-600' };
  } else {
    return { label: 'No Growth', color: 'text-red-600' };
  }
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
