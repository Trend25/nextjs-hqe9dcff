import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseClient } from "../../../lib/supabaseClient";
import { buildAdminSummary, type AdminSummary } from "../../../lib/adminSummary";
import { getMockSession } from "../../../lib/authGate";

// Response types
type SuccessResponse = {
  summary: AdminSummary;
  warning?: string;
};

type ErrorResponse = {
  error: string;
};

// TODO: production ortamında bu endpoint kapalı olacak, sadece staging'de.
// TODO: production ortamında service role key KULLANILMAYACAK.
// TODO: gerçek admin auth zorunlu olacak.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  // Sadece GET methodunu kabul et
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method not allowed" });
  }

  // Mock session kontrol
  const session = getMockSession();
  if (session.role !== "admin") {
    return res.status(403).json({ error: "forbidden" });
  }

  // Supabase client kontrol
  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.status(200).json({
      summary: { totalEvaluations: 0, topStages: [], topOrgs: [] },
      warning: "staging offline"
    });
  }

  try {
    // analytics_evaluations tablosundan veri çek
    const { data: rows, error } = await supabase
      .from('analytics_evaluations')
      .select('org_id, stage');

    if (error) {
      console.warn('Error fetching analytics_evaluations:', error);
      return res.status(200).json({
        summary: { totalEvaluations: 0, topStages: [], topOrgs: [] },
        warning: "staging offline"
      });
    }

    // Özet hesapla ve dön
    const summary = await buildAdminSummary(rows || []);
    return res.status(200).json({ summary });

  } catch (error) {
    console.warn('Unexpected error in /api/admin/summary:', error);
    return res.status(200).json({
      summary: { totalEvaluations: 0, topStages: [], topOrgs: [] },
      warning: "staging offline"
    });
  }
}