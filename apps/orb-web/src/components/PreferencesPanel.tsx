import { useEffect, useMemo, useState } from 'react';
import { OrbPersona, getPersonaDisplayName } from '@orb-system/core-orb';

import { usePreferences } from '../hooks/usePreferences';

const personaOptions = [
  { id: 'auto', label: 'Auto detect' },
  ...Object.values(OrbPersona).map((persona) => ({
    id: persona,
    label: getPersonaDisplayName(persona),
  })),
];

const severityColorMap: Record<string, string> = {
  block: 'text-red-400 bg-red-400/10 border-red-400/40',
  warn: 'text-yellow-300 bg-yellow-300/10 border-yellow-300/40',
  info: 'text-cyan-300 bg-cyan-300/10 border-cyan-300/40',
};

const PreferencesPanel = () => {
  const { data, loading, error, updatePersonaOverride, refresh } = usePreferences();
  const [selectedPersona, setSelectedPersona] = useState<string>('auto');

  useEffect(() => {
    if (!data) return;
    setSelectedPersona(data.persona.override ?? 'auto');
  }, [data]);

  const constraints = useMemo(() => data?.constraints ?? [], [data]);

  const handlePersonaChange = async (value: string) => {
    setSelectedPersona(value);
    const override = value === 'auto' ? null : value;
    await updatePersonaOverride(override);
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Preferences</p>
          <h2 className="text-2xl font-semibold">Mode & Persona Guard Rails</h2>
        </div>
        <button
          onClick={refresh}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-text-muted hover:text-text-primary"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <p className="text-sm text-text-muted">Loading preferences...</p>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-8">
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Current Mode</p>
              <h3 className="text-2xl font-semibold">{data.mode}</h3>
              <p className="mt-2 text-sm text-text-muted">
                Persona confidence {Math.round(data.persona.confidence * 100)}% · Source: {data.persona.source}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <label className="text-xs uppercase tracking-[0.3em] text-text-muted">
                Persona Override
              </label>
              <select
                value={selectedPersona}
                onChange={(event) => handlePersonaChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-bg-surface/70 px-4 py-2 text-base text-text-primary outline-none focus:border-accent-orb"
              >
                {personaOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-text-muted">
                Auto-detect keeps classification transparent; overriding locks the persona until cleared.
              </p>
            </div>
          </section>

          <section>
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
              Preference Preset
            </p>
            <h3 className="text-xl font-semibold">Active Preferences</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {data.preferences.map((preference) => (
                <li key={preference} className="rounded-full border border-white/10 px-3 py-1 text-sm text-text-primary">
                  {preference}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Constraints</p>
                <h3 className="text-xl font-semibold">Active Constraint Sets</h3>
              </div>
            </div>
            <div className="space-y-4">
              {constraints.map((set) => (
                <div key={set.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">{set.label}</h4>
                      <p className="text-xs uppercase tracking-widest text-text-muted">{set.scope}</p>
                    </div>
                    <span className="text-sm text-text-muted">
                      {set.constraintCount} guard rails
                    </span>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {set.constraints.map((constraint) => (
                      <li
                        key={constraint.id}
                        className="rounded-lg border border-white/10 bg-white/5 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{constraint.label}</span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${severityColorMap[constraint.severity] || 'text-text-muted border-white/10'}`}
                          >
                            {constraint.severity.toUpperCase()}
                          </span>
                        </div>
                        {constraint.description && (
                          <p className="mt-1 text-xs text-text-muted">{constraint.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default PreferencesPanel;


