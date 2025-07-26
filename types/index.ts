// types/index.ts - KOMPLE ÇÖZÜM
import { User } from '@supabase/supabase-js';

// NAMING CONVENTION: snake_case (database ile tutarlı)

// Startup Stage Types - UPPERCASE (code'da kullanılan format)
export type StartupStage = 'PRE_SEED' | 'SEED' | 'SERIES_A' | 'GROWTH';

// Auth Context Type
export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isEmailVerified: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ data: any; error: null; } | { data: null; error: any; }>;
  refreshProfile: () => Promise<void>;
  logActivity: (activityType: string, activityData?: any) => Promise<void>;
}

// User Profile Type
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

// Startup Metrics
export interface StartupMetrics {
  revenue: number;
  teamSize: number;
  fundingRaised: number;
  growthRate: number;
  customerCount: number;
  monthlyActiveUsers?: number;
  burnRate?: number;
  runway?: number;
}

// Stage Analysis
export interface StageAnalysis {
  stage: StartupStage;
  confidence: number;
  metrics: StartupMetrics;
  recommendations: string[];
  benchmarks: {
    [key: string]: {
      min: number;
      max: number;
      average: number;
    };
  };
}

// Form Types
export interface StartupForm {
  companyName: string;
  industry: string;
  foundedYear: number;
  metrics: StartupMetrics;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StageAnalysisResponse extends ApiResponse<StageAnalysis> {}

// Benchmark Comparison - SADECE KULLANILAN FIELD'LAR
export interface BenchmarkComparison {
  stage: string;
  metric: string;
  your_value: number;
  benchmark: number;
  percentile: number;
  // Opsiyonel field'lar (başka yerlerde kullanılabilir)
  userValue?: number;
  industryAverage?: number;
  stageAverage?: number;
  status?: 'above' | 'below' | 'average' | 'excellent';
}

// Stage Analysis Result - KOMPLE TÜM FIELD'LAR
export interface StageAnalysisResult {
  id: string;
  user_id: string;
  detected_stage: StartupStage;
  confidence_score: number;
  stage_score: number;
  pre_seed_score: number;
  seed_score: number;
  series_a_score: number;
  growth_score: number;
  reasons: string[];
  next_milestones: string[];
  benchmark_comparison: BenchmarkComparison[];
  metrics: StartupMetrics;
  recommendations: string[];
  benchmarks: {
    [key: string]: {
      min: number;
      max: number;
      average: number;
    };
  };
  created_at: string;
  updated_at: string;
}

// Startup Submission - TÜM FIELD'LAR EKLENDI
export interface StartupSubmission {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  founded_year: number;
  team_size: number;
  founders_count: number;
  monthly_revenue: number;
  total_funding: number;
  growth_rate: number;
  monthly_growth_rate: number;
  customer_count: number;
  active_customers: number;
  burn_rate?: number;
  runway_months?: number;
  metrics: StartupMetrics;
  analysis_result?: StageAnalysisResult;
  created_at: string;
  updated_at: string;
}

// Stage Detection Input - TÜM FIELD'LAR EKLENDI
export interface StageDetectionInput {
  companyName: string;
  industry: string;
  foundedYear: number;
  teamSize: number;
  monthlyRevenue: number;
  totalFunding: number;
  customerCount: number;
  activeCustomers: number;
  growthRate: number;
  monthlyGrowthRate: number;
  hasLiveProduct: boolean;
  hasPaidCustomers: boolean;
  hasRecurringRevenue: boolean;
  hasScalableBusinessModel: boolean;
  isOperationallyProfitable: boolean;
  lifetimeValue: number;
  customerAcquisitionCost: number;
  marketSize: number;
}

// Stage Detection Result - TÜM FIELD'LAR + TUTARLI NAMING
export interface StageDetectionResult {
  detected_stage: StartupStage;
  confidence_score: number;
  stage_scores: {
    PRE_SEED: number;    // UPPERCASE (enum ile tutarlı)
    SEED: number;
    SERIES_A: number;
    GROWTH: number;
  };
  reasons: string[];
  recommendations: string[];
  benchmarkComparison: BenchmarkComparison[];
}

// Database Types
export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
