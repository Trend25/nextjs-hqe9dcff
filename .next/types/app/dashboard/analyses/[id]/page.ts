'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate, formatCurrency, getStartupStageColor, getConfidenceScoreColor } from '@/lib/utils';
import Link from 'next/link';

interface StartupSubmission {
  id: string;
  company_name: string;
  industry: string;
  team_size: number;
  founders_count: number;
  key_hires?: number;
  monthly_revenue?: number;
  total_funding?: number;
  burn_rate?: number;
  has_live_product: boolean;
  active_customers?: number;
  monthly_growth_rate?: number;
  customer_acquisition_cost?: number;
  lifetime_value?: number;
  has_paid_customers: boolean;
  has_recurring_revenue: boolean;
  is_operationally_profitable: boolean;
  has_scalable_business_model: boolean;
  market_size?: number;
  target_market?: string;
  created_at: string;
  submitted_at?: string;
}

interface StageAnalysisResult {
  id: string;
  submission_id: string;
  detected_stage: string;
  confidence_score: number;
  analysis_summary: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  created_at: string;
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<StartupSubmission | null>(null);
  const [analysis, setAnalysis] = useState<StageAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const supabase = createClientComponentClient();
  const submissionId = params?.id as string;

  useEffect(() => {
    if (submissionId) {
      fetchData();
    }
  }, [submissionId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch submission
      const { data: submissionData, error: submissionError } = await supabase
        .from('startup_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (submissionError) throw submissionError;

      // Fetch analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from('stage_analysis_results')
        .select('*')
        .eq('submission_id', submissionId)
        .single();

      if (analysisError && analysisError.code !== 'PGRST116') {
        console.error('Analysis error:', analysisError);
      }

      setSubmission(submissionData);
      setAnalysis(analysisData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load analysis details');
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    try {
      // This would trigger an AI analysis
      // For now, we'll create a mock analysis
      const mockAnalysis: StageAnalysisResult = {
        id: crypto.randomUUID(),
        submission_id: submissionId,
        detected_stage: determineStage(submission!),
        confidence_score: Math.floor(Math.random() * 30) + 70,
        analysis_summary: generateSummary(submission!),
        strengths: ['Strong team', 'Growing revenue', 'Clear market fit'],
        weaknesses: ['Limited funding', 'High burn rate', 'Small customer base'],
        recommendations: ['Focus on fundraising', 'Optimize operations', 'Expand sales team'],
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('stage_analysis_results')
        .insert([mockAnalysis]);

      if (error) throw error;

      setAnalysis(mockAnalysis);
    } catch (err: any) {
      console.error('Error triggering analysis:', err);
      setError('Failed to generate analysis');
    }
  };

  const determineStage = (sub: StartupSubmission): string => {
    if ((sub.monthly_revenue || 0) > 100000) return 'growth';
    if ((sub.monthly_revenue || 0) > 10000) return 'series_a';
    if ((sub.monthly_revenue || 0) > 0) return 'seed';
    return 'pre_seed';
  };

  const generateSummary = (sub: StartupSubmission): string => {
    return `${sub.company_name} appears to be in an early growth phase with ${sub.team_size} team members and ${sub.active_customers || 0} active customers. The company shows potential for scaling.`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Analysis not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analysis Details</h1>
          <p className="mt-1 text-sm text-gray-500">
            Submission from {formatDate(submission.submitted_at || submission.created_at)}
          </p>
        </div>
        <Link href="/dashboard/analyses">
          <Button variant="outline">Back to Analyses</Button>
        </Link>
      </div>

      {/* Company Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{submission.company_name}</CardTitle>
          <CardDescription>{submission.industry}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Team Size</div>
              <div className="text-lg font-medium">{submission.team_size} people</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Founders</div>
              <div className="text-lg font-medium">{submission.founders_count}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Key Hires</div>
              <div className="text-lg font-medium">{submission.key_hires || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Active Customers</div>
              <div className="text-lg font-medium">{(submission.active_customers || 0).toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Monthly Revenue</div>
              <div className="text-lg font-medium">{formatCurrency(submission.monthly_revenue || 0)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Funding</div>
              <div className="text-lg font-medium">{formatCurrency(submission.total_funding || 0)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Burn Rate</div>
              <div className="text-lg font-medium">{formatCurrency(submission.burn_rate || 0)}/mo</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Growth Rate</div>
              <div className="text-lg font-medium">{submission.monthly_growth_rate || 0}%</div>
            </div>
          </div>

          {/* Business Model Indicators */}
          <div className="mt-6 flex flex-wrap gap-2">
            {submission.has_live_product && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Live Product
              </span>
            )}
            {submission.has_paid_customers && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Paid Customers
              </span>
            )}
            {submission.has_recurring_revenue && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                Recurring Revenue
              </span>
            )}
            {submission.is_operationally_profitable && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Profitable
              </span>
            )}
            {submission.has_scalable_business_model && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                Scalable Model
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stage Analysis */}
      {analysis ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Stage Analysis</CardTitle>
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
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            {analysis.analysis_summary && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
                <p className="text-gray-700">{analysis.analysis_summary}</p>
              </div>
            )}

            {/* Strengths */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Strengths</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700">{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {analysis.weaknesses && analysis.weaknesses.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Areas for Improvement</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-gray-700">{weakness}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Recommendations</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-gray-700">{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Stage Analysis</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 mb-4">Analysis not yet generated</p>
            <Button onClick={triggerAnalysis}>Generate Analysis</Button>
          </CardContent>
        </Card>
      )}

      {/* Market Information */}
      {(submission.target_market || submission.market_size) && (
        <Card>
          <CardHeader>
            <CardTitle>Market Information</CardTitle>
          </CardHeader>
          <CardContent>
            {submission.target_market && (
              <div className="mb-4">
                <div className="text-sm text-gray-500">Target Market</div>
                <div className="text-gray-700">{submission.target_market}</div>
              </div>
            )}
            {submission.market_size && (
              <div>
                <div className="text-sm text-gray-500">Total Addressable Market</div>
                <div className="text-lg font-medium">{formatCurrency(submission.market_size || 0)}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
