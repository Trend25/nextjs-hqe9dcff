// lib/database.ts - Database operations

interface FormSubmission {
  id: string;
  user_id: string;
  user_type: string;
  responses: any;
  score?: number;
  created_at: string;
}

// Mock database - gerçekte Supabase kullanılacak
let mockDatabase: FormSubmission[] = [];

export async function saveFormSubmission(userId: string, userType: string, formData: any) {
  try {
    const submission: FormSubmission = {
      id: 'submission_' + Date.now(),
      user_id: userId,
      user_type: userType,
      responses: formData,
      score: calculateMockScore(formData),
      created_at: new Date().toISOString()
    };

    mockDatabase.push(submission);
    
    // localStorage'a kaydet
    localStorage.setItem('form_submissions', JSON.stringify(mockDatabase));

    return {
      data: [submission],
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: { message: 'Kaydetme hatası' }
    };
  }
}

export async function getFormSubmissions(userId: string) {
  try {
    // localStorage'dan yükle
    const stored = localStorage.getItem('form_submissions');
    if (stored) {
      mockDatabase = JSON.parse(stored);
    }

    const userSubmissions = mockDatabase.filter(s => s.user_id === userId);
    
    return {
      data: userSubmissions,
      error: null
    };
  } catch (error) {
    return {
      data: [],
      error: { message: 'Veri okuma hatası' }
    };
  }
}

export async function getSubmissionById(id: string) {
  try {
    const stored = localStorage.getItem('form_submissions');
    if (stored) {
      mockDatabase = JSON.parse(stored);
    }

    const submission = mockDatabase.find(s => s.id === id);
    
    return {
      data: submission || null,
      error: submission ? null : { message: 'Submission bulunamadı' }
    };
  } catch (error) {
    return {
      data: null,
      error: { message: 'Veri okuma hatası' }
    };
  }
}

function calculateMockScore(formData: any): number {
  // Basit scoring logic
  let score = 50; // Base score
  
  if (formData.companyName) score += 10;
  if (formData.industry) score += 10;
  if (formData.stage === 'Büyüme' || formData.stage === 'MVP') score += 15;
  if (formData.revenue && formData.revenue !== '0') score += 15;
  
  return Math.min(score, 100);
}