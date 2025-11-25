/**
 * Agent card for displaying mission processing status
 * Shows real-time updates as agents process the mission
 */

import clsx from 'clsx';
import { useMemo, useState } from 'react';

import type { AnyAgentResponse, MissionState } from '@orb-system/forge';

import { OrbRole } from '../shims/core-orb';

const accentClassMap: Record<OrbRole, string> = {
  [OrbRole.ORB]: 'text-accent-orb',
  [OrbRole.SOL]: 'text-accent-sol',
  [OrbRole.TE]: 'text-accent-te',
  [OrbRole.MAV]: 'text-accent-mav',
  [OrbRole.LUNA]: 'text-accent-luna',
  [OrbRole.FORGE]: 'text-accent-forge',
};

const agentTitles: Record<OrbRole, string> = {
  [OrbRole.ORB]: 'Orchestrator',
  [OrbRole.SOL]: 'Analyzer',
  [OrbRole.TE]: 'Reflector',
  [OrbRole.MAV]: 'Executor',
  [OrbRole.LUNA]: 'Adapter',
  [OrbRole.FORGE]: 'Coordinator',
};

const statusIcons: Record<'idle' | 'processing' | 'complete' | 'error', string> = {
  idle: '⚪',
  processing: '🔄',
  complete: '✅',
  error: '❌',
};

interface Props {
  role: OrbRole;
  response?: AnyAgentResponse;
  timeline?: MissionState['timeline'];
}

export function MissionAgentCard({ role, response, timeline }: Props) {
  const accentClass = accentClassMap[role];
  const accentSoftClass = `${accentClass}/70`;
  const title = agentTitles[role];
  const status = response?.status || 'idle';
  const statusIcon = statusIcons[status];
  const [showRealtime, setShowRealtime] = useState(false);

  const agentTimeline = useMemo(
    () =>
      (timeline ?? []).filter((entry) => entry.agent === role).sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [timeline, role]
  );

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Render different content based on agent type and response
  const renderContent = () => {
    if (!response || response.status === 'idle') {
      return (
        <div className="text-center py-6 text-text-muted">
          <p className="text-sm">Waiting to process...</p>
        </div>
      );
    }

    if (response.status === 'processing') {
      return (
        <div className="text-center py-6 text-text-muted">
          <div className="animate-pulse">
            <p className="text-sm">Processing...</p>
          </div>
        </div>
      );
    }

    if (response.status === 'error') {
      return (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{response.error || 'An error occurred'}</p>
        </div>
      );
    }

    // Render agent-specific data
    if (role === OrbRole.SOL && response.data && 'intent' in response.data) {
      const data = response.data;
      const priorityColors: Record<string, string> = {
        low: 'text-blue-400',
        medium: 'text-yellow-400',
        high: 'text-orange-400',
        critical: 'text-red-400',
      };
      const priorityColor = data.priority ? priorityColors[data.priority] : 'text-text-muted';
      
      return (
        <div className="space-y-3">
          {/* Intent & Confidence */}
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-sm text-text-muted">Intent Detected</p>
            <p className="text-lg font-medium">{data.intent.replace(/-/g, ' ')}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-white/10">
                <div
                  className={clsx('h-full rounded-full', accentClass.replace('text-', 'bg-'))}
                  style={{ width: `${data.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-text-muted">{Math.round(data.confidence * 100)}%</span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-white/5 bg-white/5 p-3">
              <p className="text-xs text-text-muted">Tone</p>
              <p className="font-medium capitalize">{data.tone}</p>
            </div>
            {data.priority && (
              <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-xs text-text-muted">Priority</p>
                <p className={clsx('font-medium capitalize', priorityColor)}>{data.priority}</p>
              </div>
            )}
            {data.scope && (
              <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-xs text-text-muted">Scope</p>
                <p className="font-medium capitalize">{data.scope}</p>
              </div>
            )}
            {data.actionable !== undefined && (
              <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-xs text-text-muted">Actionable</p>
                <p className={clsx('font-medium', data.actionable ? 'text-green-400' : 'text-text-muted')}>
                  {data.actionable ? 'Yes' : 'No'}
                </p>
              </div>
            )}
          </div>

          {/* Entities */}
          {data.entities && Object.keys(data.entities).length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <p className="text-sm text-text-muted mb-2">Extracted Entities</p>
              <div className="space-y-2 text-sm">
                {data.entities.when && (
                  <div>
                    <span className="text-xs text-text-muted uppercase">Timeline:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {data.entities.when.map((item: string, idx: number) => (
                        <span key={idx} className="rounded px-2 py-0.5 bg-accent-sol/20 text-accent-sol text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.entities.where && (
                  <div>
                    <span className="text-xs text-text-muted uppercase">Context:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {data.entities.where.map((item: string, idx: number) => (
                        <span key={idx} className="rounded px-2 py-0.5 bg-accent-sol/20 text-accent-sol text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.entities.who && data.entities.who.length > 0 && (
                  <div>
                    <span className="text-xs text-text-muted uppercase">Mentions:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {data.entities.who.slice(0, 3).map((item: string, idx: number) => (
                        <span key={idx} className="rounded px-2 py-0.5 bg-accent-sol/20 text-accent-sol text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Keywords */}
          {data.keywords && data.keywords.length > 0 && (
            <div>
              <p className="text-sm text-text-muted mb-2">Key Terms</p>
              <div className="flex flex-wrap gap-1">
                {data.keywords.slice(0, 6).map((keyword: string, idx: number) => (
                  <span key={idx} className="rounded-full px-3 py-1 bg-white/5 text-xs text-text-muted">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="text-sm text-text-muted pt-2 border-t border-white/5">
            <p>{data.summary}</p>
          </div>
        </div>
      );
    }

    if (role === OrbRole.TE && response.data && 'actions' in response.data) {
      const data = response.data;
      return (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-sm text-text-muted">Reflection</p>
            <p className="text-base font-medium">{data.summary}</p>
          </div>
          {data.actions.length > 0 && (
            <div>
              <p className="text-sm text-text-muted mb-2">Considerations</p>
              <ul className="space-y-2 text-sm">
                {data.actions.slice(0, 3).map((action: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-text-muted">
                    <span className={clsx('mt-0.5', accentClass)}>•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (role === OrbRole.MAV && response.data && 'actions' in response.data) {
      const data = response.data;
      return (
        <div className="space-y-3">
          <p className="text-sm text-text-muted">Action Plan</p>
          <ul className="space-y-2 text-sm">
            {data.actions.slice(0, 3).map((action: { id: string; summary: string; etaMinutes: number; status: string }) => (
              <li key={action.id} className="flex items-center justify-between text-text-muted">
                <span>{action.summary}</span>
                <span className={clsx('text-xs font-semibold', accentClass)}>
                  {action.etaMinutes}m · {action.status}
                </span>
              </li>
            ))}
          </ul>
          {data.actions.length > 3 && (
            <p className="text-xs text-text-muted text-center">
              +{data.actions.length - 3} more actions
            </p>
          )}
        </div>
      );
    }

    if (role === OrbRole.LUNA && response.data && 'mode' in response.data) {
      const data = response.data;
      return (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-sm text-text-muted">Mode & Persona</p>
            <p className="text-lg font-medium capitalize">{data.mode || 'default'}</p>
            <p className="text-sm text-text-muted mt-1">Persona: {data.persona || 'balanced'}</p>
          </div>
          {data.principles && data.principles.length > 0 && (
            <div>
              <p className="text-sm text-text-muted mb-2">Principles</p>
              <ul className="space-y-1 text-sm">
                {data.principles.map((principle: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-text-muted">
                    <span className={clsx(accentClass)}>•</span>
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (role === OrbRole.ORB && response.data && 'coordination' in response.data) {
      const data = response.data;
      return (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-sm text-text-muted">Coordination Summary</p>
            <p className="text-base font-medium mt-1">{data.coordination}</p>
          </div>
          {data.nextSteps && data.nextSteps.length > 0 && (
            <div>
              <p className="text-sm text-text-muted mb-2">Next Steps</p>
              <ul className="space-y-2 text-sm">
                {data.nextSteps.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-text-muted">
                    <span className={clsx('font-semibold', accentClass)}>{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.blockers && data.blockers.length > 0 && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-sm text-red-400 font-medium mb-2">⚠️ Blockers</p>
              <ul className="space-y-1 text-sm text-red-300">
                {data.blockers.map((blocker: string, idx: number) => (
                  <li key={idx}>• {blocker}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="text-center py-6 text-text-muted">
        <p className="text-sm">No data available</p>
      </div>
    );
  };

  return (
    <article className="glow-card flex flex-col gap-4 rounded-2xl p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={clsx('text-sm uppercase tracking-[0.3em]', accentClass)}>
            {role}
          </p>
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl" title={status}>
            {statusIcon}
          </span>
          {agentTimeline.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRealtime((prev) => !prev)}
              className={clsx(
                'rounded-lg border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                showRealtime
                  ? clsx(accentClass, 'border-current')
                  : 'border-white/10 text-text-muted hover:text-text-primary'
              )}
              aria-pressed={showRealtime}
            >
              {showRealtime ? 'Hide stream' : 'View stream'}
            </button>
          )}
        </div>
      </div>

      {renderContent()}

      {showRealtime && agentTimeline.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <p className={clsx('text-sm font-semibold', accentClass)}>Realtime Signal Stream</p>
            <span className={clsx('text-xs uppercase tracking-[0.3em]', accentSoftClass)}>
              live
            </span>
          </div>
          <div className="max-h-56 space-y-2 overflow-y-auto pr-2 text-sm text-text-muted">
            {agentTimeline.map((entry, idx) => (
              <div
                key={`${entry.timestamp}-${idx}`}
                className="rounded-xl border border-white/5 bg-white/5 p-3"
              >
                <div className="flex items-center justify-between text-xs text-text-muted/80 font-mono">
                  <span>{formatTime(entry.timestamp)}</span>
                  <span className={clsx('uppercase', accentClass)}>{entry.event}</span>
                </div>
                {entry.details && (
                  <p className="mt-2 text-sm text-text-primary">
                    {entry.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

