// app/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/ClientAuthProvider';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    recentSubmissions: 0,
    averageScore: 0
  });
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's analyses count
      const { count } = await supabase
        .from('stage_analysis_results')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Fetch recent analyses
      const { data: analyses } = await supabase
        .from('stage_analysis_results')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalAnalyses: count || 0,
        recentSubmissions: analyses?.length || 0,
        averageScore: analyses?.reduce((acc, curr) => acc + (curr.confidence_score || 0), 0) / (analyses?.length || 1) || 0
      });

      setRecentAnalyses(analyses || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
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

  const getStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
      'PRE_SEED': 'bg-purple-100 text-purple-800',
      'SEED': 'bg-blue-100 text-blue-800',
      'SERIES_A': 'bg-green-100 text-green-800',
      'GROWTH': 'bg-orange-100 text-orange-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your startup analysis activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Analyses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalAnalyses}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.recentSubmissions}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Confidence</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {Math.round(stats.averageScore)}%
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Ready to analyze your startup?</h2>
        <p className="mb-4 opacity-90">
          Get AI-powered insights about your startup's current stage and growth potential.
        </p>
        <Link href="/dashboard/submit">
          <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Submit New Startup →
          </button>
        </Link>
      </div>

      {/* Recent Analyses */}
      {recentAnalyses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Analyses</h2>
            <Link href="/dashboard/analyses" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all →
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {recentAnalyses.map((analysis) => (
                <Link 
                  key={analysis.id} 
                  href={`/dashboard/analyses/${analysis.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Stage Analysis #{analysis.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(analysis.detected_stage)}`}>
                        {getStageLabel(analysis.detected_stage)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {analysis.confidence_score}% confidence
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.totalAnalyses === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No analyses yet
          </h3>
          <p className="text-gray-600 mb-6">
            Submit your first startup data to get AI-powered stage analysis and insights.
          </p>
          <Link href="/dashboard/submit">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Submit Your First Startup
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
