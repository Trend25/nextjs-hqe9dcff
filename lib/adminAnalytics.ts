// lib/adminAnalytics.ts
// Helper to summarize analytics_evaluations for staging admin dashboard.
// NOTE: This is for staging/preview only. Do NOT expose production secrets.
// TODO: Production ortamında bu fonksiyon public client ile çağrılmamalı; backend route + RLS zorunlu.
// TODO: Abuse / spam takibi burada raporlanacak ama şu an sadece TODO.

export type AdminSummary = {
  totalEvaluations: number;
  topStages: Array<{ stage: string; count: number }>;
  topOrgs: Array<{ org_id: string; count: number }>;
};

export async function fetchAdminSummary(
  supabase: any
): Promise<{ summary: AdminSummary | null; error?: string }> {
  try {
    if (!supabase) {
      return { summary: null, error: 'no_client' };
    }

    const resp = await supabase
      .from('analytics_evaluations')
      .select('org_id, stage');

    // supabase-js returns { data, error }
    const data = resp.data ?? resp;
    const error = resp.error ?? (resp && resp.status ? null : null);

    if (!data || resp.error) {
      console.warn('fetchAdminSummary: query failed', resp.error ?? resp);
      return { summary: null, error: 'query_failed' };
    }

    // rows: Array<{ org_id: string | null; stage: string | null }>
    const rows: Array<{ org_id: string | null; stage: string | null }> = data;

    const totalEvaluations = rows.length;

    // Count stages
    const stageCounts: Record<string, number> = {};
    const orgCounts: Record<string, number> = {};

    for (const r of rows) {
      const stageKey = r.stage ?? 'unknown';
      stageCounts[stageKey] = (stageCounts[stageKey] || 0) + 1;

      const orgKey = r.org_id ?? 'unknown';
      orgCounts[orgKey] = (orgCounts[orgKey] || 0) + 1;
    }

    const topStages = Object.keys(stageCounts)
      .map((s) => ({ stage: s, count: stageCounts[s] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topOrgs = Object.keys(orgCounts)
      .map((o) => ({ org_id: o, count: orgCounts[o] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const summary: AdminSummary = {
      totalEvaluations,
      topStages,
      topOrgs,
    };

    return { summary };
  } catch (err) {
    console.warn('fetchAdminSummary: unexpected error', err);
    return { summary: null, error: 'query_failed' };
  }
}
