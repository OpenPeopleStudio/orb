import { useEffect, useMemo, useRef, useState } from 'react';

interface PresenceStreamOptions {
  persona: string;
  displayName: string;
  seed: string;
  enabled?: boolean;
}

export interface PresenceStreamState {
  text: string;
  isStreaming: boolean;
}

export function useOrbPresenceStream({
  persona,
  displayName,
  seed,
  enabled = true,
}: PresenceStreamOptions): PresenceStreamState {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const script = useMemo(
    () => buildPresenceScript({ persona, displayName, seed }),
    [persona, displayName, seed]
  );

  useEffect(() => {
    if (!enabled) {
      setText('');
      setIsStreaming(false);
      return;
    }

    let cancelled = false;
    let index = 0;

    const tick = () => {
      if (cancelled) {
        return;
      }

      if (index >= script.length) {
        setIsStreaming(false);
        return;
      }

      setText((prev) => prev + script[index]);
      index += 1;
      const delay = 35 + (index % 7) * 12;
      timeoutRef.current = window.setTimeout(tick, delay);
    };

    setText('');
    setIsStreaming(true);
    timeoutRef.current = window.setTimeout(tick, 80);

    return () => {
      cancelled = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, script]);

  return { text, isStreaming };
}

function buildPresenceScript({
  persona,
  displayName,
  seed,
}: {
  persona: string;
  displayName: string;
  seed: string;
}): string {
  const phrases = selectScript(seed);
  const resolved = phrases
    .map((phrase) =>
      phrase
        .replace('{persona}', persona)
        .replace('{name}', displayName)
        .replace('{vector}', vectorFromSeed(seed))
    )
    .join(' ');

  return `${resolved} `;
}

const SCRIPTS = [
  [
    '{persona} signal steady.',
    'Tracing boundary layers for {name}.',
    'Vector {vector} glows softly.',
  ],
  [
    '{persona} senses micro-changes in your cadence, {name}.',
    'Entropy remains calm.',
    'Vector {vector} is synced.',
  ],
  [
    'Front door aurora calibrated.',
    '{persona} hums in the background.',
    'Vector {vector} is shimmering for {name}.',
  ],
];

function selectScript(seed: string): string[] {
  const hash = simpleHash(seed);
  return SCRIPTS[hash % SCRIPTS.length] ?? SCRIPTS[0];
}

function vectorFromSeed(seed: string): string {
  const hash = simpleHash(seed).toString(16).padStart(4, '0');
  return `θ-${hash.slice(0, 2)}.${hash.slice(2)}`;
}

function simpleHash(value: string): number {
  return value.split('').reduce((acc, char) => {
    acc = (acc << 5) - acc + char.charCodeAt(0);
    return acc & acc;
  }, 0);
}

