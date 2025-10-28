import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { recordEvaluationAnalytics, type AnalyticsPayload } from './analytics';

describe('recordEvaluationAnalytics', () => {
  let consoleWarnSpy: any;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns ok:false when consent_flag is false and does not call supabase', async () => {
    const supabaseMock = { from: vi.fn() };
    const payload: AnalyticsPayload = {
      org_id: null,
      stage: 'seed',
      sector: 'fintech',
      composite_min: 1,
      composite_target: 2,
      composite_max: 3,
      consent_flag: false,
    };

    const res = await recordEvaluationAnalytics(supabaseMock as any, payload);
    expect(res).toEqual({ ok: false });
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it('returns ok:false when supabase client is null', async () => {
    const payload: AnalyticsPayload = {
      org_id: null,
      stage: 'seed',
      sector: 'fintech',
      composite_min: 1,
      composite_target: 2,
      composite_max: 3,
      consent_flag: true,
    };

    const res = await recordEvaluationAnalytics(null as any, payload);
    expect(res).toEqual({ ok: false });
  });

  it('inserts into correct table and returns ok:true on success', async () => {
    const insertMock = vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
    const supabaseMock = { from: fromMock };

    const payload: AnalyticsPayload = {
      org_id: 'partner-1',
      stage: 'seed',
      sector: 'fintech',
      composite_min: 800000,
      composite_target: 2000000,
      composite_max: 5000000,
      consent_flag: true,
    };

    const res = await recordEvaluationAnalytics(supabaseMock as any, payload);
    expect(res).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith('analytics_evaluations');
    expect(insertMock).toHaveBeenCalled();
    const inserted = insertMock.mock.calls[0][0];
    // insert called with array of rows
    expect(Array.isArray(inserted)).toBe(true);
    expect(inserted[0]).toEqual(expect.objectContaining({
      org_id: 'partner-1',
      stage: 'seed',
      sector: 'fintech',
      composite_min: 800000,
      composite_target: 2000000,
      composite_max: 5000000,
      consent_flag: true,
    }));
  });

  it('logs warning and returns ok:false when insert errors', async () => {
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
    const supabaseMock = { from: fromMock };

    const payload: AnalyticsPayload = {
      org_id: 'partner-1',
      stage: 'seed',
      sector: 'fintech',
      composite_min: 1,
      composite_target: 2,
      composite_max: 3,
      consent_flag: true,
    };

    const res = await recordEvaluationAnalytics(supabaseMock as any, payload);
    expect(res).toEqual({ ok: false });
    expect(consoleWarnSpy).toHaveBeenCalled();
  });
});
