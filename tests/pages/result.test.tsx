import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const mockAggregate = vi.fn();
const mockBerkus = vi.fn();

vi.mock('../lib/engine', () => ({
  calcBerkus: (...args: any[]) => mockBerkus(...args),
  calcScorecard: () => ({ method: 'scorecard', value: 100 }),
  calcRiskFactor: () => ({ method: 'riskfactor', value: 200 }),
  calcVCMethod: () => ({ method: 'vcmethod', value: 300 }),
  calcDCF: () => ({ method: 'dcf', value: 400 }),
  aggregateValuation: (...args: any[]) => mockAggregate(...args),
}));

const pushMock = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({ query: { methods: 'berkus,scorecard' }, push: pushMock }),
}));

import ResultPage from './result';

describe('ResultPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders header and shows loading then composite', async () => {
    mockBerkus.mockReturnValue({ method: 'berkus', value: 123 });
    mockAggregate.mockReturnValue({ min: 100, target: 150, max: 200 });

    render(<ResultPage />);

    // basic presence checks without jest-dom matchers
    expect(screen.getByText('Değerleme Sonucu')).not.toBeNull();
    expect(screen.getByText('Hesaplanıyor...')).not.toBeNull();

    await waitFor(() => {
      const loading = screen.queryByText('Hesaplanıyor...');
      expect(loading).toBeNull();
    });

    expect(screen.getByText('Tahmini Değerleme Aralığı (USD)')).not.toBeNull();
    expect(screen.getByText(/Hedef: 150/)).not.toBeNull();

    const pdfBtn = screen.getByText('PDF indir (Premium)') as HTMLButtonElement;
    expect(pdfBtn.disabled).toBe(true);
  });
});
