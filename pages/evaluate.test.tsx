import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock supabase client module
const saveDraftMock = vi.fn();
const loadDraftMock = vi.fn();

vi.mock('../lib/supabaseClient', () => ({
  saveDraftEvaluation: (...args: any[]) => saveDraftMock(...args),
  loadLastDraft: (...args: any[]) => loadDraftMock(...args),
}));

// Mock next/router
const pushMock = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({ push: pushMock }),
}));

import EvaluatePage from './evaluate';

describe('EvaluatePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('Step 1 Devam butonu disabled when stage not selected', () => {
    loadDraftMock.mockResolvedValue(null);
    render(<EvaluatePage />);

    const devamBtn = screen.getByText('Devam');
    expect(devamBtn).toBeDisabled();
  });

  test('Selecting idea -> step2 shows vcmethod disabled', async () => {
    loadDraftMock.mockResolvedValue(null);
    render(<EvaluatePage />);

    // select radio 'idea'
    const ideaRadio = screen.getByLabelText('idea') as HTMLInputElement;
    fireEvent.click(ideaRadio);

    const devamBtn = screen.getByText('Devam');
    fireEvent.click(devamBtn);

    // now in step 2
    await waitFor(() => {
      const vcCheckbox = screen.getByLabelText('vcmethod') as HTMLInputElement;
      expect(vcCheckbox).toBeDisabled();
    });
  });

  test('Cannot continue in step2 with less than 2 methods selected', async () => {
    loadDraftMock.mockResolvedValue(null);
    render(<EvaluatePage />);

    // choose stage mvp
    const mvpRadio = screen.getByLabelText('mvp') as HTMLInputElement;
    fireEvent.click(mvpRadio);
    fireEvent.click(screen.getByText('Devam'));

    // select only one method
    const berkus = screen.getByLabelText('berkus') as HTMLInputElement;
    fireEvent.click(berkus);

    const devamBtnStep2 = screen.getByText('Devam');
    expect(devamBtnStep2).toBeDisabled();

    // select second method
    const scorecard = screen.getByLabelText('scorecard') as HTMLInputElement;
    fireEvent.click(scorecard);

    expect(devamBtnStep2).not.toBeDisabled();
  });

  test('Saving draft calls saveDraftEvaluation', async () => {
    loadDraftMock.mockResolvedValue(null);
    saveDraftMock.mockResolvedValue({ status: 'ok' });

    render(<EvaluatePage />);

    // go to step1 -> select stage
    fireEvent.click(screen.getByLabelText('mvp'));
    fireEvent.click(screen.getByText('Devam'));

    // select two methods
    fireEvent.click(screen.getByLabelText('berkus'));
    fireEvent.click(screen.getByLabelText('scorecard'));
    fireEvent.click(screen.getByText('Devam'));

    // fill required form fields
    fireEvent.change(screen.getByLabelText('Startup İsmi'), { target: { value: 'TS Demo' } });
    fireEvent.change(screen.getByLabelText('Sektör'), { target: { value: 'SaaS' } });

    // click Taslağı Kaydet
    fireEvent.click(screen.getByText('Taslağı Kaydet'));

    await waitFor(() => {
      expect(saveDraftMock).toHaveBeenCalled();
    });
  });
});
