import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import PartnerDashboardPage from '../../../pages/partner/dashboard';
import * as supabaseClient from '../../../lib/supabaseClient';
import * as authGate from '../../../lib/authGate';

// Mock useRouter
vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { org_id: 'partner-123' },
  }),
}));

describe('PartnerDashboardPage Auth', () => {
  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
  });

  it('should show access denied for guest users', () => {
    // Mock getMockSession to return guest role
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({ role: 'guest' });
    
    render(<PartnerDashboardPage />);
    
    expect(screen.getByText('Erişim reddedildi: sadece partner kullanıcılar için.')).toBeInTheDocument();
  });

  it('should show table headers for partner users', async () => {
    // Mock getMockSession to return partner role
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({ 
      role: 'partner',
      org_id: 'partner-123'
    });

    // Mock getSupabaseClient
    vi.spyOn(supabaseClient, 'getSupabaseClient').mockReturnValue({} as any);
    
    render(<PartnerDashboardPage />);
    
    expect(screen.getByText('Stage')).toBeInTheDocument();
    expect(screen.getByText('Target (USD)')).toBeInTheDocument();
  });

  it('should show error when Supabase is offline', () => {
    // Mock getMockSession to return partner role
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({ 
      role: 'partner',
      org_id: 'partner-123'
    });

    // Mock getSupabaseClient to return null (offline)
    vi.spyOn(supabaseClient, 'getSupabaseClient').mockReturnValue(null);
    
    render(<PartnerDashboardPage />);
    
    expect(screen.getByText('Veri alınamadı (staging offline)')).toBeInTheDocument();
  });
});