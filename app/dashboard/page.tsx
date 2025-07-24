'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../ClientAuthProvider';
import { createClient } from '@supabase/supabase-js';
import { StartupSubmission, StageAnalysisResult, UserActivity } from '../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Dashboard() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, logActivity } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<StartupSubmission[]>([]);
  const [analyses, setAnalyses] = useState<StageAnalysisResult[]>([]);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    totalAnalyses: 0,
    latestStage: null as string | null,
    avgConfidence: 0
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!userProfile?.onboarding_completed) {
      router.push('/onboarding');
      return;
    }

    loadDashboardData();
  }, [user, userProfile, authLoading, router]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Load submissions
      const { data: submissionsData } = await supabase
        .from('startup_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Load analyses
      const { data: analysesData } = await supabase
        .from('stage_analysis_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setSubmissions(submissionsData || []);
      setAnalyses(analysesData || []);

      // Calculate stats
      const totalSubmissions = submissionsData?.length || 0;
      const totalAnalyses = analysesData?.length || 0;
      const latestStage = analysesData?.[0]?.detected_stage || null;
      const avgConfidence = analysesData?.length 
        ? analysesData.reduce((sum, analysis) => sum + analysis.confidence_score, 0) / analysesData.length
        : 0;

      setStats({
        totalSubmissions,
        totalAnalyses,
        latestStage,
        avgConfidence
      });

      // Log dashboard view
      if (logActivity) {
        await logActivity('dashboard_view');
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'PRE_SEED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SEED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SERIES_A': return 'bg-green-100 text-green-800 border-green-200';
      case 'GROWTH': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStage = (stage: string) => {
    return stage.replace('_', '-');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-xl font-bold text-gray-900">RateMyStartup</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/form')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Analysis
              </button>
              
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {userProfile?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block">{userProfile?.full_name}</span>
                </button>
                
                <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block">
                  <div className="py-2">
                    <button
                      onClick={() => router.push('/profile')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {/* sign out */}}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600">
            Here's an overview of your startup analysis journey.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Analyses Complete</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAnalyses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Stage</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.latestStage ? formatStage(stats.latestStage) : 'Not analyzed'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgConfidence > 0 ? `${Math.round(stats.avgConfidence)}%` : '--'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Submissions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
                <button
                  onClick={() => router.push('/form')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Create New →
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">📝</span>
                  <p className="text-gray-500 mb-4">No submissions yet</p>
                  <button
                    onClick={() => router.push('/form')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Submission
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{submission.company_name}</h3>
                          <p className="text-sm text-gray-600">
                            {submission.industry && `${submission.industry} • `}
                            {formatDate(submission.created_at || '')}
                          </p>
                          <div className="flex items-center mt-2 text-xs">
                            {submission.is_draft ? (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Draft
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                Submitted
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/form?edit=${submission.id}`)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Analyses */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Analyses</h2>
                <button
                  onClick={() => router.push('/results')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All →
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {analyses.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🎯</span>
                  <p className="text-gray-500 mb-4">No analyses yet</p>
                  <p className="text-sm text-gray-400">
                    Complete a submission to get your first analysis
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyses.map((analysis) => (
                    <div key={analysis.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStageColor(analysis.detected_stage)}`}>
                              {formatStage(analysis.detected_stage)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {Math.round(analysis.confidence_score)}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(analysis.created_at || '')}
                          </p>
                        </div>
                        <button
                          onClick={() => router.push(`/results?analysis=${analysis.id}`)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready for your next analysis?</h3>
              <p className="text-blue-100">
                Track your startup's progress and get updated insights
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6">
              <button
                onClick={() => router.push('/form')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start New Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
