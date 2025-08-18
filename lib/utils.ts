import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// PARA BİRİMİ FORMATLAMA - TÜRKİYE İÇİN
export function formatCurrency(amount: number, currency: string = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
  }).format(amount);
}

// TARİH FORMATLAMA
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Bugün';
  } else if (diffDays === 1) {
    return 'Dün';
  } else if (diffDays < 7) {
    return `${diffDays} gün önce`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} hafta önce`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ay önce`;
  } else {
    return d.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

// STARTUP AŞAMA RENKLERİ
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

// GÜVEN SKORU RENKLERİ
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

// RUNWAY HESAPLAMA
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

// SAYI FORMATLAMA (1K, 1M gibi)
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

// BÜYÜME ORANI DURUMU
export function getGrowthRateStatus(rate: number): {
  label: string;
  color: string;
} {
  if (rate >= 20) {
    return { label: 'Mükemmel', color: 'text-green-600' };
  } else if (rate >= 10) {
    return { label: 'İyi', color: 'text-blue-600' };
  } else if (rate >= 5) {
    return { label: 'Orta', color: 'text-yellow-600' };
  } else if (rate > 0) {
    return { label: 'Yavaş', color: 'text-orange-600' };
  } else {
    return { label: 'Büyüme Yok', color: 'text-red-600' };
  }
}

// EMAIL DOĞRULAMA
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// URL SLUG OLUŞTURMA
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
