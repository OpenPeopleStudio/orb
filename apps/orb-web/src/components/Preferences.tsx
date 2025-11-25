/**
 * Preferences Component
 * 
 * Displays and allows editing of user preferences, constraints,
 * mode, and persona settings.
 */

import { useEffect, useState } from 'react';

import type {
  Constraint,
  ConstraintSet,
  PersonaClassificationResult,
} from '../shims/core-orb';
import { getModeDisplayName, getPersonaDisplayName, OrbMode, OrbPersona } from '../shims/core-orb';

interface PreferencesData {
  currentMode: OrbMode;
  currentPersona: OrbPersona | null;
  personaClassification: PersonaClassificationResult | null;
  activeConstraints: Constraint[];
  constraintSets: ConstraintSet[];
}

const Preferences = () => {
  const [data, setData] = useState<PreferencesData>({
    currentMode: OrbMode.DEFAULT,
    currentPersona: null,
    personaClassification: null,
    activeConstraints: [],
    constraintSets: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<OrbMode>(OrbMode.DEFAULT);
  const [selectedPersona, setSelectedPersona] = useState<OrbPersona | null>(null);

  useEffect(() => {
    // TODO: Fetch preferences from API
    // For now, use mock data
    const mockData: PreferencesData = {
      currentMode: OrbMode.SOL,
      currentPersona: OrbPersona.PERSONAL,
      personaClassification: {
        persona: OrbPersona.PERSONAL,
        confidence: 0.85,
        distribution: {
          [OrbPersona.PERSONAL]: 0.85,
          [OrbPersona.SWL]: 0.05,
          [OrbPersona.REAL_ESTATE]: 0.05,
          [OrbPersona.OPEN_PEOPLE]: 0.05,
        },
        reasons: ['Sol device → Personal persona (creative work)', 'Sol mode → Personal persona (work context)'],
        signals: ['Sol device → Personal persona (creative work)', 'sol mode → Personal persona (work context)'],
        overridden: false,
        classifiedAt: new Date(),
      },
      activeConstraints: [
        {
          id: 'system:no-destructive-actions',
          type: 'block_tool',
          severity: 'hard',
          active: true,
          description: 'Block destructive actions (delete, force push, etc.) unless explicitly allowed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'system:require-confirmation-high-risk',
          type: 'require_confirmation',
          severity: 'soft',
          active: true,
          description: 'Require confirmation for high or critical risk actions',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'default:sol-suppress-notifications',
          type: 'other',
          severity: 'soft',
          active: true,
          description: 'Suppress non-critical notifications during deep work',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      constraintSets: [
        {
          id: 'default:system',
          name: 'System Defaults',
          description: 'Global system-level constraints',
          constraints: [],
          appliesTo: {},
          priority: 1000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'default:sol-mode',
          name: 'Sol Mode Defaults',
          description: 'Constraints for exploration and design work',
          constraints: [],
          appliesTo: { modes: [OrbMode.SOL] },
          priority: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };
    
    setData(mockData);
    setSelectedMode(mockData.currentMode);
    setSelectedPersona(mockData.currentPersona);
    setLoading(false);
  }, []);

  const handleModeChange = (newMode: OrbMode) => {
    setSelectedMode(newMode);
    // TODO: Call API to validate and apply mode transition
    console.log(`Mode change requested: ${data.currentMode} → ${newMode}`);
  };

  const handlePersonaChange = (newPersona: OrbPersona) => {
    setSelectedPersona(newPersona);
    // TODO: Call API to set persona override
    console.log(`Persona override set: ${newPersona}`);
  };

  const handleClearPersonaOverride = () => {
    setSelectedPersona(null);
    // TODO: Call API to clear persona override
    console.log('Persona override cleared');
  };

  const toggleConstraint = (constraintId: string) => {
    // TODO: Call API to toggle constraint
    console.log(`Toggle constraint: ${constraintId}`);
    setData(prev => ({
      ...prev,
      activeConstraints: prev.activeConstraints.map(c =>
        c.id === constraintId ? { ...c, active: !c.active } : c
      ),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-muted">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Preferences & Constraints</h2>
        <p className="mt-2 text-text-muted">
          Manage your mode, persona, and active constraints
        </p>
      </div>

      {/* Mode Section */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold">Current Mode</h3>
        <p className="mt-1 text-sm text-text-muted">
          Your operating mode determines behavior, layout, and active constraints
        </p>
        
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <label htmlFor="mode-select" className="text-sm font-medium text-text-muted">
              Select Mode:
            </label>
            <select
              id="mode-select"
              value={selectedMode}
              onChange={(e) => handleModeChange(e.target.value as OrbMode)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm"
            >
              {Object.values(OrbMode).map((mode) => (
                <option key={mode} value={mode}>
                  {getModeDisplayName(mode)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="rounded-lg bg-accent-sol/10 px-4 py-2">
            <p className="text-xs uppercase tracking-wider text-text-muted">Active</p>
            <p className="mt-1 text-lg font-semibold text-accent-sol">
              {getModeDisplayName(data.currentMode)}
            </p>
          </div>
        </div>
      </section>

      {/* Persona Section */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold">Current Persona</h3>
        <p className="mt-1 text-sm text-text-muted">
          Your persona influences prioritization and context
        </p>
        
        <div className="mt-4 space-y-4">
          {/* Classification Info */}
          {data.personaClassification && (
            <div className="rounded-lg bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Detected: {getPersonaDisplayName(data.personaClassification.persona)}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Confidence: {Math.round(data.personaClassification.confidence * 100)}%
                  </p>
                </div>
                {data.personaClassification.overridden && (
                  <span className="rounded-full bg-accent-luna/20 px-3 py-1 text-xs font-medium text-accent-luna">
                    Override Active
                  </span>
                )}
              </div>
              
              {/* Reasons */}
              {data.personaClassification.reasons.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-text-muted">Reasons:</p>
                  {data.personaClassification.reasons.map((reason, idx) => (
                    <p key={idx} className="text-xs text-text-muted">
                      • {reason}
                    </p>
                  ))}
                </div>
              )}
              
              {/* Distribution */}
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-text-muted">Distribution:</p>
                {Object.entries(data.personaClassification.distribution).map(([persona, weight]) => (
                  <div key={persona} className="flex items-center gap-2">
                    <span className="w-24 text-xs text-text-muted">
                      {getPersonaDisplayName(persona as OrbPersona)}:
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-accent-luna"
                        style={{ width: `${weight * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs text-text-muted">
                      {Math.round(weight * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Persona Override */}
          <div>
            <label htmlFor="persona-select" className="text-sm font-medium text-text-muted">
              Override Persona:
            </label>
            <div className="mt-2 flex gap-2">
              <select
                id="persona-select"
                value={selectedPersona ?? ''}
                onChange={(e) => {
                  if (e.target.value) {
                    handlePersonaChange(e.target.value as OrbPersona);
                  }
                }}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm"
              >
                <option value="">Auto-detect</option>
                {Object.values(OrbPersona).map((persona) => (
                  <option key={persona} value={persona}>
                    {getPersonaDisplayName(persona)}
                  </option>
                ))}
              </select>
              {selectedPersona && (
                <button
                  onClick={handleClearPersonaOverride}
                  className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Active Constraints Section */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold">Active Constraints</h3>
        <p className="mt-1 text-sm text-text-muted">
          These constraints are currently enforced based on your mode and persona
        </p>
        
        <div className="mt-4 space-y-3">
          {data.activeConstraints.map((constraint) => (
            <div
              key={constraint.id}
              className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <input
                type="checkbox"
                checked={constraint.active}
                onChange={() => toggleConstraint(constraint.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{constraint.description}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      constraint.severity === 'hard'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {constraint.severity}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-text-muted">
                    {constraint.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-muted">ID: {constraint.id}</p>
              </div>
            </div>
          ))}
          
          {data.activeConstraints.length === 0 && (
            <p className="text-center text-sm text-text-muted">No active constraints</p>
          )}
        </div>
      </section>

      {/* Constraint Sets Section */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold">Constraint Sets</h3>
        <p className="mt-1 text-sm text-text-muted">
          Organized collections of constraints that apply to different contexts
        </p>
        
        <div className="mt-4 space-y-3">
          {data.constraintSets.map((set) => (
            <div
              key={set.id}
              className="rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{set.name}</p>
                  <p className="mt-1 text-xs text-text-muted">{set.description}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                  Priority: {set.priority}
                </span>
              </div>
              
              {/* Applies To */}
              {(set.appliesTo.modes || set.appliesTo.personas) && (
                <div className="mt-3 flex gap-2 text-xs">
                  {set.appliesTo.modes && (
                    <div className="flex gap-1">
                      <span className="text-text-muted">Modes:</span>
                      <span className="font-medium">
                        {set.appliesTo.modes.map(m => getModeDisplayName(m)).join(', ')}
                      </span>
                    </div>
                  )}
                  {set.appliesTo.personas && (
                    <div className="flex gap-1">
                      <span className="text-text-muted">Personas:</span>
                      <span className="font-medium">
                        {set.appliesTo.personas.map(p => getPersonaDisplayName(p)).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {data.constraintSets.length === 0 && (
            <p className="text-center text-sm text-text-muted">No constraint sets configured</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Preferences;

