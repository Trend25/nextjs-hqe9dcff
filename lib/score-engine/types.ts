// lib/score-engine/types.ts

// Uygulamanın desteklediği startup aşamaları
export type Stage = "idea" | "mvp" | "seed" | "growth";

// Desteklenen değerleme yöntemleri
export type ValuationMethod =
  | "berkus"
  | "scorecard"
  | "riskfactor"
  | "vcmethod"
  | "dcf";

// Score engine'e giren temel input
export interface BaseInput {
  stage: Stage;
  startupName: string;
  sector: string;
  mrr?: number;         // aylık tekrar eden gelir
  growthRate?: number;  // % cinsinden
  teamSize?: number;

  // v0.6 alanları
  runwayMonths?: number;
  profitMargin?: number;
}

// ----------------------
// Yöntem Config Tipleri
// ----------------------

export interface BerkusConfig {
  ideaMax: number;
  mvpMax: number;
  seedMax: number;
  growthMax: number;
}

export interface ScorecardConfig {
  basePreMoney: number;
}

export interface RiskFactorConfig {
  basePreMoney: number;
  perRiskStep: number;
}

export interface VCMethodConfig {
  targetReturnMultiple: number; // örn. 10x
  exitYear: number;             // örn. 5 yıl sonrası
}

export interface DCFConfig {
  discountRate: number;   // 0.15 = %15
  horizonYears: number;   // 5 yıl
  terminalGrowth: number; // 0.03 = %3
}

// Default parametre seti (index.ts'de kullanılan toplu config)
export interface MethodConfig {
  berkus: BerkusConfig;
  scorecard: ScorecardConfig;
  riskfactor: RiskFactorConfig;
  vcmethod: VCMethodConfig;
  dcf: DCFConfig;
}

// ----------------------
// Yöntem Sonuç Tipi
// ----------------------
export interface MethodResult {
  method: ValuationMethod;
  value: number;                           // TL / USD vs.
  breakdown?: Record<string, number>;      // alt kalemler
  notes?: string;                          // kullanıcıya açıklama
}

// ----------------------
// v0.7 Benchmark Katmanı
// ----------------------
export interface BenchmarkInfo {
  multiplier: number;    // sektör çarpanı (örn: 6x)
  sectorKey: string;     // normalize edilmiş sektör
  stage: Stage;          // hangi stage için kullanıldı
  label: string;         // kullanıcıya görünür kısa açıklama
}

// ----------------------
// Score Engine Çıktısı
// ----------------------
export interface EngineResult {
  input: BaseInput;
  methods: MethodResult[];
  compositeValue: number | null;
  currency?: string;
  benchmark?: BenchmarkInfo | null;  // v0.7 sektör benchmark sonucu
}

// Eski tip — hâlâ bazı dosyalarda kullanılıyor (compat)
export interface AggregateResult {
  input: BaseInput;
  methods: MethodResult[];
  compositeValue: number | null;
  currency?: string;
}
