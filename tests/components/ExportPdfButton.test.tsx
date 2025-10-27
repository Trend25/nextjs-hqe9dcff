import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ExportPdfButton from '../../components/ExportPdfButton';

describe('ExportPdfButton', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls window.print for premium user', () => {
    const mockPrint = vi.fn();
    window.print = mockPrint;

    render(<ExportPdfButton isPremium={true} />);
    
    const pdfButton = screen.getByText('PDF indir');
    fireEvent.click(pdfButton);

    expect(mockPrint).toHaveBeenCalled();
  });

  it('shows paywall for free user', () => {
    render(<ExportPdfButton isPremium={false} />);
    
    const pdfButton = screen.getByText('PDF indir');
    fireEvent.click(pdfButton);

    expect(screen.getByText('Upgrade to Premium (yakında)')).toBeDefined();
  });

  it('closes paywall when clicking close button', () => {
    render(<ExportPdfButton isPremium={false} />);
    
    // Open paywall
    const pdfButton = screen.getByText('PDF indir');
    fireEvent.click(pdfButton);
    
    // Click close button
    const closeButton = screen.getByText('Kapat');
    fireEvent.click(closeButton);

    // Paywall should be closed
    expect(screen.queryByText('Upgrade to Premium (yakında)')).toBeNull();
  });
});