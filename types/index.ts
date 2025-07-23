// types/index.ts - Startup Rating Engine Type Definitions

/**
 * User Types
 */
 export type UserType = 'entrepreneur' | 'investor' | 'angel';

 export interface User {
   id: string;
   email: string;
   created_at: string;
   updated_at: string;
 }
 
 export interface UserProfile {
   id: string;
   email: string;
   full_name: string;
   user_type: UserType;
   company_name?: string;
   created_at: string;
   updated_at: string;
 }
 
 /**
  * Stage Detection Types
  */
 export type StartupStage = 'PRE_SEED' | 'SEED' | 'SERIES_A' | 'GROWTH';
 
 export interface StageDetectionInput {
   // Company Basics
   companyName: string;
   foundedYear: number;
   teamSize: number;
   
   // Financial Data
   monthlyRevenue: number;
   totalFunding: number;
   burnRate: number;
   runway: number; // months
   
   // Product & Market
   hasLiveProduct: boolean;
   activeCustomers: number;
   marketSize: number;
   
   // Growth Metrics
   monthlyGrowthRate: number; // percentage
   customerAcquisitionCost: number;
   lifetimeValue: number;
   
   // Stage Indicators
   hasPaidCustomers: boolean;
   hasRecurringRevenue: boolean;
   isOperationallyProfitable: boolean;
   hasScalableBusinessModel: boolean;
 }
 
 export interface StageDetectionResult {
   detectedStage: StartupStage;
   confidence: number; // 0-100
   stageScore: number; // 0-100
   reasons: string[];
   recommendations: string[];
   nextMilestones: string[];
   benchmarkComparison: BenchmarkComparison[];
 }
 
 export interface BenchmarkComparison {
   stage: StartupStage;
   metric: string;
   yourValue: number;
   benchmark: number;
   percentile: number;
 }
 
 /**
  * Form System Types
  */
 export interface Question {
   id: string;
   key: string;
   text: string;
   type: 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'range';
   required: boolean;
   userType?: UserType[];
   stage?: StartupStage[];
   category: string;
   weight: number;
   options?: SelectOption[];
   min?: number;
   max?: number;
   placeholder?: string;
   helpText?: string;
 }
 
 export interface SelectOption {
   value: string | number;
   label: string;
 }
 
 export interface FormResponse {
   questionId: string;
   value: any;
 }
 
 export interface FormSubmission {
   id: string;
   user_id: string;
   user_type: UserType;
   responses: Record<string, any>; // JSONB field
   score: number;
   detected_stage?: StartupStage;
   stage_confidence?: number;
   recommendations?: string[]; // JSONB array
   created_at: string;
   updated_at: string;
 }
 
 /**
  * Question Categories
  */
 export interface QuestionCategory {
   id: string;
   name: string;
   description: string;
   weight: number;
   userTypes: UserType[];
   stages: StartupStage[];
   questions: Question[];
 }
 
 /**
  * Scoring System
  */
 export interface ScoreWeights {
   [key: string]: number;
 }
 
 export interface StageWeights {
   PRE_SEED: ScoreWeights;
   SEED: ScoreWeights;
   SERIES_A: ScoreWeights;
   GROWTH: ScoreWeights;
 }
 
 /**
  * Comprehensive Question Sets by User Type
  */
 export interface QuestionSet {
   userType: UserType;
   stages: StartupStage[];
   categories: QuestionCategory[];
   totalQuestions: number;
   estimatedTime: number; // minutes
 }
 
 /**
  * Database Result Types
  */
 export interface DatabaseResponse<T = any> {
   data: T[] | T | null;
   error: any;
   count?: number;
 }
 
 export interface FormSubmissionWithProfile extends FormSubmission {
   user_profiles: UserProfile;
 }
 
 /**
  * API Response Types
  */
 export interface ApiResponse<T = any> {
   success: boolean;
   data?: T;
   message?: string;
   error?: string;
 }
 
 export interface PaginatedResponse<T = any> {
   data: T[];
   pagination: {
     page: number;
     limit: number;
     total: number;
     totalPages: number;
   };
 }
 
 /**
  * Authentication Context Types
  */
 export interface AuthContextType {
   user: User | null;
   profile: UserProfile | null;
   loading: boolean;
   signIn: (email: string, password: string) => Promise<any>;
   signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<any>;
   signOut: () => Promise<void>;
   updateProfile: (updates: Partial<UserProfile>) => Promise<any>;
 }
 
 /**
  * Form State Management
  */
 export interface FormState {
   currentStep: number;
   totalSteps: number;
   responses: Record<string, any>;
   isValid: boolean;
   errors: Record<string, string>;
   isSubmitting: boolean;
 }
 
 export interface FormActions {
   setResponse: (questionKey: string, value: any) => void;
   nextStep: () => void;
   prevStep: () => void;
   submitForm: () => Promise<void>;
   resetForm: () => void;
   validateStep: (step: number) => boolean;
 }
 
 /**
  * Utility Types
  */
 export type DeepPartial<T> = {
   [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
 };
 
 export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
 
 export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
 
 /**
  * Stage-Specific Question Types
  */
 export interface PreSeedQuestions extends StageDetectionInput {
   // Pre-Seed specific fields
   problemValidated: boolean;
   mvpCompleted: boolean;
   initialUserFeedback: boolean;
   coFoundersCount: number;
   technicalExpertise: number; // 1-5
   businessExpertise: number; // 1-5
 }
 
 export interface SeedQuestions extends PreSeedQuestions {
   // Seed specific fields
   productMarketFitSignals: boolean;
   revenueModel: 'subscription' | 'transactional' | 'freemium' | 'advertising' | 'other';
   customerRetentionRate: number;
   monthlyActiveUsers: number;
   conversionRate: number;
 }
 
 export interface SeriesAQuestions extends SeedQuestions {
   // Series A specific fields
   salesTeamSize: number;
   scalableAcquisitionChannels: string[];
   competitiveAdvantage: string;
   internationalExpansion: boolean;
   keyPartnerships: boolean;
 }
 
 export interface GrowthQuestions extends SeriesAQuestions {
   // Growth specific fields
   marketLeadershipPosition: number; // 1-10
   diversifiedRevenueStreams: number;
   operationalEfficiency: number;
   brandRecognition: number;
   talentAcquisition: boolean;
 }
 
 /**
  * Enhanced Analysis Results
  */
 export interface EnhancedAnalysisResult extends StageDetectionResult {
   competitorComparison?: CompetitorComparison[];
   growthTrajectory?: GrowthTrajectory;
   riskAssessment?: RiskAssessment;
   fundingRecommendations?: FundingRecommendation[];
 }
 
 export interface CompetitorComparison {
   metric: string;
   yourValue: number;
   competitorAverage: number;
   topPerformer: number;
   ranking: string;
 }
 
 export interface GrowthTrajectory {
   currentStage: StartupStage;
   nextStage: StartupStage;
   timeToNextStage: string;
   keyMetricsToImprove: string[];
   successProbability: number;
 }
 
 export interface RiskAssessment {
   level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
   factors: string[];
   mitigationStrategies: string[];
   score: number; // 0-100
 }
 
 export interface FundingRecommendation {
   stage: StartupStage;
   amount: string;
   timeline: string;
   requirements: string[];
   investors: string[];
 }
 
 /**
  * Export all types for easy importing
  */
 export type {
   // Re-export commonly used types
   StartupStage,
   UserProfile,
   StageDetectionInput,
   StageDetectionResult,
   FormSubmission,
   Question,
   QuestionCategory
 };
 
 /**
  * Constants
  */
 export const STARTUP_STAGES: Record<StartupStage, { name: string; description: string; color: string }> = {
   PRE_SEED: {
     name: 'Pre-Seed',
     description: 'İlk aşama: Fikir doğrulama ve MVP geliştirme',
     color: 'yellow'
   },
   SEED: {
     name: 'Seed',
     description: 'Büyüme aşaması: Ürün-pazar uyumu arayışı',
     color: 'blue'
   },
   SERIES_A: {
     name: 'Series A',
     description: 'Ölçeklendirme: Kanıtlanmış iş modeli büyütme',
     color: 'green'
   },
   GROWTH: {
     name: 'Growth+',
     description: 'Büyüme+: Pazar liderliği ve karlılık odaklı',
     color: 'purple'
   }
 };
 
 export const USER_TYPES: Record<UserType, { name: string; description: string; icon: string }> = {
   entrepreneur: {
     name: 'Girişimci',
     description: 'Startup kurucu ve girişimciler',
     icon: '🚀'
   },
   investor: {
     name: 'Yatırımcı',
     description: 'Profesyonel yatırım fonları',
     icon: '💰'
   },
   angel: {
     name: 'Melek Yatırımcı',
     description: 'Bireysel melek yatırımcılar',
     icon: '👼'
   }
 };
