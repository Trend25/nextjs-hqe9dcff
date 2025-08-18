'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

// Basit format fonksiyonları (lib/utils'de yoksa)
const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
const getStartupStageColor = (stage: string) => 'bg-blue-100 text-blue-800';
const getConfidenceScoreColor = (score: number) => score > 80 ? 'text-green-600' : 'text-yellow-600';

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

      const { data: submissionData, error: submissionError } = await supabase
        .from('startup_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (submissionError) throw submissionError;

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
    const revenue = sub.monthly_revenue ?? 0;
    if (revenue > 100000) return 'growth';
    if (revenue > 10000) return 'series_a';
    if (revenue > 0) return 'seed';
    return 'pre_seed';
  };

  const generateSummary = (sub: StartupSubmission): string => {
    const customers = sub.active_customers ?? 0;
    return `${sub.company_name} appears to be in an early growth phase with ${sub.team_size} team members and ${customers} active customers. The company shows potential for scaling.`;
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

  // Güvenli değerler
  const monthlyRevenue = submission.monthly_revenue ?? 0;
  const totalFunding = submission.total_funding ?? 0;
  const burnRate = submission.burn_rate ?? 0;
  const growthRate = submission.monthly_growth_rate ?? 0;
  const keyHires = submission.key_hires ?? 0;
  const activeCustomers = submission.active_customers ?? 0;
  const marketSize = submission.market_size ?? 0;

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
              <div className="text-lg font-medium">{keyHires}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Active Customers</div>
              <div className="text-lg font-medium">{activeCustomers.toLocaleString()}</div>
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
              <div className="text-lg font-medium">{formatCurrency(monthlyRevenue)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Funding</div>
              <div className="text-lg font-medium">{formatCurrency(totalFunding)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Burn Rate</div>
              <div className="text-lg font-medium">{formatCurrency(burnRate)}/mo</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Growth Rate</div>
              <div className="text-lg font-medium">{growthRate}%</div>
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
            {analysis.analysis_summary && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
                <p className="text-gray-700">{analysis.analysis_summary}</p>
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
            <p className="text-gray-500 mb-4">Analysis not yet generated</p>
            <Button onClick={triggerAnalysis}>Generate Analysis</Button>
          </CardContent>
        </Card>
      )}

      {/* Market Information */}
      {(submission.target_market || marketSize > 0) && (
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
            {marketSize > 0 && (
              <div>
                <div className="text-sm text-gray-500">Total Addressable Market</div>
                <div className="text-lg font-medium">{formatCurrency(marketSize)}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
