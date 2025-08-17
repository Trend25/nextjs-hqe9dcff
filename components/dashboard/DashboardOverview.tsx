'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatDate, getStartupStageColor, getConfidenceScoreColor } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

// Type definitions
interface StartupSubmission {
  id: string;
  company_name: string;
  created_at: string;
  is_draft: boolean;
  user_id: string;
}

interface StageAnalysisResult {
  id: string;
  detected_stage: string;
  confidence_score: number;
  created_at: string;
  user_id: string;
}

export default function DashboardOverview() {
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<StartupSubmission[]>([]);
  const [analyses, setAnalyses] = useState<StageAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const supabase = createClientComponentClient();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      fetchDashboardData(user.id);
    } else {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (userId: string) => {
    try {
      setLoading(true);

      // Fetch recent submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('startup_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (submissionsError) throw submissionsError;

      // Fetch recent analyses
      const { data: analysesData, error: analysesError } = await supabase
        .from('stage_analysis_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (analysesError) throw analysesError;

      setSubmissions(submissionsData || []);
      setAnalyses(analysesData || []);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasSubmissions = submissions.length > 0;
  const hasAnalyses = analyses.length > 0;
  const latestAnalysis = hasAnalyses ? analyses[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your startup's growth journey and stage progression
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/dashboard/submit">
            <Button>Submit New Data</Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Welcome Message for New Users */}
      {!hasSubmissions && (
        <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-blue-900">Welcome to StartupStage! 🚀</CardTitle>
            <CardDescription className="text-blue-700">
              Ready to discover your startup's true stage? Let's get started with your first submission.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-sm text-blue-600">
                Our AI will analyze your startup metrics and determine whether you're in:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  Pre-Seed
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Seed
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Series A
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                  Growth
                </span>
              </div>
              <Link href="/dashboard/submit">
                <Button size="lg" className="mt-4">
                  Start Your First Analysis →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-xs text-muted-foreground">
              {submissions.length === 0 ? 'No submissions yet' : 'Data submissions completed'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses Generated</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyses.length}</div>
            <p className="text-xs text-muted-foreground">
              {analyses.length === 0 ? 'No analyses yet' : 'AI-powered stage analyses'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stage</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </CardHeader>
          <CardContent>
            {latestAnalysis ? (
              <div>
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStartupStageColor(latestAnalysis.detected_stage)}`}>
                  {latestAnalysis.detected_stage.replace('_', '-')}
                </div>
                <p className={`text-xs mt-1 ${getConfidenceScoreColor(latestAnalysis.confidence_score)}`}>
                  {latestAnalysis.confidence_score}% confidence
                </p>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-gray-400">---</div>
                <p className="text-xs text-muted-foreground">Submit data to get analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Submissions</CardTitle>
              <Link href="/dashboard/submit">
                <Button variant="outline" size="sm">Add New</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {hasSubmissions ? (
              <div className="space-y-3">
                {submissions.slice(0, 3).map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{submission.company_name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(submission.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {submission.is_draft ? 'Draft' : 'Submitted'}
                      </p>
                    </div>
                  </div>
                ))}
                {submissions.length > 3 && (
                  <div className="text-center pt-2">
                    <Link href="/dashboard/analyses" className="text-sm text-blue-600 hover:text-blue-800">
                      View all submissions →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No submissions yet</p>
                <Link href="/dashboard/submit">
                  <Button variant="outline" size="sm" className="mt-2">
                    Submit Your First Data
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Analyses</CardTitle>
              <Link href="/dashboard/analyses">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {hasAnalyses ? (
              <div className="space-y-3">
                {analyses.slice(0, 3).map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStartupStageColor(analysis.detected_stage)}`}>
                        {analysis.detected_stage.replace('_', '-')}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(analysis.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getConfidenceScoreColor(analysis.confidence_score)}`}>
                        {analysis.confidence_score}%
                      </p>
                      <p className="text-xs text-gray-500">confidence</p>
                    </div>
                  </div>
                ))}
                {analyses.length > 3 && (
                  <div className="text-center pt-2">
                    <Link href="/dashboard/analyses" className="text-sm text-blue-600 hover:text-blue-800">
                      View all analyses →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No analyses yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Submit startup data to get AI-powered stage analysis
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to help you track your startup's progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/submit">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Submit Data
              </Button>
            </Link>

            <Link href="/dashboard/analyses">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Analyses
              </Button>
            </Link>

            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Edit Profile
              </Button>
            </Link>

            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center" disabled>
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
