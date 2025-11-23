/**
 * Preferences View
 * 
 * Displays and allows editing of user preferences, constraints, and settings.
 */

import { useState, useEffect } from 'react';

// TODO: Import from @orb/core-orb once types are exported
type OrbMode = 'sol' | 'mars' | 'earth' | 'default' | 'explorer' | 'forge' | 'restaurant' | 'real_estate' | 'builder';
type OrbPersona = 'personal' | 'swl' | 'real_estate' | 'open_people';
type OrbDevice = 'sol' | 'luna' | 'mars' | 'earth';

interface Constraint {
  id: string;
  type: string;
  active: boolean;
  severity: 'warning' | 'error' | 'critical';
  description: string;
  reason?: string;
}

interface ConstraintSet {
  id: string;
  name: string;
  description?: string;
  constraints: Constraint[];
  priority: number;
}

interface PersonaClassificationResult {
  persona: OrbPersona;
  confidence: number;
  source: string;
  reasoning: string[];
  alternatives?: Array<{ persona: OrbPersona; confidence: number }>;
}

interface PreferencesState {
  mode: OrbMode;
  persona: OrbPersona;
  device: OrbDevice;
  constraintSets: ConstraintSet[];
  personaClassification: PersonaClassificationResult | null;
  isLoading: boolean;
  error: string | null;
}

const PreferencesView = () => {
  const [state, setState] = useState<PreferencesState>({
    mode: 'default',
    persona: 'personal',
    device: 'sol',
    constraintSets: [],
    personaClassification: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // TODO: Replace with actual API calls once backend is wired up
      // For now, simulate loading with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockConstraints: ConstraintSet[] = [
        {
          id: 'default-sol',
          name: 'sol-defaults',
          description: 'Default constraints for sol mode',
          priority: 50,
          constraints: [
            {
              id: 'constraint-1',
              type: 'max_risk',
              active: true,
              severity: 'critical',
              description: 'Prevent destructive actions',
              reason: 'Destructive actions are not allowed in this mode',
            },
            {
              id: 'constraint-2',
              type: 'require_confirmation',
              active: true,
              severity: 'warning',
              description: 'Actions require confirmation',
            },
          ],
        },
      ];
      
      const mockClassification: PersonaClassificationResult = {
        persona: 'personal',
        confidence: 0.85,
        source: 'device',
        reasoning: ['Sol/Luna devices typically used for design/development work'],
        alternatives: [
          { persona: 'open_people', confidence: 0.65 },
        ],
      };
      
      setState(prev => ({
        ...prev,
        mode: 'sol',
        persona: 'personal',
        device: 'sol',
        constraintSets: mockConstraints,
        personaClassification: mockClassification,
        isLoading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load preferences',
        isLoading: false,
      }));
    }
  };

  const handleModeChange = async (newMode: OrbMode) => {
    // TODO: Call mode transition validation API
    // const result = await validateModeTransition({ fromMode: state.mode, toMode: newMode, ... });
    // if (!result.allowed) { show error; return; }
    
    setState(prev => ({ ...prev, mode: newMode }));
    // TODO: Save to backend
  };

  const handlePersonaChange = async (newPersona: OrbPersona) => {
    setState(prev => ({ ...prev, persona: newPersona }));
    // TODO: Save to backend
  };

  const handleConstraintToggle = async (setId: string, constraintId: string) => {
    setState(prev => ({
      ...prev,
      constraintSets: prev.constraintSets.map(set =>
        set.id === setId
          ? {
              ...set,
              constraints: set.constraints.map(c =>
                c.id === constraintId ? { ...c, active: !c.active } : c
              ),
            }
          : set
      ),
    }));
    // TODO: Save to backend
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-muted">Loading preferences...</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6">
        <p className="text-red-400">Error: {state.error}</p>
        <button
          onClick={loadPreferences}
          className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/30"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Preferences & Constraints</h2>
        <p className="mt-2 text-text-muted">
          View and configure your current mode, persona, and active constraints.
        </p>
      </div>

      {/* Current Context */}
      <section className="rounded-xl bg-white/5 p-6 space-y-6">
        <h3 className="text-lg font-semibold">Current Context</h3>
        
        {/* Mode */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">Mode</label>
          <select
            value={state.mode}
            onChange={(e) => handleModeChange(e.target.value as OrbMode)}
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-sm focus:border-accent-orb focus:outline-none focus:ring-2 focus:ring-accent-orb/20"
          >
            <option value="default">Default · Auto</option>
            <option value="sol">Sol · Exploration</option>
            <option value="mars">Mars · Operations</option>
            <option value="earth">Earth · Personal</option>
            <option value="explorer">Explorer</option>
            <option value="forge">Forge</option>
            <option value="restaurant">Restaurant Focus</option>
            <option value="real_estate">Real Estate</option>
            <option value="builder">Builder</option>
          </select>
        </div>

        {/* Persona */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">Persona</label>
          <select
            value={state.persona}
            onChange={(e) => handlePersonaChange(e.target.value as OrbPersona)}
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-sm focus:border-accent-orb focus:outline-none focus:ring-2 focus:ring-accent-orb/20"
          >
            <option value="personal">Architect / Designer</option>
            <option value="swl">Restaurateur / Operator</option>
            <option value="real_estate">Real Estate Operator</option>
            <option value="open_people">Researcher / Writer</option>
          </select>
        </div>

        {/* Device */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">Device</label>
          <div className="rounded-lg bg-white/5 px-4 py-2 text-sm">
            {state.device.toUpperCase()} (read-only)
          </div>
          <p className="text-xs text-text-muted">Device is detected automatically</p>
        </div>
      </section>

      {/* Persona Classification */}
      {state.personaClassification && (
        <section className="rounded-xl bg-white/5 p-6 space-y-4">
          <h3 className="text-lg font-semibold">Persona Classification</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Detected Persona</span>
              <span className="font-medium">{state.personaClassification.persona}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Confidence</span>
              <span className="font-medium">
                {Math.round(state.personaClassification.confidence * 100)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Source</span>
              <span className="font-medium">{state.personaClassification.source}</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-text-muted">Reasoning</span>
            <ul className="space-y-1">
              {state.personaClassification.reasoning.map((reason, i) => (
                <li key={i} className="text-sm text-text-muted pl-4 border-l-2 border-white/10">
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {state.personaClassification.alternatives && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-text-muted">Alternatives</span>
              <div className="space-y-1">
                {state.personaClassification.alternatives.map((alt, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">{alt.persona}</span>
                    <span className="text-xs text-text-muted">
                      {Math.round(alt.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Active Constraints */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Active Constraints</h3>
        
        {state.constraintSets.length === 0 ? (
          <div className="rounded-xl bg-white/5 p-6 text-center text-text-muted">
            No constraints configured for current mode
          </div>
        ) : (
          <div className="space-y-4">
            {state.constraintSets.map((set) => (
              <div key={set.id} className="rounded-xl bg-white/5 p-6 space-y-4">
                <div>
                  <h4 className="font-semibold">{set.name}</h4>
                  {set.description && (
                    <p className="mt-1 text-sm text-text-muted">{set.description}</p>
                  )}
                  <p className="mt-1 text-xs text-text-muted">Priority: {set.priority}</p>
                </div>

                <div className="space-y-3">
                  {set.constraints.map((constraint) => (
                    <div
                      key={constraint.id}
                      className="flex items-start gap-4 rounded-lg bg-white/5 p-4"
                    >
                      <input
                        type="checkbox"
                        checked={constraint.active}
                        onChange={() => handleConstraintToggle(set.id, constraint.id)}
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-accent-orb focus:ring-2 focus:ring-accent-orb/20"
                      />
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{constraint.description}</span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                              constraint.severity === 'critical'
                                ? 'bg-red-500/20 text-red-300'
                                : constraint.severity === 'error'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {constraint.severity}
                          </span>
                        </div>
                        
                        <p className="text-xs text-text-muted">Type: {constraint.type}</p>
                        
                        {constraint.reason && (
                          <p className="text-xs text-text-muted italic">{constraint.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Info Box */}
      <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-6">
        <h4 className="font-semibold text-blue-300">About Constraints</h4>
        <p className="mt-2 text-sm text-blue-200/80">
          Constraints are rules that guide what actions can be performed in the system.
          They can block specific tools, limit risk levels, or require confirmation for sensitive actions.
          Constraints are automatically loaded based on your current mode and persona.
        </p>
      </div>
    </div>
  );
};

export default PreferencesView;

