/**
 * Mission History Component
 * Shows past missions with stats and search
 */

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import {
  getMissionHistory,
  getMissionStats,
  deleteMission,
  clearHistory,
  searchMissions,
  type MissionHistoryEntry,
} from '../lib/mission-storage';

interface MissionHistoryProps {
  onLoadMission?: (entry: MissionHistoryEntry) => void;
}

export function MissionHistory({ onLoadMission }: MissionHistoryProps) {
  const [history, setHistory] = useState<MissionHistoryEntry[]>([]);
  const [stats, setStats] = useState(getMissionStats());
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const loaded = searchQuery
      ? searchMissions(searchQuery)
      : getMissionHistory();
    setHistory(loaded);
    setStats(getMissionStats());
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this mission from history?')) {
      deleteMission(id);
      loadHistory();
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all mission history? This cannot be undone.')) {
      clearHistory();
      loadHistory();
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setHistory(searchMissions(query));
    } else {
      setHistory(getMissionHistory());
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm uppercase tracking-[0.3em] text-text-muted">
            Mission History
          </h3>
          <p className="text-xs text-text-muted mt-1">
            {stats.total} missions · {stats.successful} successful · {stats.failed} failed
          </p>
        </div>
        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            {isExpanded ? '▼ Collapse' : '▶ Expand'}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl border border-white/5 bg-white/5 p-3">
            <p className="text-xs text-text-muted">Total</p>
            <p className="text-2xl font-semibold text-text-primary">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-3">
            <p className="text-xs text-text-muted">Success Rate</p>
            <p className="text-2xl font-semibold text-green-400">
              {stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}%
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-3">
            <p className="text-xs text-text-muted">Avg Time</p>
            <p className="text-2xl font-semibold text-text-primary">
              {formatDuration(stats.averageProcessingTime)}
            </p>
          </div>
        </div>
      )}

      {isExpanded && (
        <>
          {/* Search */}
          {history.length > 3 && (
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search missions..."
                className="w-full rounded-xl border border-white/10 bg-bg-surface/70 px-4 py-2 text-sm text-text-primary outline-none focus:border-accent-orb"
              />
            </div>
          )}

          {/* History List */}
          {history.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <p className="text-sm">
                {searchQuery ? 'No missions match your search' : 'No mission history yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={clsx(
                            'text-xs font-semibold',
                            entry.result.success ? 'text-green-400' : 'text-red-400'
                          )}
                        >
                          {entry.result.success ? '✓' : '✗'}
                        </span>
                        <span className="text-xs text-text-muted">
                          {formatDate(entry.timestamp)}
                        </span>
                        {entry.result.state.startedAt && entry.result.state.completedAt && (
                          <span className="text-xs text-text-muted">
                            · {formatDuration(
                              new Date(entry.result.state.completedAt).getTime() -
                              new Date(entry.result.state.startedAt).getTime()
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-primary font-medium truncate">
                        {entry.prompt}
                      </p>
                      {entry.result.state.agents.sol?.data && (
                        <p className="text-xs text-text-muted mt-1">
                          Intent: {entry.result.state.agents.sol.data.intent}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onLoadMission && (
                        <button
                          onClick={() => onLoadMission(entry)}
                          className="text-xs text-accent-orb hover:text-accent-orb/80 transition-colors"
                          title="Load this mission"
                        >
                          Load
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

