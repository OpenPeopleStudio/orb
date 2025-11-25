import clsx from 'clsx';
import type { ReactNode } from 'react';

interface DimensionalWindowProps {
  label?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  size?: 'base' | 'wide';
}

const DimensionalWindow = ({
  label = 'ORB · DIMENSIONAL GATEWAY',
  title = 'Approach the front door',
  subtitle = 'A calm airlock to the neural web.',
  children,
  size = 'base',
}: DimensionalWindowProps) => {
  const containerClass = clsx(
    'relative w-full rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent',
    'backdrop-blur-2xl shadow-[0_40px_140px_rgba(29,78,216,0.25)] transition-transform duration-500',
    'hover:border-white/20 hover:shadow-[0_50px_160px_rgba(29,78,216,0.3)]',
    size === 'wide' ? 'max-w-6xl px-10 py-12 md:px-14 md:py-16' : 'max-w-4xl px-8 py-10 md:px-12 md:py-14'
  );

  return (
    <section className={containerClass}>
      <div className="space-y-4 text-white/80">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">{label}</p>
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-base text-white/60 md:text-lg">{subtitle}</p> : null}
        </div>
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
};

export default DimensionalWindow;

