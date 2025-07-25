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
