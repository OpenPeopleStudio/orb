import type { MissionResult, MissionState } from '@orb-system/forge';

const DEFAULT_BASE_URL = import.meta.env.DEV ? 'http://localhost:4310' : '/api';
const RAW_BASE_URL = (import.meta.env.VITE_MISSION_SERVICE_URL ?? DEFAULT_BASE_URL).trim();
const NORMALIZED_BASE =
  RAW_BASE_URL === ''
    ? ''
    : RAW_BASE_URL.endsWith('/')
      ? RAW_BASE_URL.slice(0, -1)
      : RAW_BASE_URL;

const buildUrl = (path: string) => {
  if (!NORMALIZED_BASE) {
    return path;
  }

  if (NORMALIZED_BASE.startsWith('http')) {
    return `${NORMALIZED_BASE}${path}`;
  }

  return `${NORMALIZED_BASE}${path}`;
};

export interface MissionStreamOptions {
  prompt: string;
  userId: string;
  sessionId?: string;
  signal?: AbortSignal;
  onUpdate: (state: MissionState) => void;
}

interface ParsedSseEvent {
  event: string;
  data?: string;
}

const parseSseChunk = (chunk: string): ParsedSseEvent => {
  const lines = chunk.split('\n');
  const dataLines: string[] = [];
  let event = 'message';

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  return {
    event,
    data: dataLines.length > 0 ? dataLines.join('\n') : undefined,
  };
};

export async function streamMission(options: MissionStreamOptions): Promise<MissionResult | null> {
  const response = await fetch(buildUrl('/missions/stream'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: options.prompt,
      userId: options.userId,
      sessionId: options.sessionId,
    }),
    signal: options.signal,
  });

  if (!response.ok || !response.body) {
    throw new Error('Failed to start mission stream');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let finalResult: MissionResult | null = null;

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

    let separatorIndex: number;
    while ((separatorIndex = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, separatorIndex).trim();
      buffer = buffer.slice(separatorIndex + 2);

      if (!rawEvent) {
        continue;
      }

      const parsed = parseSseChunk(rawEvent);

      if (parsed.event === 'error') {
        const payload = parsed.data ? JSON.parse(parsed.data) : { message: 'Mission stream error' };
        throw new Error(payload.message ?? 'Mission stream error');
      }

      if (parsed.event === 'result' && parsed.data) {
        finalResult = JSON.parse(parsed.data) as MissionResult;
        continue;
      }

      if (parsed.event === 'end') {
        return finalResult;
      }

      if (parsed.data) {
        const update = JSON.parse(parsed.data) as MissionState;
        options.onUpdate(update);
      }
    }

    if (done) {
      break;
    }
  }

  return finalResult;
}


