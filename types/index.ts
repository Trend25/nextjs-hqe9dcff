// types/index.ts - BUILD HATALARINDAN ANALİZ EDİLMİŞ MÜKEMMEL VERSİYON
import { User } from '@supabase/supabase-js';

// Startup Stage Types - UPPERCASE (kodda kullanılan format)
export type StartupStage = 'PRE_SEED' | 'SEED' | 'SERIES_A' | 'GROWTH';

// Auth Context Type - İhtiyaç listesinden
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

// User Profile Type - Database ile uyumlu
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company_name?: string; // ← BU SATIRI EKLEYİN!
  role: string;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

// Startup Metrics - Genel kullanım
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

// Stage Analysis - Genel
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

// Benchmark Comparison - Her iki dosyayla uyumlu (flexible)
export interface BenchmarkComparison {
  // Stage detection için gerekli fields (camelCase/mixed)
  stage?: string;
  metric: string;
  benchmark?: number;
  percentile?: number;
  
  // Dashboard analyses için gerekli fields (snake_case)
  your_value?: number;
  userValue?: number;
  industryAverage?: number;
  stageAverage?: number;
  status?: 'above' | 'below' | 'average' | 'excellent';
}

// Stage Analysis Result - Dashboard analyses için (snake_case)
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

// Startup Submission - Dashboard analyses için (snake_case)
export interface StartupSubmission {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  founded_year: number;
   description?: string;
  team_size: number;
  founders_count: number;
  key_hires?: number;
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
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

// Stage Detection Input - TAMAMEN FLEXIBLE (form'a uygun)
export interface StageDetectionInput {
  // Zorunlu minimal field'lar
  companyName: string;
  
  // Tüm diğer field'lar opsiyonel
  industry?: string;
  foundedYear?: number;
  teamSize?: number;
  monthlyRevenue?: number;
  totalFunding?: number;
  burnRate?: number;
  runway?: number;
  customerCount?: number;          // ← EKSİK OLANLAR
  growthRate?: number;             // ← EKSİK OLANLAR
  activeCustomers?: number;
  monthlyGrowthRate?: number;
  
  // Boolean field'lar (tümü opsiyonel)
  hasLiveProduct?: boolean;
  hasPaidCustomers?: boolean;
  hasRecurringRevenue?: boolean;
  hasScalableBusinessModel?: boolean;
  isOperationallyProfitable?: boolean;
  productMarketFit?: boolean;
  hasIntellectualProperty?: boolean;
  
  // Gelişmiş metrikler (tümü opsiyonel)
  lifetimeValue?: number;
  customerAcquisitionCost?: number;
  marketSize?: number;
  revenue?: number;
  annualRevenue?: number;
  monthlyUsers?: number;
  competitiveAdvantage?: string;
  fundingGoal?: number;
  
  // Form'da olabilecek tüm field'lar
  description?: string;
  website?: string;
  location?: string;
  employees?: number;
  valuation?: number;
  stage?: string;
  
  // Herhangi bir field için flexibility
  [key: string]: any;
}

// Stage Detection Result - Stage detection için (camelCase, son hatadan analiz)
export interface StageDetectionResult {
  detectedStage: StartupStage;
  confidence: number;
  stageScore: number;
  reasons: string[];
  recommendations: string[];
  nextMilestones: string[];
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
