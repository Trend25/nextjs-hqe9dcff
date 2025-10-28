import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import PartnerDashboardPage from '../../../pages/partner/dashboard';
import * as authGate from '../../../lib/authGate';
import * as supabaseClient from '../../../lib/supabaseClient';
import * as partnerAnalytics from '../../../lib/partnerAnalytics';

// Mock useRouter
vi.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
  }),
}));

describe('Partner Dashboard Session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show access denied for guest users', () => {
    // Mock getMockSession to return guest role
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({ role: 'guest' });
    
    render(<PartnerDashboardPage />);
    
    expect(screen.getByText('Erişim reddedildi: sadece partner kullanıcılar için.')).toBeInTheDocument();
  });

  it('should show error when partner has no org_id', () => {
    // Mock getMockSession to return partner role without org_id
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({
      role: 'partner'
    });
    
    render(<PartnerDashboardPage />);
    
    expect(screen.getByText('Org ID bulunamadı')).toBeInTheDocument();
  });

  it('should show offline error when Supabase client is null', () => {
    // Mock getMockSession to return partner role with org_id
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({
      role: 'partner',
      org_id: 'partner-123'
    });

    // Mock getSupabaseClient to return null
    vi.spyOn(supabaseClient, 'getSupabaseClient').mockReturnValue(null);
    
    render(<PartnerDashboardPage />);
    
    expect(screen.getByText('Veri alınamadı (staging offline)')).toBeInTheDocument();
  });

  it('should show table with data when everything works', async () => {
    // Mock getMockSession to return partner role with org_id
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({
      role: 'partner',
      org_id: 'partner-123'
    });

    // Mock getSupabaseClient to return a fake client
    vi.spyOn(supabaseClient, 'getSupabaseClient').mockReturnValue({} as any);

    // Mock fetchPartnerAnalytics to return sample data
    vi.spyOn(partnerAnalytics, 'fetchPartnerAnalytics').mockResolvedValue({
      data: [
        { stage: 'Seed', sector: 'Tech', composite_target: 1000000, created_at: new Date().toISOString() },
        { stage: 'Series A', sector: 'Finance', composite_target: 5000000, created_at: new Date().toISOString() }
      ]
    });
    
    render(<PartnerDashboardPage />);

    // Check table headers and some data are rendered
    expect(await screen.findByText('Stage')).toBeInTheDocument();
    expect(await screen.findByText('Target (USD)')).toBeInTheDocument();
    expect(await screen.findByText('Seed')).toBeInTheDocument();
    expect(await screen.findByText('Series A')).toBeInTheDocument();
  });
});