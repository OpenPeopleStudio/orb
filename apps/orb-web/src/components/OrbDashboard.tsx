import { useMemo, useState } from 'react';

import { roleOrder } from '@orb-system/core-orb';
import { buildOrbRuntime } from '@orb-system/forge';

import OrbCard from './OrbCard';

const seedSignals: Record<(typeof roleOrder)[number], string[]> = {
  orb: ['Mission timeline slipping three days.'],
  sol: ['Story arc needs clarity around automation.'],
  te: ['Reflection buffer ready for ingestion.'],
  mav: ['Automation graph waiting for operator approval.'],
  luna: ['Persona feedback leaning toward warmth.'],
  forge: ['Shell layout ready for QA.'],
};

const OrbDashboard = () => {
  const [missionPrompt, setMissionPrompt] = useState('Ship the November Orb drop');

  const runtimes = useMemo(() => {
    return roleOrder.map((role) => {
      const runtime = buildOrbRuntime(role);
      [...(seedSignals[role] ?? []), missionPrompt].forEach((signal) => runtime.addSignal(signal));
      return runtime;
    });
  }, [missionPrompt]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
        <label className="text-xs uppercase tracking-[0.3em] text-text-muted" htmlFor="prompt">
          mission prompt
        </label>
        <input
          id="prompt"
          value={missionPrompt}
          onChange={(event) => setMissionPrompt(event.target.value)}
          className="mt-3 w-full rounded-xl border border-white/10 bg-bg-surface/70 px-4 py-3 text-base text-text-primary outline-none focus:border-accent-orb"
          placeholder="Describe what Orb should solve"
        />
        <p className="mt-2 text-sm text-text-muted">
          The prompt feeds every runtime, driving Sol insights, Te reflections, and Mav action plans.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {runtimes.map((runtime) => (
          <OrbCard key={runtime.role} runtime={runtime} />
        ))}
      </div>
    </div>
  );
};

export default OrbDashboard;
