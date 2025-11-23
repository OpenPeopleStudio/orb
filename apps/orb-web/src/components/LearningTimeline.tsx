/**
 * Learning Timeline
 * 
 * Phase 6: Learning Loop UI
 * 
 * Timeline view of applied learnings and preference updates.
 */

import React from 'react';
import type { LearningAction, Insight } from '@orb-system/core-orb';

interface LearningTimelineProps {
  actions: LearningAction[];
  insights: Insight[];
}

export function LearningTimeline({ actions, insights }: LearningTimelineProps) {
  if (actions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No learnings applied yet. Approve suggestions to see them here!
      </div>
    );
  }

  // Sort actions by appliedAt timestamp (most recent first)
  const sortedActions = [...actions].sort((a, b) => {
    const timeA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
    const timeB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
    return timeB - timeA;
  });

  // Group actions by date
  const actionsByDate = sortedActions.reduce((acc, action) => {
    if (!action.appliedAt) return acc;
    
    const date = new Date(action.appliedAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(action);
    return acc;
  }, {} as Record<string, LearningAction[]>);

  // Get relative time string
  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return then.toLocaleDateString();
  };

  // Get action type icon and color
  const getActionStyle = (type: string): { icon: string; color: string } => {
    switch (type) {
      case 'update_preference':
        return { icon: '⚙️', color: 'bg-blue-900 text-blue-200' };
      case 'suggest_automation':
        return { icon: '🤖', color: 'bg-purple-900 text-purple-200' };
      case 'adjust_constraint':
        return { icon: '🔒', color: 'bg-yellow-900 text-yellow-200' };
      case 'recommend_mode':
        return { icon: '🎯', color: 'bg-green-900 text-green-200' };
      case 'adjust_risk_threshold':
        return { icon: '⚠️', color: 'bg-orange-900 text-orange-200' };
      case 'create_shortcut':
        return { icon: '⌨️', color: 'bg-indigo-900 text-indigo-200' };
      default:
        return { icon: '📝', color: 'bg-gray-800 text-gray-300' };
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(actionsByDate).map(([date, actionsForDate]) => (
        <div key={date}>
          <div className="text-sm font-semibold text-gray-400 mb-3">
            {getRelativeTime(actionsForDate[0].appliedAt!)}
          </div>
          <div className="space-y-3">
            {actionsForDate.map(action => {
              const insight = insights.find(i => i.id === action.insightId);
              const style = getActionStyle(action.type);
              
              return (
                <div key={action.id} className="bg-gray-900 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-start gap-3">
                    <div className={`${style.color} rounded-lg px-2 py-1 text-lg flex-shrink-0`}>
                      {style.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-100">
                        {insight?.title || 'Learning Applied'}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {action.reason}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Type: {action.type}</span>
                        <span>Target: {action.target}</span>
                        <span>Confidence: {(action.confidence * 100).toFixed(0)}%</span>
                      </div>
                      {action.appliedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          Applied: {new Date(action.appliedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

