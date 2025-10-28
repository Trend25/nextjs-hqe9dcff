import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAdminSummary } from './adminAnalytics';

describe('fetchAdminSummary', () => {
  let warnSpy: any;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns no_client when supabase is null', async () => {
    const res = await fetchAdminSummary(null as any);
    expect(res.error).toBe('no_client');
    expect(res.summary).toBeNull();
  });

  it('calculates summary from rows', async () => {
    const rows = [
      { org_id: 'partner-1', stage: 'seed' },
      { org_id: 'partner-1', stage: 'seed' },
      { org_id: 'partner-2', stage: 'idea' },
      { org_id: null, stage: 'seed' },
    ];

    const supabaseMock = {
      from: vi.fn(() => ({ select: vi.fn(async () => ({ data: rows, error: null })) })),
    } as any;

    const res = await fetchAdminSummary(supabaseMock);

    expect(res.error).toBeUndefined();
    expect(res.summary).not.toBeNull();
    const summary = res.summary!;
    expect(summary.totalEvaluations).toBe(4);
    expect(summary.topStages[0].stage).toBe('seed');
    expect(summary.topStages[0].count).toBe(3);
    expect(summary.topOrgs[0].org_id).toBe('partner-1');
    expect(summary.topOrgs[0].count).toBe(2);
  });

  it('handles query failure gracefully', async () => {
    const supabaseMock = {
      from: vi.fn(() => ({ select: vi.fn(async () => ({ data: null, error: { message: 'boom' } })) })),
    } as any;

    const res = await fetchAdminSummary(supabaseMock);

    expect(warnSpy).toHaveBeenCalled();
    expect(res.error).toBe('query_failed');
    expect(res.summary).toBeNull();
  });
});
