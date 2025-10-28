import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach } from 'vitest';

// Mock the supabase client getter and analytics helper before importing the page
vi.mock('../../lib/supabaseClient', () => ({
  getSupabaseClient: vi.fn(() => ({})),
}));

const mockSummary = {
  summary: {
    totalEvaluations: 42,
    topStages: [
      { stage: 'seed', count: 10 },
      { stage: 'idea', count: 5 },
    ],
    topOrgs: [
      { org_id: 'partner-1', count: 12 },
      { org_id: 'partner-2', count: 7 },
    ],
  },
  error: undefined,
};

const fetchAdminSummaryMock = vi.fn();

vi.mock('../../lib/adminAnalytics', () => ({
  fetchAdminSummary: (...args: any[]) => fetchAdminSummaryMock(...args),
}));

describe('Admin Dashboard page', () => {
  beforeEach(() => {
    fetchAdminSummaryMock.mockReset();
  });

  it('renders summary when data is available', async () => {
    fetchAdminSummaryMock.mockResolvedValueOnce(mockSummary);

    const { default: AdminDashboard } = await import('../../pages/admin/dashboard');

    render(React.createElement(AdminDashboard));

    // header
    expect(screen.getByText('Admin Dashboard')).toBeTruthy();

    // wait for async load
    await waitFor(() => {
      expect(screen.getByText('Toplam Değerlendirme')).toBeTruthy();
    });

    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('seed')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
    expect(screen.getByText('partner-1')).toBeTruthy();
  });

  it('shows staging offline when no client', async () => {
    fetchAdminSummaryMock.mockResolvedValueOnce({ summary: null, error: 'no_client' });

    const { default: AdminDashboard } = await import('../../pages/admin/dashboard');

    render(React.createElement(AdminDashboard));

    await waitFor(() => {
      expect(screen.getByText('Veri alınamadı (staging offline)')).toBeTruthy();
    });
  });
});
