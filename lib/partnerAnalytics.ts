// Helper to fetch partner-specific analytics from staging Supabase
// TODO: Production’da RLS aktif olacak, backend route üzerinden proxy'lenecek.
export async function fetchPartnerAnalytics(
  supabase: any,
  org_id: string
): Promise<{ data: any[]; error?: string }> {
  try {
    if (!org_id) {
      return { data: [], error: 'missing_org_id' };
    }

    if (!supabase) {
      return { data: [], error: 'no_client' };
    }

    const table = 'analytics_evaluations';

    // build chain: from(...).eq(...).select(...).order(...)
    // select columns: stage, sector, composite_target, created_at
    const res = await supabase
      .from(table)
      .eq('org_id', org_id)
      .select('stage,sector,composite_target,created_at')
      .order('created_at', { ascending: false });

    if (res && res.error) {
      console.warn('fetchPartnerAnalytics error', res.error);
      return { data: [], error: res.error?.message || 'fetch_error' };
    }

    return { data: res.data || [], error: undefined };
  } catch (err: any) {
    console.warn('fetchPartnerAnalytics exception', err?.message || err);
    return { data: [], error: 'exception' };
  }
}
