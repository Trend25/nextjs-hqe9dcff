'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate, getStartupStageColor, getConfidenceScoreColor } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

interface StartupSubmission {
  id: string;
  company_name: string;
  industry: string;
  team_size: number;
  monthly_revenue: number;
  created_at: string;
  is_draft: boolean;
  submitted_at?: string;
}

interface StageAnalysisResult {
  id: string;
  submission_id: string;
  detected_stage: string;
  confidence_score: number;
  analysis_summary: string;
  created_at: string;
}

function AnalysesContent() {
  const searchParams = useSearchParams();
  const newSubmissionId = searchParams.get('new_submission');
  
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<StartupSubmission[]>([]);
  const [analyses, setAnalyses] = useState<StageAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const supabase = createClientComponentClient();

  useEffect(() => {
    getUser();
    
    if (newSubmissionId) {
      setSuccessMessage('Your submission has been received! Analysis will be available shortly.');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [newSubmissionId]);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      fetchData(user.id);
    }
  };

  const fetchData = async (userId: string) => {
    try {
      setLoading(true);

      const { data: submissionsData, error: submissionsError } = await supabase
        .from('startup_submissions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      const { data: analysesData, error: analysesError } = await supabase
        .from('stage_analysis_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (analysesError) throw analysesError;

      setSubmissions(submissionsData || []);
      setAnalyses(analysesData || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Startup Analyses</h1>
        <p className="mt-1 text-sm text-gray-500">
          View all your startup submissions and AI-powered stage analyses
        </p>
      </div>

      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
        
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No submissions yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Submit your startup data to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {submissions.map((submission) => {
              const analysis = analyses.find(a => a.submission_id === submission.id);
              
              return (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{submission.company_name}</CardTitle>
                        <CardDescription>
                          {submission.industry} • {submission.team_size} team members
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Submitted {formatDate(submission.submitted_at || submission.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Monthly Revenue: <span className="font-medium">${submission.monthly_revenue?.toLocaleString() || '0'}</span>
                        </p>
                      </div>
                      
                      {analysis ? (
                        <div className="flex items-center space-x-4">
                          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStartupStageColor(analysis.detected_stage)}`}>
                            {analysis.detected_stage.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-semibold ${getConfidenceScoreColor(analysis.confidence_score)}`}>
                              {analysis.confidence_score}%
                            </p>
                            <p className="text-xs text-gray-500">confidence</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-500">Analysis pending...</span>
                        </div>
                      )}
                    </div>
                    
                    {analysis?.analysis_summary && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{analysis.analysis_summary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalysesPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <AnalysesContent />
    </Suspense>
  );
}
