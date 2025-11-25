import { useMemo } from 'react';

interface OrbPresenceProps {
  persona?: string;
  status?: 'listening' | 'ready' | 'syncing';
  message?: string;
  signatureHue?: number;
  streamText?: string;
  isStreaming?: boolean;
}

const STATUS_COPY: Record<NonNullable<OrbPresenceProps['status']>, string> = {
  listening: 'listening for your cadence',
  ready: 'stabilized and online',
  syncing: 'synchronizing systems',
};

const OrbPresence = ({
  persona = 'Luna',
  status = 'listening',
  message = 'The shell is aware. Approach when you are ready.',
  signatureHue = 210,
  streamText = '',
  isStreaming = false,
}: OrbPresenceProps) => {
  const gradientStyle = useMemo(
    () => ({
      background: `radial-gradient(circle at 30% 20%, hsla(${signatureHue}, 90%, 70%, 0.35), transparent 60%),
        linear-gradient(135deg, hsla(${signatureHue}, 80%, 65%, 0.25), hsla(${(signatureHue + 60) % 360}, 80%, 65%, 0.2))`,
      boxShadow: `0 0 120px hsla(${signatureHue}, 70%, 65%, 0.25)`,
    }),
    [signatureHue]
  );

  const waveHeights = useMemo(() => [32, 58, 44, 66, 36], []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 text-white/80 md:p-6">
      <div className="absolute inset-0 opacity-70 blur-3xl" style={gradientStyle} />
      <div className="relative flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/40">
            <div className="absolute inset-0 rounded-full border border-white/10 blur-md" />
            <div className="flex h-8 w-8 items-end justify-center gap-1">
              {waveHeights.map((height, index) => (
                <span
                  key={index}
                  className="w-1 rounded bg-white/80"
                  style={{
                    height: `${height}%`,
                    animation: status === 'listening' ? 'pulse 1.6s ease-in-out infinite' : 'pulse 2.6s ease-in-out infinite',
                    animationDelay: `${index * 0.12}s`,
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">AI presence · {persona}</p>
            <p className="text-lg font-semibold text-white">{message}</p>
            <p className="text-sm text-white/60">Status: {STATUS_COPY[status]}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/70">
          <p>“Every entrance remembers you. The gateway tunes itself from your prior traces.”</p>
        </div>
        <div
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white/80"
          aria-live="polite"
        >
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/50">
            <span>Live stream</span>
            <span
              className={`h-2 w-2 rounded-full ${
                isStreaming ? 'bg-green-400 animate-pulse' : 'bg-white/30'
              }`}
            />
          </div>
          <p className="whitespace-pre-line text-white/80">{streamText || '...'}</p>
        </div>
      </div>
    </div>
  );
};

export default OrbPresence;

