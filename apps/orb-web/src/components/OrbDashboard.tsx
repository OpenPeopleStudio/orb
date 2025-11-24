import { useState, useEffect } from 'react';
import clsx from 'clsx';

import { OrbRole } from '@orb-system/core-orb';

import { useMission } from '../hooks/useMission';
import { MissionAgentCard } from './MissionAgentCard';
import { MissionHistory } from './MissionHistory';
import type { MissionHistoryEntry } from '../lib/mission-storage';

const agentOrder: OrbRole[] = [
  OrbRole.SOL,
  OrbRole.TE,
  OrbRole.MAV,
  OrbRole.LUNA,
  OrbRole.ORB,
];

const statusMessages: Record<string, string> = {
  idle: 'Ready to process mission',
  analyzing: 'Sol is analyzing intent...',
  reflecting: 'Te is reflecting on context...',
  planning: 'Mav is creating action plan...',
  adapting: 'Luna is adapting preferences...',
  coordinating: 'Orb is coordinating agents...',
  ready: 'Mission plan ready!',
  error: 'An error occurred',
};

const OrbDashboard = () => {
  const [missionPrompt, setMissionPrompt] = useState('Ship the November Orb drop');
  const [lastProcessedPrompt, setLastProcessedPrompt] = useState('');
  
  const { state, isProcessing, error, processMission, reset } = useMission({
    userId: 'demo-user',
    sessionId: `session-${Date.now()}`,
  });

  // Auto-process on mount with initial prompt
  useEffect(() => {
    if (!lastProcessedPrompt && missionPrompt) {
      handleProcess();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProcess = async () => {
    if (!missionPrompt.trim()) return;
    setLastProcessedPrompt(missionPrompt);
    await processMission(missionPrompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleProcess();
    }
  };

  const handleLoadMission = (entry: MissionHistoryEntry) => {
    setMissionPrompt(entry.prompt);
    // Optionally auto-process the loaded mission
    // processMission(entry.prompt);
  };

  const statusMessage = state?.status ? statusMessages[state.status] : statusMessages.idle;

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="flex flex-col gap-6">
        {/* Mission Prompt Input */}
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <label className="text-xs uppercase tracking-[0.3em] text-text-muted" htmlFor="prompt">
            mission prompt
          </label>
          <div className="mt-3 flex gap-3">
            <input
              id="prompt"
              value={missionPrompt}
              onChange={(event) => setMissionPrompt(event.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
              className={clsx(
                'flex-1 rounded-xl border border-white/10 bg-bg-surface/70 px-4 py-3 text-base text-text-primary outline-none focus:border-accent-orb',
                isProcessing && 'opacity-50 cursor-not-allowed'
              )}
              placeholder="Describe what Orb should solve"
            />
            <button
              onClick={handleProcess}
              disabled={isProcessing || !missionPrompt.trim()}
              className={clsx(
                'px-6 py-3 rounded-xl font-medium transition-colors',
                isProcessing || !missionPrompt.trim()
                  ? 'bg-white/10 text-text-muted cursor-not-allowed'
                  : 'bg-accent-orb text-white hover:bg-accent-orb/80'
              )}
            >
              {isProcessing ? 'Processing...' : 'Process'}
            </button>
            {state && !isProcessing && (
              <button
                onClick={() => {
                  reset();
                  setLastProcessedPrompt('');
                }}
                className="px-6 py-3 rounded-xl font-medium bg-white/10 text-text-muted hover:bg-white/20 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-text-muted">
              The prompt coordinates all agents: Sol analyzes, Te reflects, Mav plans, Luna adapts, and Orb orchestrates.
            </p>
            {state && (
              <span className={clsx(
                'text-sm font-medium',
                state.status === 'ready' && 'text-green-400',
                state.status === 'error' && 'text-red-400',
                isProcessing && 'text-accent-orb animate-pulse'
              )}>
                {statusMessage}
              </span>
            )}
          </div>
          {error && (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">❌ {error}</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        {state?.timeline && state.timeline.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
            <h3 className="text-sm uppercase tracking-[0.3em] text-text-muted mb-4">
              Processing Timeline
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {state.timeline.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <span className="text-text-muted font-mono text-xs">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-accent-orb font-medium uppercase text-xs">
                    {entry.agent}
                  </span>
                  <span className="flex-1 text-text-muted">
                    {entry.event}
                    {entry.details && (
                      <span className="text-text-muted/70 ml-2">· {entry.details}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent Cards */}
        <div className="grid gap-4 lg:grid-cols-3">
          {agentOrder.map((role) => (
            <MissionAgentCard
              key={role}
              role={role}
              response={state?.agents[role.toLowerCase() as keyof typeof state.agents]}
              timeline={state?.timeline}
            />
          ))}
        </div>

        {/* Mission Summary (when ready) */}
        {state?.status === 'ready' && state.agents.orb?.data && (
          <div className="rounded-2xl border border-accent-orb/20 bg-accent-orb/5 p-6">
            <h3 className="text-lg font-semibold mb-4 text-accent-orb">
              ✨ Mission Ready
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text-muted mb-2">Coordination Summary</p>
                <p className="text-base text-text-primary">
                  {state.agents.orb.data.coordination}
                </p>
              </div>
              {state.agents.orb.data.nextSteps.length > 0 && (
                <div>
                  <p className="text-sm text-text-muted mb-2">Recommended Next Steps</p>
                  <ol className="space-y-2">
                    {state.agents.orb.data.nextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-accent-orb font-semibold">{idx + 1}.</span>
                        <span className="text-text-primary">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mission History */}
        <MissionHistory onLoadMission={handleLoadMission} />
      </div>
    </div>
  );
};

export default OrbDashboard;
