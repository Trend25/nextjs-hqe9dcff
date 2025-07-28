'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/app/ClientAuthProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AnalysisCard from '@/components/dashboard/AnalysisCard';
import { StageAnalysisResult, StartupSubmission } from '@/types';

// Loading component for suspense fallback
function AnalysesLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// useSearchParams kullanan asıl content component
function AnalysesContent() {
  const [analyses, setAnalyses] = useState<(StageAnalysisResult & { submission?: StartupSubmission })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const newSubmission = searchParams.get('new_submission');
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      
      // Fetch analyses with related submission data
      const { data: analysesData, error: analysesError } = await supabase
        .from('stage_analysis_results')
        .select(`
          *,
          startup_submissions:submission_id (
            id,
            company_name,
            industry,
            monthly_revenue,
            total_funding,
            team_size
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (analysesError) throw analysesError;

      // Transform the data to match our expected structure
      const transformedData = (analysesData || []).map(analysis => ({
        ...analysis,
        submission: analysis.startup_submissions
      }));

      setAnalyses(transformedData);
    } catch (err: any) {
      console.error('Error fetching analyses:', err);
      setError('Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stage Analyses</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review your startup's stage progression and AI-powered insights
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href="/dashboard/submit">
              <Button>Submit New Data</Button>
            </Link>
          </div>
        </div>

        {/* New Submission Alert */}
        {newSubmission && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">
              🎉 Your startup data has been submitted successfully! 
              {analyses.length === 0 && " Your AI analysis will appear here once processing is complete."}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {analyses.length === 0 && !loading && (
          <Card className="border-2 border-dashed border-gray-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <CardTitle>No Stage Analyses Yet</CardTitle>
              <CardDescription>
                Submit your startup data to get AI-powered stage analysis and personalized insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/dashboard/submit">
                <Button size="lg">Submit Your First Data →</Button>
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                Our AI will analyze your metrics and determine if you're Pre-Seed, Seed, Series A, or Growth stage.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Analyses List */}
        {analyses.length > 0 && (
          <div className="space-y-6">
            <div className="grid gap-6">
              {analyses.map((analysis) => (
                <AnalysisCard 
                  key={analysis.id} 
                  analysis={analysis}
                  submission={analysis.submission}
                />
              ))}
            </div>

            {/* Load More (if pagination needed) */}
            {analyses.length >= 10 && (
              <div className="text-center">
                <Button variant="outline">Load More Analyses</Button>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {analyses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{analyses.length}</div>
                  <div className="text-xs text-gray-500">Total Analyses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyses[0]?.detected_stage.replace('_', '-') || '—'}
                  </div>
                  <div className="text-xs text-gray-500">Current Stage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analyses[0]?.confidence_score || 0}%
                  </div>
                  <div className="text-xs text-gray-500">Latest Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(analyses.reduce((acc, a) => acc + (a.confidence_score || 0), 0) / analyses.length) || 0}%
                  </div>
                  <div className="text-xs text-gray-500">Avg Confidence</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

// Ana page component - Suspense boundary ile
export default function AnalysesPage() {
  return (
    <Suspense fallback={<AnalysesLoading />}>
      <AnalysesContent />
    </Suspense>
  );
}
