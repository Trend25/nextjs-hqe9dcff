import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the router
const pushMock = vi.fn();
const routerMock = {
  query: {
    stage: 'seed',
    methods: 'berkus,scorecard,vcmethod,dcf',
    premium: '1',
    startupName: 'TestCo',
    email: 'founder@test.co',
  },
  push: pushMock,
};

vi.mock('next/router', () => ({
  useRouter: () => routerMock,
}));

// Mock the engine functions
const mockBerkus = vi.fn().mockReturnValue({ method: 'berkus', value: 1000000 });
const mockScorecard = vi.fn().mockReturnValue({ method: 'scorecard', value: 2000000 });
const mockRiskFactor = vi.fn().mockReturnValue({ method: 'riskfactor', value: 1500000 });
const mockVCMethod = vi.fn().mockReturnValue({ method: 'vcmethod', value: 5000000 });
const mockDCF = vi.fn().mockReturnValue({ method: 'dcf', value: 800000 });
const mockAggregate = vi.fn().mockReturnValue({ min: 800000, target: 2000000, max: 5000000 });

vi.mock('../../lib/engine', () => ({
  calcBerkus: (...args: any[]) => mockBerkus(...args),
  calcScorecard: (...args: any[]) => mockScorecard(...args),
  calcRiskFactor: (...args: any[]) => mockRiskFactor(...args),
  calcVCMethod: (...args: any[]) => mockVCMethod(...args),
  calcDCF: (...args: any[]) => mockDCF(...args),
  aggregateValuation: (...args: any[]) => mockAggregate(...args),
}));

import ResultPage from '../../pages/result';

describe('ResultPage PDF access', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading then composite valuation', async () => {
    render(<ResultPage />);

    // Initial loading state
    expect(screen.getByText('Değerleme Sonucu')).toBeDefined();
    expect(screen.getByText('Hesaplanıyor...')).toBeDefined();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Hesaplanıyor...')).toBeNull();
    });

    // Composite valuation card should be visible
    expect(screen.getByText('Tahmini Değerleme Aralığı (USD)')).toBeDefined();
  });

  it('handles free user showing paywall', async () => {
    // Override router mock for free user
    routerMock.query.premium = '0';

    render(<ResultPage />);

    // Click PDF export button
    const pdfButton = screen.getByText('PDF indir');
    pdfButton.click();

    // Should show paywall
    await waitFor(() => {
      expect(screen.getByText('Upgrade to Premium (yakında)')).toBeDefined();
    });
  });
});