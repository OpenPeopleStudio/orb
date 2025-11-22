/**
 * Orb Console Component
 * 
 * Mode-aware console that displays the complete Luna-Mav-Te loop execution.
 * This is the debug HUD for the OS loop.
 */

import { useState } from 'react';
import { runDemoFlow, type UIDemoFlowResult } from '../ui';
import type { DemoFlowResult } from '@orb-system/core-orb';

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

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const flowResult = await runDemoFlow({
        prompt,
        modeId,
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
          <span className={`text-sm font-semibold ${typeColors[decision.type]}`}>
            {decision.type.toUpperCase()}
          </span>
        </div>
        {decision.reasoning && (
          <p className="text-sm text-text-primary">{decision.reasoning}</p>
        )}
        {decision.riskLevel && (
          <p className="mt-2 text-xs text-text-muted">
            Risk Level: <span className="font-semibold">{decision.riskLevel}</span>
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
          <span className={`text-sm font-semibold ${statusColors[mavResult.status]}`}>
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
              {teEval.tags.map((tag, i) => (
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
              {teEval.recommendations.map((rec, i) => (
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

  return (
    <div className={className}>
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
        <h2 className="mb-4 text-2xl font-semibold">Orb Console</h2>
        
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
      </div>
    </div>
  );
};

export default OrbConsole;

