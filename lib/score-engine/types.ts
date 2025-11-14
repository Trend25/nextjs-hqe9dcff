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
  //yeni alanlar
  runwayMonths?: number;
  profitMargin?: number; //%cinsinden

}

// Her yönteme ait konfigürasyon tipleri
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

// VC Method: UAT’te kullandığımız config ile birebir uyumlu
export interface VCMethodConfig {
  targetReturnMultiple: number; // örn. 10x
  exitYear: number;             // örn. 5 yıl sonrası
}

export interface DCFConfig {
  discountRate: number;   // 0.15 = %15
  horizonYears: number;   // 5 yıl
  terminalGrowth: number; // 0.03 = %3
}

// Toplu config tipi (defaultConfig ile birebir aynı shape)
export interface MethodConfig {
  berkus: BerkusConfig;
  scorecard: ScorecardConfig;
  riskfactor: RiskFactorConfig;
  vcmethod: VCMethodConfig;
  dcf: DCFConfig;
}

// Tek bir yöntemin sonucunu temsil eden tip
export interface MethodResult {
  method: ValuationMethod;
  value: number;                           // TL / USD vs. (şu an birim sabit değil)
  breakdown?: Record<string, number>;      // alt kalemler (opsiyonel)
  notes?: string;                          // kullanıcıya gösterilecek açıklama
}
export interface EngineResult {
  input: BaseInput;
  methods: MethodResult[];
  compositeValue: number | null;
  currency?: string;
}

// Score engine’in toplam çıktısı
export interface AggregateResult {
  input: BaseInput;
  methods: MethodResult[];
  compositeValue: number | null;
  currency?: string;
}
