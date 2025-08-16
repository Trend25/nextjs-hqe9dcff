// app/dashboard/analyses/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/ClientAuthProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AnalysesPage() {
  const { user, loading } = useAuth();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('stage_analysis_results')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const getStageLabel = (stage: string) => {
    const labels: { [key: string]: string } = {
      'PRE_SEED': 'Pre-Seed',
      'SEED': 'Seed',
      'SERIES_A': 'Series A',
      'GROWTH': 'Growth'
    };
    return labels[stage] || stage;
  };

  const getStageIcon = (stage: string) => {
    const icons: { [key: string]: string } = {
      'PRE_SEED': '🌱',
      'SEED': '🌿',
      'SERIES_A': '🌳',
      'GROWTH': '🚀'
    };
    return icons[stage] || '📊';
  };

  const getStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
      'PRE_SEED': 'bg-purple-100 text-purple-800 border-purple-200',
      'SEED': 'bg-blue-100 text-blue-800 border-blue-200',
      'SERIES_A': 'bg-green-100 text-green-800 border-green-200',
      'GROWTH': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Your Analyses
          </h1>
          <p className="mt-2 text-gray-600">
            View all your startup stage analyses and insights
          </p>
        </div>
        <Link href="/dashboard/submit">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center">
            <span className="mr-2">➕</span>
            New Analysis
          </button>
        </Link>
      </div>

      {/* Analyses List */}
      {analyses.length > 0 ? (
        <div className="grid gap-4">
          {analyses.map((analysis) => (
            <Link 
              key={analysis.id} 
              href={`/dashboard/analyses/${analysis.id}`}
              className="block"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">
                      {getStageIcon(analysis.detected_stage)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Stage Analysis
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Created on {new Date(analysis.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStageColor(analysis.detected_stage)}`}>
                          {getStageLabel(analysis.detected_stage)}
                        </span>
                        <span className={`text-sm font-medium ${getConfidenceColor(analysis.confidence_score)}`}>
                          {analysis.confidence_score}% confidence
                        </span>
                        <span className="text-sm text-gray-600">
                          Stage Score: {analysis.stage_score}/100
                        </span>
                      </div>

                      {analysis.reasons && analysis.reasons.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            💡 {analysis.reasons[0].substring(0, 100)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No analyses yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Submit your startup data to get AI-powered insights about your current stage and growth trajectory.
          </p>
          <Link href="/dashboard/submit">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Create Your First Analysis
            </button>
          </Link>
        </div>
      )}

      {/* Stats Summary */}
      {analyses.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Analyses</p>
              <p className="text-2xl font-bold text-gray-900">{analyses.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Confidence</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(analyses.reduce((acc, curr) => acc + curr.confidence_score, 0) / analyses.length)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Most Common Stage</p>
              <p className="text-2xl font-bold text-gray-900">
                {(() => {
                  const stageCounts = analyses.reduce((acc, curr) => {
                    acc[curr.detected_stage] = (acc[curr.detected_stage] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  const mostCommon = Object.entries(stageCounts).sort((a, b) => b[1] - a[1])[0];
                  return mostCommon ? getStageLabel(mostCommon[0]) : 'N/A';
                })()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Latest Analysis</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Date(analyses[0]?.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
