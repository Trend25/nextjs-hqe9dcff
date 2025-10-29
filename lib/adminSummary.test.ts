import { describe, it, expect } from 'vitest';
import { buildAdminSummary } from './adminSummary';

describe('buildAdminSummary', () => {
  it('should handle empty rows', async () => {
    const summary = await buildAdminSummary([]);
    expect(summary.totalEvaluations).toBe(0);
    expect(summary.topStages).toEqual([]);
    expect(summary.topOrgs).toEqual([]);
  });

  it('should correctly aggregate normal rows', async () => {
    const rows = [
      { org_id: "orgA", stage: "seed" },
      { org_id: "orgA", stage: "seed" },
      { org_id: "orgB", stage: "idea" }
    ];

    const summary = await buildAdminSummary(rows);

    expect(summary.totalEvaluations).toBe(3);
    expect(summary.topStages[0]).toEqual({ stage: "seed", count: 2 });
    expect(summary.topOrgs[0]).toEqual({ org_id: "orgA", count: 2 });
  });

  it('should exclude null/undefined org_ids from topOrgs', async () => {
    const rows = [
      { org_id: "orgA", stage: "seed" },
      { org_id: null, stage: "idea" },
      { org_id: undefined, stage: "idea" },
      { stage: "idea" } // org_id yok
    ];

    const summary = await buildAdminSummary(rows);

    expect(summary.totalEvaluations).toBe(4); // tüm kayıtlar sayılır
    expect(summary.topOrgs).toHaveLength(1); // sadece orgA
    expect(summary.topOrgs[0]).toEqual({ org_id: "orgA", count: 1 });
  });

  it('should handle invalid input gracefully', async () => {
    // @ts-ignore - bilinçli olarak hatalı input veriyoruz
    const summary = await buildAdminSummary(null);
    
    expect(summary.totalEvaluations).toBe(0);
    expect(summary.topStages).toEqual([]);
    expect(summary.topOrgs).toEqual([]);
  });

  it('should sort stages and orgs by count in descending order', async () => {
    const rows = [
      { org_id: "orgA", stage: "seed" },
      { org_id: "orgB", stage: "idea" },
      { org_id: "orgB", stage: "idea" },
      { org_id: "orgA", stage: "seed" },
      { org_id: "orgC", stage: "growth" }
    ];

    const summary = await buildAdminSummary(rows);

    // stages: seed=2, idea=2, growth=1
    expect(summary.topStages).toEqual([
      { stage: "seed", count: 2 },
      { stage: "idea", count: 2 },
      { stage: "growth", count: 1 }
    ]);

    // orgs: orgA=2, orgB=2, orgC=1
    expect(summary.topOrgs).toEqual([
      { org_id: "orgB", count: 2 },
      { org_id: "orgA", count: 2 },
      { org_id: "orgC", count: 1 }
    ]);
  });
});