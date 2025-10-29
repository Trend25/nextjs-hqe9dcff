import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AdminDashboard from '../../../pages/admin/dashboard';
import * as authGate from '../../../lib/authGate';

// Mock useRouter (boş çünkü admin sayfasında router kullanılmıyor)
vi.mock('next/router', () => ({
  useRouter: () => ({}),
}));

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Admin Dashboard Proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should block guest users without calling API', async () => {
    // Mock getMockSession to return guest role
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({ role: 'guest' });
    
    render(<AdminDashboard />);

    // Error message should be shown
    expect(screen.getByText('Erişim reddedildi: sadece admin kullanıcılar için.')).toBeInTheDocument();
    
    // fetch should not be called
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should show forbidden message when API returns 403', async () => {
    // Mock getMockSession to return admin role
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({ role: 'admin' });

    // Mock fetch to return 403
    mockFetch.mockResolvedValueOnce({
      status: 403,
      json: async () => ({ error: 'forbidden' })
    });

    render(<AdminDashboard />);

    // Wait for and check error message
    const errorMessage = await screen.findByText('Erişim reddedildi: sadece admin kullanıcılar için.');
    expect(errorMessage).toBeInTheDocument();

    // Check that fetch was called correctly
    expect(mockFetch).toHaveBeenCalledWith('/api/admin/summary');
  });

  it('should show offline warning when API returns offline status', async () => {
    // Mock getMockSession to return admin role
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({ role: 'admin' });

    // Mock fetch to return staging offline warning
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        summary: { totalEvaluations: 0, topStages: [], topOrgs: [] },
        warning: 'staging offline'
      })
    });

    render(<AdminDashboard />);

    // Wait for and check offline message
    const offlineMessage = await screen.findByText('Veri alınamadı (staging offline)');
    expect(offlineMessage).toBeInTheDocument();
  });

  it('should display admin summary data when API returns success', async () => {
    // Mock getMockSession to return admin role
    vi.spyOn(authGate, 'getMockSession').mockReturnValue({ role: 'admin' });

    // Mock fetch to return sample data
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        summary: {
          totalEvaluations: 5,
          topStages: [{ stage: 'seed', count: 3 }],
          topOrgs: [{ org_id: 'orgA', count: 3 }]
        }
      })
    });

    render(<AdminDashboard />);

    // Check for content elements
    expect(await screen.findByText('Toplam Değerlendirme')).toBeInTheDocument();
    expect(await screen.findByText('seed')).toBeInTheDocument();
    expect(await screen.findByText('orgA')).toBeInTheDocument();
  });
});