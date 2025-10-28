export type AnalyticsPayload = {
  org_id: string | null;
  stage: string;
  sector: string | null;
  composite_min: number;
  composite_target: number;
  composite_max: number;
  consent_flag: boolean;
};

/**
 * Record a simple, anonymous evaluation event into staging Supabase.
 * Behavior:
 *  - If consent_flag === false => do nothing and return {ok:false}
 *  - If supabase client is null/undefined => return {ok:false}
 *  - Otherwise attempt insert into table analytics_evaluations
 *  - On any error warn and return {ok:false}
 *  - Never throw
 *
 * TODO: Production behavior must respect RLS and use backend proxy/service-role keys.
 */
export async function recordEvaluationAnalytics(supabase: any, payload: AnalyticsPayload): Promise<{ ok: boolean }> {
  try {
    if (!payload || payload.consent_flag === false) {
      return { ok: false };
    }

    if (!supabase) {
      return { ok: false };
    }

    const table = 'analytics_evaluations';

    const row = {
      org_id: payload.org_id,
      stage: payload.stage,
      sector: payload.sector,
      composite_min: payload.composite_min,
      composite_target: payload.composite_target,
      composite_max: payload.composite_max,
      consent_flag: payload.consent_flag,
      created_at: new Date().toISOString(),
    };

    // NOTE: This is staging-only helper. TODO: Do not use in production with anon keys.
    const fromRes = await supabase.from(table).insert([row]);

    // supabase-js typically returns { data, error }
    if (fromRes && fromRes.error) {
      console.warn('analytics insert error', fromRes.error);
      return { ok: false };
    }

    return { ok: true };
  } catch (err: any) {
    // Never throw - analytics should be best-effort
    console.warn('analytics exception', err?.message || err);
    return { ok: false };
  }
}
