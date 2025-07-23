// types/index.ts - Single source of truth for all types

// Auth Types
export interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

// User Types
export type UserType = 'entrepreneur' | 'investor' | 'advisor';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  type: UserType;
  created_at: string;
}

// Startup Stage Types
export type StartupStage = 'PRE_SEED' | 'SEED' | 'SERIES_A' | 'GROWTH';

export interface StageDetectionInput {
  companyName: string;
  foundedYear: number;
  teamSize: number;
  monthlyRevenue: number;
  totalFunding: number;
  burnRate: number;
  runway: number;
  hasLiveProduct: boolean;
  activeCustomers: number;
  marketSize: number;
  monthlyGrowthRate: number;
  customerAcquisitionCost: number;
  lifetimeValue: number;
  hasPaidCustomers: boolean;
  hasRecurringRevenue: boolean;
  isOperationallyProfitable: boolean;
  hasScalableBusinessModel: boolean;
}

export interface StageDetectionResult {
  detectedStage: StartupStage;
  confidence: number;
  stageScore: number;
  reasons: string[];
  recommendations: string[];
  nextMilestones: string[];
  benchmarkComparison: {
    stage: StartupStage;
    metric: string;
    yourValue: number;
    benchmark: number;
    percentile: number;
  }[];
}

// Form Types  
export interface FormSubmission {
  id: string;
  companyName: string;
  email: string;
  submittedAt: string;
  userType: UserType;
}
