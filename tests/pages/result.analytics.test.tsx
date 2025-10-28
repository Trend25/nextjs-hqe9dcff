import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    query: {
      stage: 'seed',
      sector: 'fintech',
      methods: 'berkus,scorecard,vcmethod',
      premium: '1',
      consent: '1',
      org_id: 'partner-123',
    },
  }),
}));

// Mock engine functions
vi.mock('../../lib/engine', () => ({
  calcBerkus: () => ({ method: 'berkus', value: 1000000 }),
  calcScorecard: () => ({ method: 'scorecard', value: 2000000 }),
  calcRiskFactor: () => ({ method: 'riskfactor', value: 1500000 }),
  calcVCMethod: () => ({ method: 'vcmethod', value: 5000000 }),
  calcDCF: () => ({ method: 'dcf', value: 800000 }),
  aggregateValuation: () => ({ min: 800000, target: 2000000, max: 5000000 }),
}));

// Mock supabase client and analytics helper
const mockRecord = vi.fn().mockResolvedValue({ ok: true });
vi.mock('../../lib/analytics', () => ({
  recordEvaluationAnalytics: (...args: any[]) => mockRecord(...args),
}));

describe('Result page analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders result and calls analytics with expected payload when consent=1', async () => {
    const ResultPage = (await import('../../../pages/result')).default;

    render(<ResultPage />);

    expect(await screen.findByText(/Değerleme Sonucu/)).toBeTruthy();

    await waitFor(() => {
      expect(mockRecord).toHaveBeenCalled();
    });

    const calledWith = mockRecord.mock.calls[0][1];
    expect(calledWith).toMatchObject({
      org_id: 'partner-123',
      stage: 'seed',
      sector: 'fintech',
      composite_min: 800000,
      composite_target: 2000000,
      composite_max: 5000000,
      consent_flag: true,
    });

    // analytics debug text appears after recording
    expect(await screen.findByText(/analytics recorded \(staging\)/)).toBeTruthy();
  });

  it('calls analytics with consent_flag false when consent missing or 0', async () => {
    // override router mock to have no consent
    vi.mocked(require('next/router') as any, true);

    // Re-mock router for this test with consent=0
    vi.doMock('next/router', () => ({
      useRouter: () => ({
        query: {
          stage: 'seed',
          sector: 'fintech',
          methods: 'berkus,scorecard,vcmethod',
          premium: '1',
          // consent omitted -> treated as false
          org_id: 'partner-123',
        },
      }),
    }));

    // Need to re-import the page module fresh
    const ResultPage = (await import('../../../pages/result')).default;

    render(<ResultPage />);

    await waitFor(() => {
      expect(mockRecord).toHaveBeenCalled();
    });

    const calledWith = mockRecord.mock.calls[0][1];
    expect(calledWith.consent_flag).toBe(false);
  });
});
