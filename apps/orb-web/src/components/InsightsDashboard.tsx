/**
 * Insights Dashboard
 * 
 * Phase 6: Learning Loop UI
 * 
 * Main dashboard for viewing patterns, insights, and learning actions.
 */

import React from 'react';
import { useInsights } from '../hooks/useInsights';
import { PatternVisualization } from './PatternVisualization';
import { LearningTimeline } from './LearningTimeline';

export function InsightsDashboard() {
  const {
    patterns,
    insights,
    pendingSuggestions,
    appliedLearnings,
    loading,
    error,
    refresh,
    approveLearning,
    rejectLearning,
  } = useInsights();

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse text-gray-400">Loading insights...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-400">Error loading insights: {error.message}</div>
        <button
          onClick={refresh}
          className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Learning Insights</h1>
          <p className="text-sm text-gray-400 mt-1">
            Orb learns from your usage patterns and adapts to your preferences
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Patterns Detected</div>
          <div className="text-3xl font-bold text-gray-100 mt-1">{patterns.length}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Insights Generated</div>
          <div className="text-3xl font-bold text-gray-100 mt-1">{insights.length}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Pending Suggestions</div>
          <div className="text-3xl font-bold text-yellow-400 mt-1">{pendingSuggestions.length}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Applied Learnings</div>
          <div className="text-3xl font-bold text-green-400 mt-1">{appliedLearnings.length}</div>
        </div>
      </div>

      {/* Pending Suggestions */}
      {pendingSuggestions.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Pending Suggestions</h2>
          <div className="space-y-3">
            {pendingSuggestions.map(action => {
              const insight = insights.find(i => i.id === action.insightId);
              return (
                <div key={action.id} className="bg-gray-900 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-100">{insight?.title || 'Learning Suggestion'}</div>
                      <div className="text-sm text-gray-400 mt-1">{insight?.description}</div>
                      <div className="text-sm text-gray-500 mt-2">
                        <span className="font-medium">Recommendation:</span> {insight?.recommendation}
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="text-xs text-gray-500">
                          Confidence: {(action.confidence * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Type: {action.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => approveLearning(action.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => rejectLearning(action.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pattern Visualization */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-4">Pattern Visualization</h2>
        <PatternVisualization patterns={patterns} />
      </div>

      {/* Learning Timeline */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-4">Learning Timeline</h2>
        <LearningTimeline actions={appliedLearnings} insights={insights} />
      </div>

      {/* Recent Insights */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-4">Recent Insights</h2>
        <div className="space-y-3">
          {insights.slice(0, 5).map(insight => (
            <div key={insight.id} className="bg-gray-900 rounded-lg p-4">
              <div className="font-semibold text-gray-100">{insight.title}</div>
              <div className="text-sm text-gray-400 mt-1">{insight.description}</div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                <span>Generated: {new Date(insight.generatedAt).toLocaleString()}</span>
                {insight.appliedAt && (
                  <span className="text-green-400">Applied: {new Date(insight.appliedAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

