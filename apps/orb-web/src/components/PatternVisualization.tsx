/**
 * Pattern Visualization
 * 
 * Phase 6: Learning Loop UI
 * 
 * Visualize detected patterns with charts and metrics.
 */

import React from 'react';

import type { Pattern } from '@orb-system/core-orb';

interface PatternVisualizationProps {
  patterns: Pattern[];
}

export function PatternVisualization({ patterns }: PatternVisualizationProps) {
  if (patterns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No patterns detected yet. Keep using Orb to discover patterns!
      </div>
    );
  }

  // Group patterns by type
  const patternsByType = patterns.reduce((acc, pattern) => {
    if (!acc[pattern.type]) {
      acc[pattern.type] = [];
    }
    acc[pattern.type].push(pattern);
    return acc;
  }, {} as Record<string, Pattern[]>);

  // Calculate average confidence by type
  const avgConfidenceByType = Object.entries(patternsByType).map(([type, patternsOfType]) => ({
    type,
    count: patternsOfType.length,
    avgConfidence: patternsOfType.reduce((sum, p) => sum + p.confidence, 0) / patternsOfType.length,
  }));

  // Get pattern type display names
  const patternTypeNames: Record<string, string> = {
    frequent_action: 'Frequent Actions',
    time_based_routine: 'Time-Based Routines',
    mode_preference: 'Mode Preferences',
    error_pattern: 'Error Patterns',
    efficiency_gain: 'Efficiency Gains',
    risk_threshold: 'Risk Thresholds',
  };

  return (
    <div className="space-y-6">
      {/* Pattern Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {avgConfidenceByType.map(({ type, count, avgConfidence }) => (
          <div key={type} className="bg-gray-900 rounded-lg p-4">
            <div className="text-sm text-gray-400">{patternTypeNames[type] || type}</div>
            <div className="flex items-baseline gap-2 mt-2">
              <div className="text-2xl font-bold text-gray-100">{count}</div>
              <div className="text-sm text-gray-500">patterns</div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Avg Confidence</span>
                <span>{(avgConfidence * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 rounded-full h-2 transition-all"
                  style={{ width: `${avgConfidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Pattern List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-3">Pattern Details</h3>
        <div className="space-y-3">
          {patterns.slice(0, 10).map(pattern => (
            <div key={pattern.id} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-100">
                      {patternTypeNames[pattern.type] || pattern.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      pattern.status === 'applied' ? 'bg-green-900 text-green-200' :
                      pattern.status === 'validated' ? 'bg-blue-900 text-blue-200' :
                      pattern.status === 'rejected' ? 'bg-red-900 text-red-200' :
                      'bg-gray-800 text-gray-300'
                    }`}>
                      {pattern.status}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1 text-sm text-gray-400">
                    {pattern.data.actions && (
                      <div>Actions: {pattern.data.actions.join(', ')}</div>
                    )}
                    {pattern.data.modes && (
                      <div>Modes: {pattern.data.modes.join(', ')}</div>
                    )}
                    {pattern.data.frequency !== undefined && (
                      <div>Frequency: {pattern.data.frequency}</div>
                    )}
                    {pattern.data.errorRate !== undefined && (
                      <div>Error Rate: {(pattern.data.errorRate * 100).toFixed(1)}%</div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Events: {pattern.eventCount}</span>
                    <span>Detected: {new Date(pattern.detectedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="ml-4 text-right">
                  <div className="text-2xl font-bold text-gray-100">
                    {(pattern.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">confidence</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-3">Confidence Distribution</h3>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="space-y-2">
            {[
              { label: 'High (90-100%)', min: 0.9, max: 1, color: 'bg-green-500' },
              { label: 'Medium (70-90%)', min: 0.7, max: 0.9, color: 'bg-yellow-500' },
              { label: 'Low (50-70%)', min: 0.5, max: 0.7, color: 'bg-orange-500' },
              { label: 'Very Low (<50%)', min: 0, max: 0.5, color: 'bg-red-500' },
            ].map(({ label, min, max, color }) => {
              const count = patterns.filter(p => p.confidence >= min && p.confidence < max).length;
              const percentage = patterns.length > 0 ? (count / patterns.length) * 100 : 0;
              return (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-gray-400">{label}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-4 relative">
                    <div
                      className={`${color} rounded-full h-4 transition-all flex items-center justify-end pr-2`}
                      style={{ width: `${percentage}%` }}
                    >
                      {count > 0 && (
                        <span className="text-xs text-white font-medium">{count}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

