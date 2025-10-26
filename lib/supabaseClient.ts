// Mock Supabase client helper for local/dev usage only.
// IMPORTANT: Do NOT import or use production Supabase keys here.
// This file intentionally returns mock responses and logs actions.

export type DraftEvaluation = {
  stage: string;
  methods: string[];
  formData: {
    startupName: string;
    sector: string;
    mrr: string;
    growthRate: string;
    teamSize: string;
  };
};

// TODO: staging Supabase insert to evaluations (RLS will apply in prod)
// TODO: if consent_flag === false do NOT write to analytics
export async function saveDraftEvaluation(payload: any): Promise<{ status: string }> {
  // In real code: insert into `evaluations` table with RLS and org/user scoping.
  // TODO: org_id bilgisini kullanıcı oturumundan bağla
  console.log('[mock supabase] saveDraftEvaluation payload:', JSON.stringify(payload, null, 2));

  // Simulate async latency
  await new Promise((r) => setTimeout(r, 50));

  // Return a mock success response
  return { status: 'ok' };
}

// TODO: fetch latest draft from Supabase for this user/org
export async function loadLastDraft(): Promise<DraftEvaluation | null> {
  // Return a fake draft for local development/demo purposes
  await new Promise((r) => setTimeout(r, 30));

  return {
    stage: 'mvp',
    methods: ['berkus', 'scorecard'],
    formData: {
      startupName: 'Demo Startup',
      sector: 'SaaS',
      mrr: '1200',
      growthRate: '15',
      teamSize: '4',
    },
  };
}

export default { saveDraftEvaluation, loadLastDraft };
