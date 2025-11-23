/**
 * Orb Console Component
 * 
 * Mode-aware console that displays the complete Luna-Mav-Te loop execution.
 * This is the debug HUD for the OS loop.
 */

import { useState } from 'react';
import { runDemoFlow, type UIDemoFlowResult } from '../ui';
import type { DemoFlowResult, OrbEvent, EventStats, EventFilter } from '@orb-system/core-orb';
import { OrbEventType, OrbMode, OrbRole } from '@orb-system/core-orb';
import { useEvents } from '../hooks/useEvents';

type ModeId = 'default' | 'restaurant' | 'real_estate' | 'builder';

const MODE_LABELS: Record<ModeId, string> = {
  default: 'Default',
  restaurant: 'Restaurant',
  real_estate: 'Real Estate',
  builder: 'Builder',
};

const MODE_COLORS: Record<ModeId, string> = {
  default: 'text-accent-luna',
  restaurant: 'text-orange-400',
  real_estate: 'text-blue-400',
  builder: 'text-purple-400',
};

interface OrbConsoleProps {
  className?: string;
}

const OrbConsole = ({ className }: OrbConsoleProps) => {
  const [prompt, setPrompt] = useState('Help me find a good restaurant');
  const [modeId, setModeId] = useState<ModeId>('default');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<UIDemoFlowResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'flow' | 'events'>('flow');
  
  // Event filter state
  const [eventFilter, setEventFilter] = useState<EventFilter>({
    limit: 50,
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Event stream
  const { events, stats, loading: eventsLoading, refresh: refreshEvents } = useEvents({
    filter: eventFilter,
    autoRefresh: activeTab === 'events',
    refreshInterval: 2000,
  });

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const flowResult = await runDemoFlow({
        prompt,
        modeId: modeId as OrbMode,
        userId: 'demo-user',
        sessionId: `session-${Date.now()}`,
      });
      setResult(flowResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  };

  const renderLunaDecision = (decision: DemoFlowResult['lunaDecision']) => {
    const typeColors = {
      allow: 'text-green-400',
      deny: 'text-red-400',
      require_confirmation: 'text-yellow-400',
    };

    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Luna Decision
          </h3>
          <span className={`text-sm font-semibold ${typeColors[decision.type as keyof typeof typeColors]}`}>
            {decision.type.toUpperCase()}
          </span>
        </div>
        {decision.reasons && decision.reasons.length > 0 && (
          <div className="text-sm text-text-primary">
            {decision.reasons.map((reason: string, idx: number) => (
              <p key={idx} className="mb-1">{reason}</p>
            ))}
          </div>
        )}
        {decision.effectiveRisk && (
          <p className="mt-2 text-xs text-text-muted">
            Risk Level: <span className="font-semibold">{decision.effectiveRisk}</span>
          </p>
        )}
      </div>
    );
  };

  const renderMavResult = (mavResult?: DemoFlowResult['mavTaskResult']) => {
    if (!mavResult) return null;

    const statusColors = {
      completed: 'text-green-400',
      failed: 'text-red-400',
      partial: 'text-yellow-400',
    };

    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Mav Task
          </h3>
          <span className={`text-sm font-semibold ${statusColors[mavResult.status as keyof typeof statusColors]}`}>
            {mavResult.status.toUpperCase()}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Actions:</span>
            <span className="text-text-primary">
              {mavResult.actionsCompleted}/{mavResult.actionsTotal}
            </span>
          </div>
          {mavResult.metadata?.filesTouched && (
            <div>
              <span className="text-text-muted">Files touched:</span>
              <ul className="mt-1 space-y-1 pl-4">
                {(mavResult.metadata.filesTouched as string[]).map((file, i) => (
                  <li key={i} className="text-xs text-text-primary">
                    {file}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {mavResult.metadata?.summary && (
            <p className="text-xs text-text-muted">{mavResult.metadata.summary as string}</p>
          )}
          {mavResult.error && (
            <p className="text-xs text-red-400">{mavResult.error}</p>
          )}
        </div>
      </div>
    );
  };

  const renderTeEvaluation = (teEval?: DemoFlowResult['teEvaluation']) => {
    if (!teEval) return null;

    const scoreColor =
      teEval.score >= 80 ? 'text-green-400' : teEval.score >= 60 ? 'text-yellow-400' : 'text-red-400';

    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Te Evaluation
          </h3>
          <span className={`text-lg font-bold ${scoreColor}`}>{teEval.score}</span>
        </div>
        {teEval.tags && teEval.tags.length > 0 && (
          <div className="mb-2">
            <span className="text-xs text-text-muted">Tags: </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {teEval.tags.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="rounded bg-white/10 px-2 py-0.5 text-xs text-text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        {teEval.recommendations && teEval.recommendations.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold text-text-muted">Recommendations:</p>
            <ul className="space-y-1 text-xs text-text-primary">
              {teEval.recommendations.map((rec: string, i: number) => (
                <li key={i} className="pl-2">• {rec}</li>
              ))}
            </ul>
          </div>
        )}
        {teEval.summary && (
          <p className="mt-2 text-xs text-text-muted">{teEval.summary}</p>
        )}
      </div>
    );
  };

  const renderEventStream = () => {
    if (eventsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-text-muted">Loading events...</p>
        </div>
      );
    }

    if (events.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-sm text-text-muted">No events yet</p>
          <p className="mt-2 text-xs text-text-muted">
            Run a demo flow to see events appear here
          </p>
        </div>
      );
    }

    const eventTypeColors: Record<string, string> = {
      task_run: 'text-blue-400',
      task_complete: 'text-green-400',
      task_fail: 'text-red-400',
      user_input: 'text-purple-400',
      mode_change: 'text-yellow-400',
      luna_decision: 'text-pink-400',
      luna_allow: 'text-green-400',
      luna_deny: 'text-red-400',
      mav_action: 'text-cyan-400',
      file_write: 'text-blue-400',
      te_evaluation: 'text-orange-400',
      te_reflection: 'text-indigo-400',
      error: 'text-red-500',
    };

    return (
      <div className="space-y-2">
        {events.slice(0, 50).map((event) => (
          <div
            key={event.id}
            className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${eventTypeColors[event.type] || 'text-text-primary'}`}>
                  {event.type}
                </span>
                {event.mode && (
                  <span className="rounded bg-white/10 px-2 py-0.5 text-text-muted">
                    {event.mode}
                  </span>
                )}
                {event.role && (
                  <span className="rounded bg-white/10 px-2 py-0.5 text-text-muted">
                    {event.role}
                  </span>
                )}
              </div>
              <span className="text-text-muted">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
            {Object.keys(event.payload).length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-text-muted hover:text-text-primary">
                  Payload
                </summary>
                <pre className="mt-2 overflow-x-auto rounded bg-black/20 p-2 text-xs">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEventStats = () => {
    if (!stats) return null;

    return (
      <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Event Statistics
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Total Events:</span>
            <span className="ml-2 font-semibold text-text-primary">{stats.totalEvents}</span>
          </div>
          <div>
            <span className="text-text-muted">Error Rate:</span>
            <span className={`ml-2 font-semibold ${stats.errorRate > 0.1 ? 'text-red-400' : 'text-green-400'}`}>
              {(stats.errorRate * 100).toFixed(1)}%
            </span>
          </div>
          {stats.mostUsedModes.length > 0 && (
            <div className="col-span-2">
              <span className="text-text-muted">Most Used Modes:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {stats.mostUsedModes.slice(0, 5).map((item) => (
                  <span
                    key={item.mode}
                    className="rounded bg-white/10 px-2 py-1 text-xs text-text-primary"
                  >
                    {item.mode} ({item.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Orb Console</h2>
          
          {/* Tab Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('flow')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === 'flow'
                  ? 'bg-accent-orb text-white'
                  : 'bg-white/5 text-text-muted hover:bg-white/10'
              }`}
            >
              Flow
            </button>
            <button
              onClick={() => {
                setActiveTab('events');
                refreshEvents();
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === 'events'
                  ? 'bg-accent-orb text-white'
                  : 'bg-white/5 text-text-muted hover:bg-white/10'
              }`}
            >
              Events
            </button>
          </div>
        </div>
        
        {/* Input Section */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-text-muted">
              Mode
            </label>
            <select
              value={modeId}
              onChange={(e) => setModeId(e.target.value as ModeId)}
              className="w-full rounded-xl border border-white/10 bg-bg-surface/70 px-4 py-2 text-base text-text-primary outline-none focus:border-accent-orb"
              disabled={isRunning}
            >
              {Object.entries(MODE_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-text-muted">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-bg-surface/70 px-4 py-3 text-base text-text-primary outline-none focus:border-accent-orb"
              placeholder="Enter your prompt..."
              rows={3}
              disabled={isRunning}
            />
          </div>
          
          <button
            onClick={handleRun}
            disabled={isRunning || !prompt.trim()}
            className="w-full rounded-xl bg-accent-orb px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run Demo Flow'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/50 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'flow' ? (
          <>
            {/* Results Display */}
            {result && (
              <div className="space-y-4">
                {/* Mode Display */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                      Active Mode
                    </h3>
                    <span className={`text-lg font-bold ${MODE_COLORS[modeId]}`}>
                      {MODE_LABELS[modeId]}
                    </span>
                  </div>
                </div>

                {/* Luna Decision */}
                {renderLunaDecision(result.lunaDecision)}

                {/* Sol Output (if allowed) */}
                {result.solOutput && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
                      Sol Output
                    </h3>
                    <p className="text-sm text-text-primary">{result.solOutput}</p>
                  </div>
                )}

                {/* Mav Result */}
                {renderMavResult(result.mavTaskResult)}

                {/* Te Evaluation */}
                {renderTeEvaluation(result.teEvaluation)}
              </div>
            )}
          </>
        ) : (
          <div>
            {/* Filter Controls */}
            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                  Event Filters
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-xs text-text-muted hover:text-text-primary"
                >
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>
              
              {showFilters && (
                <div className="space-y-4">
                  {/* Search Input - Full Width */}
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Search Events</label>
                    <input
                      type="text"
                      value={eventFilter.search || ''}
                      onChange={(e) => {
                        setEventFilter({
                          ...eventFilter,
                          search: e.target.value || undefined,
                        });
                      }}
                      placeholder="Search in payload, metadata, or event type..."
                      className="w-full rounded-lg border border-white/10 bg-bg-surface/70 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-orb"
                    />
                  </div>
                  
                  {/* Other Filters - Grid Layout */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Event Type Filter */}
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Event Type</label>
                    <select
                      value={Array.isArray(eventFilter.type) ? eventFilter.type[0] : eventFilter.type || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEventFilter({
                          ...eventFilter,
                          type: value ? (value as OrbEventType) : undefined,
                        });
                      }}
                      className="w-full rounded-lg border border-white/10 bg-bg-surface/70 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-orb"
                    >
                      <option value="">All Types</option>
                      {Object.values(OrbEventType).map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Mode Filter */}
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Mode</label>
                    <select
                      value={eventFilter.mode || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEventFilter({
                          ...eventFilter,
                          mode: value ? (value as OrbMode) : undefined,
                        });
                      }}
                      className="w-full rounded-lg border border-white/10 bg-bg-surface/70 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-orb"
                    >
                      <option value="">All Modes</option>
                      {Object.values(OrbMode).map((mode) => (
                        <option key={mode} value={mode}>
                          {mode.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Role Filter */}
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Role</label>
                    <select
                      value={eventFilter.role || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEventFilter({
                          ...eventFilter,
                          role: value ? (value as OrbRole) : undefined,
                        });
                      }}
                      className="w-full rounded-lg border border-white/10 bg-bg-surface/70 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-orb"
                    >
                      <option value="">All Roles</option>
                      {Object.values(OrbRole).map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Date From */}
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Date From</label>
                    <input
                      type="datetime-local"
                      value={eventFilter.dateFrom ? new Date(eventFilter.dateFrom).toISOString().slice(0, 16) : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEventFilter({
                          ...eventFilter,
                          dateFrom: value ? new Date(value).toISOString() : undefined,
                        });
                      }}
                      className="w-full rounded-lg border border-white/10 bg-bg-surface/70 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-orb"
                    />
                  </div>
                  
                  {/* Date To */}
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Date To</label>
                    <input
                      type="datetime-local"
                      value={eventFilter.dateTo ? new Date(eventFilter.dateTo).toISOString().slice(0, 16) : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEventFilter({
                          ...eventFilter,
                          dateTo: value ? new Date(value).toISOString() : undefined,
                        });
                      }}
                      className="w-full rounded-lg border border-white/10 bg-bg-surface/70 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-orb"
                    />
                  </div>
                  
                  {/* Limit */}
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Limit</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={eventFilter.limit || 50}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        setEventFilter({
                          ...eventFilter,
                          limit: value > 0 ? value : undefined,
                        });
                      }}
                      className="w-full rounded-lg border border-white/10 bg-bg-surface/70 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-orb"
                    />
                  </div>
                  </div>
                </div>
              )}
              
              {/* Filter Actions */}
              {showFilters && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEventFilter({ limit: 50 });
                    }}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-text-primary transition-opacity hover:opacity-80"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={refreshEvents}
                    disabled={eventsLoading}
                    className="rounded-lg bg-accent-orb px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                  >
                    Apply Filters
                  </button>
                </div>
              )}
            </div>
            
            {/* Event Statistics */}
            {renderEventStats()}
            
            {/* Event Stream */}
            <div className="max-h-[600px] overflow-y-auto">
              {renderEventStream()}
            </div>
            
            {/* Refresh Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={refreshEvents}
                disabled={eventsLoading}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-text-primary transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {eventsLoading ? 'Refreshing...' : 'Refresh Events'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrbConsole;

