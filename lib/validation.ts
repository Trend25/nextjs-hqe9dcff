// lib/validation.ts
import { z } from "zod";

export const resultQuerySchema = z.object({
  stage: z.enum(["idea", "mvp", "seed", "growth"] as const, {
    errorMap: () => ({ message: "Geçersiz aşama" }),
  }),
  methods: z
    .string()
    .transform((s) =>
      s
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
    )
    .refine((arr) => arr.length >= 2, {
      message: "En az iki yöntem seçilmelidir",
    }),
  startupName: z.string().min(1, "Startup ismi gerekli"),
  sector: z.string().min(1, "Sektör gerekli"),

  mrr: z.coerce
    .number()
    .nonnegative({ message: "MRR 0 veya üstü olmalıdır" })
    .finite(),

  growthRate: z.coerce
    .number()
    .min(0, "Büyüme >= 0")
    .max(200, "Büyüme <= 200"),

  teamSize: z.coerce
    .number()
    .int("Takım kişi sayısı tam sayı olmalı")
    .min(1, "Takım en az 1 kişi")
    .max(5000, "Takım 5000'i aşamaz"),

  // 🔹 Yeni alanlar – opsiyonel
  runwayMonths: z
    .coerce
    .number()
    .min(0, "Runway 0 veya üstü olmalıdır")
    .max(60, "Runway 60 aydan büyük olamaz")
    .optional(),

  profitMargin: z
    .coerce
    .number()
    .min(-100, "Kârlılık -100%'den küçük olamaz")
    .max(100, "Kârlılık 100%'den büyük olamaz")
    .optional(),
});

export type ResultQuery = z.infer<typeof resultQuerySchema>;

export function parseResultQuery(
  q: Partial<Record<string, string | string[]>>,
): { ok: true; data: ResultQuery } | { ok: false; errors: string[] } {
  const pick = (k: string) => {
    const v = q[k];
    if (Array.isArray(v)) return v[0];
    // boş string veya undefined → undefined dön (optional alanlar için)
    if (v === undefined || v === "") return undefined;
    return v;
  };

  const candidate = {
    stage: pick("stage"),
    methods: pick("methods") ?? "",
    startupName: pick("startupName") ?? "",
    sector: pick("sector") ?? "",
    mrr: pick("mrr") ?? "",
    growthRate: pick("growthRate") ?? "",
    teamSize: pick("teamSize") ?? "",
    runwayMonths: pick("runwayMonths"),
    profitMargin: pick("profitMargin"),
  };

  const res = resultQuerySchema.safeParse(candidate);
  if (res.success) return { ok: true, data: res.data };
  const errors = res.error.issues.map((i) => i.message);
  return { ok: false, errors };
}
