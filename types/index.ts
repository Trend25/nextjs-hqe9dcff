// types/index.ts
import { User } from '@supabase/supabase-js';

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

// Startup Stage Types
export type StartupStage = 'pre-seed' | 'seed' | 'series-a' | 'growth';

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

// Stage Detection Types
export interface StageDetectionInput {
  companyName: string;
  industry: string;
  foundedYear: number;
  teamSize: number;
  monthlyRevenue: number;
  totalFunding: number;
  customerCount: number;
  growthRate: number;
}

export interface StageDetectionResult {
  detected_stage: StartupStage;
  confidence_score: number;
  stage_scores: {
    pre_seed: number;
    seed: number;
    series_a: number;
    growth: number;
  };
  reasons: string[];
  recommendations: string[];
}

// Analysis & Dashboard Types
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

export interface BenchmarkComparison {
  metric: string;
  userValue: number;
  your_value: number;
  industryAverage: number;
  stageAverage: number;
  benchmark: number;
  stage: string;
  percentile: number;
  status: 'above' | 'below' | 'average' | 'excellent';
}
