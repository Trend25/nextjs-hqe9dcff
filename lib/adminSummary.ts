export type AdminSummary = {
  totalEvaluations: number;
  topStages: Array<{ stage: string; count: number }>;
  topOrgs: Array<{ org_id: string; count: number }>;
};

export async function buildAdminSummary(rows: any[]): Promise<AdminSummary> {
  try {
    // Default güvenli değerler
    const defaultSummary: AdminSummary = {
      totalEvaluations: 0,
      topStages: [],
      topOrgs: []
    };

    // Boş liste kontrolü
    if (!Array.isArray(rows) || rows.length === 0) {
      return defaultSummary;
    }

    // Toplam değerlendirme sayısı
    const totalEvaluations = rows.length;

    // Stage'lere göre gruplama
    const stageGroups = new Map<string, number>();
    rows.forEach(row => {
      if (row.stage) {
        const stage = String(row.stage);
        stageGroups.set(stage, (stageGroups.get(stage) || 0) + 1);
      }
    });

    // Stage'leri sıralama
    const topStages = Array.from(stageGroups.entries())
      .map(([stage, count]) => ({ stage, count }))
      .sort((a, b) => b.count - a.count);

    // Organizasyonlara göre gruplama (null/undefined hariç)
    const orgGroups = new Map<string, number>();
    rows.forEach(row => {
      if (row.org_id) {
        const orgId = String(row.org_id);
        orgGroups.set(orgId, (orgGroups.get(orgId) || 0) + 1);
      }
    });

    // Organizasyonları sıralama
    const topOrgs = Array.from(orgGroups.entries())
      .map(([org_id, count]) => ({ org_id, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalEvaluations,
      topStages,
      topOrgs
    };
  } catch (error) {
    // TODO: production ortamında abuse/ratelimit sinyalleri buraya eklenecek
    // TODO: admin role validation API route tarafında yapılacak (auth zorunlu)
    console.warn('Error in buildAdminSummary:', error);
    return {
      totalEvaluations: 0,
      topStages: [],
      topOrgs: []
    };
  }
}