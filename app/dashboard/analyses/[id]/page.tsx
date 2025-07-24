'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/app/ClientAuthProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { StageAnalysisResult, StartupSubmission, BenchmarkComparison } from '@/types';
import { formatDate, formatCurrency, getStartupStageColor, getConfidenceScoreColor } from '@/lib/utils';

export default function AnalysisDetailPage() {
  const [analysis, setAnalysis] = useState<StageAnalysisResult | null>(null);
  const [submission, setSubmission] = useState<StartupSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user && analysisId) {
      fetchAnalysisDetail();
    }
  }, [user, analysisId]);

  const fetchAnalysisDetail = async () => {
    try {
      setLoading(true);
      
      // Fetch analysis with related submission
      const { data: analysisData, error: analysisError } = await supabase
        .from('stage_analysis_results')
        .select('*')
        .eq('id', analysisId)
        .eq('user_id', user?.id)
        .single();

      if (analysisError) {
        if (analysisError.code === 'PGRST116') {
          setError('Analysis not found');
          return;
        }
        throw analysisError;
      }

      setAnalysis(analysisData);

      // Fetch related submission if exists
      if (analysisData.submission_id) {
        const { data: submissionData, error: submissionError } = await supabase
          .from('startup_submissions')
          .select('*')
          .eq('id', analysisData.submission_id)
          .single();

        if (submissionError && submissionError.code !== 'PGRST116') {
          console.error('Error fetching submission:', submissionError);
        } else if (submissionData) {
          setSubmission(submissionData);
        }
      }
    } catch (err: any) {
      console.error('Error fetching analysis detail:', err);
      setError('Failed to load analysis details');
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
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analysis) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Analysis Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "The analysis you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <Link href="/dashboard/analyses">
            <Button>← Back to Analyses</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const stageLabels = {
    'PRE_SEED': 'Pre-Seed',
    'SEED': 'Seed',
    'SERIES_A': 'Series A',
    'GROWTH': 'Growth'
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'PRE_SEED': return '🌱';
      case 'SEED': return '🌿';
      case 'SERIES_A': return '🌳';
      case 'GROWTH': return '🚀';
      default: return '📊';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/analyses" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-flex items-center">
              ← Back to Analyses
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {submission?.company_name || 'Startup'} Stage Analysis
            </h1>
            <p className="text-gray-600">Analyzed on {formatDate(analysis.created_at)}</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" disabled>
              Export Report
            </Button>
            <Button variant="outline" disabled>
              Share Analysis
            </Button>
          </div>
        </div>

        {/* Main Analysis Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-4xl">{getStageIcon(analysis.detected_stage)}</span>
                <div>
                  <CardTitle className="text-2xl">
                    {stageLabels[analysis.detected_stage as keyof typeof stageLabels] || analysis.detected_stage} Stage
                  </CardTitle>
                  <CardDescription className="text-lg">
                    <span className={`font-medium ${getConfidenceScoreColor(analysis.confidence_score)}`}>
                      {analysis.confidence_score}% confidence
                    </span>
                    {' • '}
                    Stage Score: {analysis.stage_score}/100
                  </CardDescription>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full ${getStartupStageColor(analysis.detected_stage)}`}>
                <span className="font-medium">
                  {stageLabels[analysis.detected_stage as keyof typeof stageLabels]}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Company Snapshot */}
        {submission && (
          <Card>
            <CardHeader>
              <CardTitle>Company Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-500">Industry</div>
                  <div className="text-lg font-medium">{submission.industry || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Founded</div>
                  <div className="text-lg font-medium">{submission.founded_year || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Team Size</div>
                  <div className="text-lg font-medium">{submission.team_size || 0} people</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Founders</div>
                  <div className="text-lg font-medium">{submission.founders_count || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Monthly Revenue</div>
                  <div className="text-lg font-medium">{formatCurrency(submission.monthly_revenue)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Funding</div>
                  <div className="text-lg font-medium">{formatCurrency(submission.total_funding)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Active Customers</div>
                  <div className="text-lg font-medium">{submission.active_customers?.toLocaleString() || '0'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Growth Rate</div>
                  <div className="text-lg font-medium">{submission.monthly_growth_rate || 0}% MoM</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stage Probability Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Stage Probability Analysis</CardTitle>
            <CardDescription>How likely your startup fits each stage based on the provided metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { stage: 'PRE_SEED', score: analysis.pre_seed_score, label: 'Pre-Seed', icon: '🌱', color: 'bg-purple-500' },
                { stage: 'SEED', score: analysis.seed_score, label: 'Seed', icon: '🌿', color: 'bg-blue-500' },
                { stage: 'SERIES_A', score: analysis.series_a_score, label: 'Series A', icon: '🌳', color: 'bg-green-500' },
                { stage: 'GROWTH', score: analysis.growth_score, label: 'Growth', icon: '🚀', color: 'bg-orange-500' }
              ].filter(item => item.score !== undefined).map((item) => (
                <div key={item.stage} className="flex items-center space-x-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-sm text-gray-600">{item.score}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} transition-all duration-500`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Key Reasons */}
          {analysis.reasons && analysis.reasons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Analysis Points</CardTitle>
                <CardDescription>Why we determined this stage for your startup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.reasons.map((reason, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">{reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Actionable insights to improve your startup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                        💡
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Next Milestones */}
        {analysis.next_milestones && analysis.next_milestones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Next Milestones</CardTitle>
              <CardDescription>Key goals to focus on for your stage progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.next_milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                      🎯
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Milestone {index + 1}</p>
                      <p className="text-sm text-gray-700 mt-1">{milestone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benchmark Comparison */}
        {analysis.benchmark_comparison && analysis.benchmark_comparison.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmarks</CardTitle>
              <CardDescription>How your metrics compare to similar startups in your stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.benchmark_comparison.map((benchmark, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{benchmark.metric}</p>
                      <p className="text-sm text-gray-600">{benchmark.stage} average: {benchmark.benchmark}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Your value: {benchmark.your_value}</p>
                      <p className={`text-sm ${benchmark.status === 'above' || benchmark.status === 'excellent' ? 'text-green-600' : 'text-red-600'}`}>
                        {benchmark.percentile}th percentile ({benchmark.status})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 pt-6">
          <Link href="/dashboard/submit">
            <Button size="lg">Submit Updated Data</Button>
          </Link>
          <Link href="/dashboard/analyses">
            <Button variant="outline" size="lg">View All Analyses</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
