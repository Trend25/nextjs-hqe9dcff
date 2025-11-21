// lib/score-engine/benchmarks.ts

import { BenchmarkInfo } from "./types";

/**
 * Basit sektör benchmark tablosu
 * Gerçek dünyada, Supabase tablosundan (sector_benchmarks) okunacak.
 */
export const SECTOR_BENCHMARKS: Record<
  string,
  { [stage: string]: BenchmarkInfo }
> = {
  saas: {
    seed: {
      sectorKey: "saas",
      stage: "seed",
      multiplier: 3.2,
      label: "SaaS seed ortalaması (3.2x MRR)"
    },
    growth: {
      sectorKey: "saas",
      stage: "growth",
      multiplier: 5.5,
      label: "SaaS growth benchmark (5.5x MRR)"
    }
  },

  ecommerce: {
    seed: {
      sectorKey: "ecommerce",
      stage: "seed",
      multiplier: 1.8,
      label: "E-ticaret seed benchmark (1.8x GMV)"
    },
    growth: {
      sectorKey: "ecommerce",
      stage: "growth",
      multiplier: 3.1,
      label: "E-ticaret growth benchmark (3.1x GMV)"
    }
  }
};

/**
 * Yardımcı fonksiyon — sektör + stage için benchmark döner
 */
export function getSectorBenchmark(
  sector: string,
  stage: string
): BenchmarkInfo | null {
  const sKey = sector.toLowerCase();

  if (!SECTOR_BENCHMARKS[sKey]) return null;
  if (!SECTOR_BENCHMARKS[sKey][stage]) return null;

  return SECTOR_BENCHMARKS[sKey][stage];
}
