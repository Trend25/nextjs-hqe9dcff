'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StageAnalysisResult, StartupSubmission } from '@/types';
import { formatDate, getStartupStageColor, getConfidenceScoreColor, formatCurrency } from '@/lib/utils';

interface AnalysisCardProps {
  analysis: StageAnalysisResult;
  submission?: StartupSubmission;
  showActions?: boolean;
}

export default function AnalysisCard({ analysis, submission, showActions = true }: AnalysisCardProps) {
  const stageLabels = {
    'PRE_SEED': 'Pre-Seed',
    'SEED': 'Seed',
    'SERIES_A': 'Series A',
    'GROWTH': 'Growth'
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'PRE_SEED':
        return '🌱';
      case 'SEED':
        return '🌿';
      case 'SERIES_A':
        return '🌳';
      case 'GROWTH':
        return '🚀';
      default:
        return '📊';
    }
  };

  const getConfidenceIcon = (score: number) => {
    if (score >= 80) return '🎯';
    if (score >= 60) return '✅';
    return '⚠️';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{getStageIcon(analysis.detected_stage)}</span>
              <div>
                <CardTitle className="text-lg">
                  {submission?.company_name || 'Startup Analysis'}
                </CardTitle>
                <CardDescription>
                  Analyzed on {formatDate(analysis.created_at)}
                </CardDescription>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              <Link href={`/dashboard/analyses/${analysis.id}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Stage and Confidence */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStartupStageColor(analysis.detected_stage)}`}>
                {stageLabels[analysis.detected_stage as keyof typeof stageLabels] || analysis.detected_stage}
              </span>
              <div className="flex items-center space-x-1">
                <span>{getConfidenceIcon(analysis.confidence_score)}</span>
                <span className={`text-sm font-medium ${getConfidenceScoreColor(analysis.confidence_score)}`}>
                  {analysis.confidence_score}% confidence
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {analysis.stage_score}/100
              </div>
              <div className="text-xs text-gray-500">Stage Score</div>
            </div>
          </div>

          {/* Company Metrics */}
          {submission && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div>
                <div className="text-xs text-gray-500">Industry</div>
                <div className="text-sm font-medium text-gray-900 truncate">
                  {submission.industry || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Team Size</div>
                <div className="text-sm font-medium text-gray-900">
                  {submission.team_size || 0} people
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Monthly Revenue</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(submission.monthly_revenue)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Total Funding</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(submission.total_funding)}
                </div>
              </div>
            </div>
          )}

          {/* Top Reasons */}
          {analysis.reasons && analysis.reasons.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">Key Analysis Points</div>
              <div className="space-y-1">
                {analysis.reasons.slice(0, 2).map((reason, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm text-gray-700">{reason}</span>
                  </div>
                ))}
                {analysis.reasons.length > 2 && (
                  <div className="text-xs text-gray-500 mt-1">
                    +{analysis.reasons.length - 2} more insights
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Milestones Preview */}
          {analysis.next_milestones && analysis.next_milestones.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">Next Milestones</div>
              <div className="space-y-1">
                {analysis.next_milestones.slice(0, 2).map((milestone, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">→</span>
                    <span className="text-sm text-gray-700">{milestone}</span>
                  </div>
                ))}
                {analysis.next_milestones.length > 2 && (
                  <div className="text-xs text-gray-500 mt-1">
                    +{analysis.next_milestones.length - 2} more milestones
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stage Breakdown */}
          {(analysis.pre_seed_score || analysis.seed_score || analysis.series_a_score || analysis.growth_score) && (
            <div className="pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-3">Stage Probability Breakdown</div>
              <div className="space-y-2">
                {[
                  { stage: 'PRE_SEED', score: analysis.pre_seed_score, label: 'Pre-Seed' },
                  { stage: 'SEED', score: analysis.seed_score, label: 'Seed' },
                  { stage: 'SERIES_A', score: analysis.series_a_score, label: 'Series A' },
                  { stage: 'GROWTH', score: analysis.growth_score, label: 'Growth' }
                ].filter(item => item.score !== undefined && item.score > 0).map((item) => (
                  <div key={item.stage} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{item.label}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{item.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
