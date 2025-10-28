import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// Mock next/router to provide query org_id
vi.mock('next/router', () => ({
  useRouter: () => ({ query: { org_id: 'org-123' } }),
}));

// Mock getSupabaseClient to return a fake client
vi.mock('../../lib/supabaseClient', () => ({
  getSupabaseClient: () => ({ /* fake client */ }),
}));

// Mock fetchPartnerAnalytics to return two rows
const fakeData = [
  { stage: 'seed', sector: 'fintech', composite_target: 1000, created_at: '2025-01-01T00:00:00Z' },
  { stage: 'pre-seed', sector: 'saas', composite_target: 2000, created_at: '2025-01-02T00:00:00Z' },
];
vi.mock('../../lib/partnerAnalytics', () => ({
  fetchPartnerAnalytics: () => Promise.resolve({ data: fakeData }),
}));

describe('Partner dashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table headers and rows when data present', async () => {
    const Page = (await import('../../../pages/partner/dashboard')).default;
    render(<Page />);

    expect(await screen.findByText(/Stage/)).toBeTruthy();
    expect(await screen.findByText(/Target \(USD\)/)).toBeTruthy();

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // there is header row + 2 data rows
      expect(rows.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('shows Org ID bulunamadı when org_id missing', async () => {
    // Re-mock router with no org_id
    vi.doMock('next/router', () => ({ useRouter: () => ({ query: {} }) }));
    const Page = (await import('../../../pages/partner/dashboard')).default;
    render(<Page />);

    expect(await screen.findByText(/Org ID bulunamadı/)).toBeTruthy();
  });

  it('shows staging offline message when supabase client is null', async () => {
    // Mock getSupabaseClient to return null
    vi.doMock('../../lib/supabaseClient', () => ({ getSupabaseClient: () => null }));
    // Ensure router returns org_id
    vi.doMock('next/router', () => ({ useRouter: () => ({ query: { org_id: 'org-123' } }) }));

    const Page = (await import('../../../pages/partner/dashboard')).default;
    render(<Page />);

    expect(await screen.findByText(/Veri alınamadı \(staging offline\)/)).toBeTruthy();
  });
});
