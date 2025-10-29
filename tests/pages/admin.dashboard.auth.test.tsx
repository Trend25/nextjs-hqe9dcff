import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AdminDashboard from '../../../pages/admin/dashboard';
import * as supabaseClient from '../../../lib/supabaseClient';
import * as authGate from '../../../lib/authGate';

// Mock useRouter (boş çünkü admin sayfasında router kullanılmıyor)
vi.mock('next/router', () => ({
  useRouter: () => ({}),
}));

describe('AdminDashboard Auth', () => {
  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
  });

  it('should show access denied for guest users', () => {
    // Mock getMockSession to return guest role
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({ role: 'guest' });
    
    render(<AdminDashboard />);
    
    expect(screen.getByText('Erişim reddedildi: sadece admin kullanıcılar için.')).toBeInTheDocument();
  });

  it('should show admin content when user is admin', async () => {
    // Mock getMockSession to return admin role
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({ role: 'admin' });

    // Mock getSupabaseClient
    vi.spyOn(supabaseClient, 'getSupabaseClient').mockReturnValue({} as any);
    
    render(<AdminDashboard />);
    
    // Ana başlıkları kontrol et
    expect(screen.getByText('Toplam Değerlendirme')).toBeInTheDocument();
    expect(screen.getByText('En aktif organizasyonlar')).toBeInTheDocument();
  });

  it('should show access denied for partner users', () => {
    // Mock getMockSession to return partner role
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({ 
      role: 'partner',
      org_id: 'partner-123'
    });
    
    render(<AdminDashboard />);
    
    expect(screen.getByText('Erişim reddedildi: sadece admin kullanıcılar için.')).toBeInTheDocument();
  });

  it('should show error when staging is offline', () => {
    // Mock getMockSession to return admin role
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({ role: 'admin' });

    // Mock getSupabaseClient to return null (offline)
    vi.spyOn(supabaseClient, 'getSupabaseClient').mockReturnValue(null);
    
    render(<AdminDashboard />);
    
    expect(screen.getByText('Veri alınamadı (staging offline)')).toBeInTheDocument();
  });
});