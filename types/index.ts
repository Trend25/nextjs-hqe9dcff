// types/index.ts - Full Implementation Types

// Authentication Types
export interface User {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  role: 'entrepreneur' | 'investor' | 'advisor';
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Startup Data Types
export interface StartupSubmission {
  id?: string;
  user_id?: string;
  
  // Company Information
  company_name: string;
  founded_year?: number;
  industry?: string;
  description?: string;
  
  // Team Metrics
  team_size?: number;
  founders_count?: number;
  key_hires?: number;
  
  // Financial Metrics
  monthly_revenue?: number;
  total_funding?: number;
  burn_rate?: number;
  runway?: number; // months
  
  // Product Metrics
  has_live_product?: boolean;
  active_customers?: number;
  monthly_growth_rate?: number; // percentage
  customer_acquisition_cost?: number;
  lifetime_value?: number;
  
  // Business Model
  has_paid_customers?: boolean;
  has_recurring_revenue?: boolean;
  is_operationally_profitable?: boolean;
  has_scalable_business_model?: boolean;
  
  // Market
  market_size?: number;
  target_market?: string;
  
  // Status
  is_draft?: boolean;
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Analysis Types
export type StartupStage = 'PRE_SEED' | 'SEED' | 'SERIES_A' | 'GROWTH';

export interface StageAnalysisResult {
  id?: string;
  user_id?: string;
  submission_id?: string;
  
  detected_stage: StartupStage;
  confidence_score: number; // 0-100
  stage_score: number; // 0-100
  
  reasons: string[];
  recommendations: string[];
  next_milestones: string[];
  
  benchmark_comparison: BenchmarkComparison[];
  
  // Score breakdown
  pre_seed_score?: number;
  seed_score?: number;
  series_a_score?: number;
  growth_score?: number;
  
  created_at?: string;
}

export interface BenchmarkComparison {
  stage: StartupStage;
  metric: string;
  your_value: number;
  benchmark: number;
  percentile: number;
  status: 'above' | 'below' | 'at' | 'excellent' | 'poor';
}

// User Activity Types
export interface UserActivity {
  id?: string;
  user_id?: string;
  activity_type: 'login' | 'submission' | 'analysis' | 'export' | 'profile_update';
  activity_data?: any;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

// Feedback Types
export interface UserFeedback {
  id?: string;
  user_id?: string;
  analysis_id?: string;
  accuracy_rating?: number; // 1-10
  usefulness_rating?: number; // 1-10
  feedback_text?: string;
  would_recommend?: boolean;
  created_at?: string;
}

// Form Types
export interface FormStepData {
  step: number;
  title: string;
  fields: FormField[];
  isCompleted: boolean;
  validationRules?: ValidationRule[];
}

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'email' | 'select' | 'checkbox' | 'textarea' | 'currency';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'min' | 'max' | 'email' | 'custom';
  value?: any;
  message: string;
}

// Dashboard Types
export interface DashboardData {
  user_profile: UserProfile;
  recent_submissions: StartupSubmission[];
  recent_analyses: StageAnalysisResult[];
  stats: DashboardStats;
  activity_timeline: UserActivity[];
}

export interface DashboardStats {
  total_submissions: number;
  total_analyses: number;
  latest_stage?: StartupStage;
  stage_progression?: StageProgression[];
  avg_confidence_score?: number;
}

export interface StageProgression {
  stage: StartupStage;
  date: string;
  confidence_score: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Component Props Types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
  redirectTo?: string;
}

export interface FormStepProps {
  data: StartupSubmission;
  onChange: (data: Partial<StartupSubmission>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface AnalysisCardProps {
  result: StageAnalysisResult;
  submission: StartupSubmission;
  onExport?: () => void;
  onFeedback?: () => void;
  showActions?: boolean;
}

// Export all commonly used types
export type {
  User,
  UserProfile,
  AuthContextType,
  StartupSubmission,
  StartupStage,
  StageAnalysisResult,
  BenchmarkComparison,
  UserActivity,
  UserFeedback,
  FormStepData,
  FormField,
  DashboardData,
  DashboardStats,
  ApiResponse,
  PaginatedResponse,
  LoadingState,
  ErrorState,
  NotificationState
};
