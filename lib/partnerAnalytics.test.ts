import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fetchPartnerAnalytics } from './partnerAnalytics';

describe('fetchPartnerAnalytics', () => {
  let consoleWarnSpy: any;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns missing_org_id when org_id is empty', async () => {
    const mockClient = { from: vi.fn() };
    const res = await fetchPartnerAnalytics(mockClient as any, '');
    expect(res.error).toBe('missing_org_id');
    expect(res.data).toEqual([]);
  });

  it('returns no_client when supabase client is null', async () => {
    const res = await fetchPartnerAnalytics(null as any, 'org-123');
    expect(res.error).toBe('no_client');
    expect(res.data).toEqual([]);
  });

  it('returns data array on successful fetch', async () => {
    const data = [
      { stage: 'seed', sector: 'fintech', composite_target: 1000, created_at: '2025-01-01T00:00:00Z' },
      { stage: 'pre-seed', sector: 'saas', composite_target: 2000, created_at: '2025-01-02T00:00:00Z' },
    ];

    const orderMock = vi.fn().mockResolvedValue({ data, error: null });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    const eqMock = vi.fn().mockReturnValue({ select: selectMock });
    const fromMock = vi.fn().mockReturnValue({ eq: eqMock });

    const supabaseMock = { from: fromMock };

    const res = await fetchPartnerAnalytics(supabaseMock as any, 'org-123');

    expect(fromMock).toHaveBeenCalledWith('analytics_evaluations');
    expect(eqMock).toHaveBeenCalledWith('org_id', 'org-123');
    expect(selectMock).toHaveBeenCalledWith('stage,sector,composite_target,created_at');
    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });

    expect(res.data.length).toBe(2);
    expect(res.error).toBeUndefined();
  });

  it('logs and returns empty data when supabase returns error', async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    const eqMock = vi.fn().mockReturnValue({ select: selectMock });
    const fromMock = vi.fn().mockReturnValue({ eq: eqMock });
    const supabaseMock = { from: fromMock };

    const res = await fetchPartnerAnalytics(supabaseMock as any, 'org-123');
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(res.data).toEqual([]);
    expect(res.error).toBe('boom');
  });
});
