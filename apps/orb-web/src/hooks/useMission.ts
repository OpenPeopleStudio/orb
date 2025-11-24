/**
 * React hook for mission processing
 * Provides real-time updates as agents process the mission
 */

import { useState, useCallback, useRef } from 'react';
import { processMissionStream, type MissionState, type MissionResult } from '@orb-system/forge';
import { saveMission } from '../lib/mission-storage';

interface UseMissionOptions {
  userId: string;
  sessionId?: string;
  autoSave?: boolean;  // Auto-save to history (default: true)
}

interface UseMissionReturn {
  state: MissionState | null;
  isProcessing: boolean;
  error: string | null;
  processMission: (prompt: string) => Promise<void>;
  reset: () => void;
}

export function useMission(options: UseMissionOptions): UseMissionReturn {
  const [state, setState] = useState<MissionState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const autoSave = options.autoSave !== false; // Default to true

  const processMission = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      setError('Mission prompt cannot be empty');
      return;
    }

    // Cancel any existing processing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsProcessing(true);
    setError(null);
    setState(null);

    let finalResult: MissionResult | null = null;

    try {
      const stream = processMissionStream(prompt, {
        userId: options.userId,
        sessionId: options.sessionId,
      });

      // Process each update from the stream
      for await (const update of stream) {
        if (abortControllerRef.current.signal.aborted) {
          break;
        }
        setState(update);
        
        // Capture the final result
        if ('success' in update) {
          finalResult = update as unknown as MissionResult;
        }
      }

      // Auto-save to history if enabled
      if (autoSave && finalResult) {
        saveMission(finalResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('[useMission] Error processing mission:', err);
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [options.userId, options.sessionId, autoSave]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(null);
    setIsProcessing(false);
    setError(null);
  }, []);

  return {
    state,
    isProcessing,
    error,
    processMission,
    reset,
  };
}

