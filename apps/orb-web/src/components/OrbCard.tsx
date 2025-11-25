import clsx from 'clsx';

import { type OrbRuntime } from '@orb-system/forge';

import { roleOrder } from '../shims/core-orb';

const accentClassMap: Record<(typeof roleOrder)[number], string> = {
  orb: 'text-accent-orb',
  sol: 'text-accent-sol',
  te: 'text-accent-te',
  mav: 'text-accent-mav',
  luna: 'text-accent-luna',
  forge: 'text-accent-forge',
};

interface Props {
  runtime: OrbRuntime;
}

const OrbCard = ({ runtime }: Props) => {
  const accentClass = accentClassMap[runtime.role];
  const activeInsight = runtime.insights[runtime.insights.length - 1];
  const plan = runtime.plan([
    'Stabilize mission narrative',
    'Prep automation hooks',
    'Review UX touchpoints',
  ]);

  return (
    <article className="glow-card flex flex-col gap-4 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className={clsx('text-sm uppercase tracking-[0.3em]', accentClass)}>{runtime.role}</p>
          <h2 className="text-2xl font-semibold">{runtime.persona.title}</h2>
        </div>
        <span className={clsx('text-xs font-semibold uppercase text-text-muted', accentClass)}>
          {runtime.persona.voice} voice
        </span>
      </div>
      {activeInsight && (
        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
          <p className="text-sm text-text-muted">Insight</p>
          <p className="text-lg font-medium">{activeInsight.summary}</p>
        </div>
      )}
      <ul className="space-y-2 text-sm">
        {plan.actions.slice(0, 3).map((action) => (
          <li key={action.id} className="flex items-center justify-between text-text-muted">
            <span>{action.summary}</span>
            <span className={clsx('text-xs font-semibold', accentClass)}>
              {action.etaMinutes}m · {action.status}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
};

export default OrbCard;
