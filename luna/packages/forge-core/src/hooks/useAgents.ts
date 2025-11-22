import { useMemo } from "react";
import type { Agent } from "../types";
import { agents } from "../mocks/agents";

export interface UseAgentsResult {
  data: Agent[];
  isLoading: boolean;
  error: Error | null;
}

export function useAgents(): UseAgentsResult {
  return useMemo(
    () => ({
      data: agents,
      isLoading: false,
      error: null,
    }),
    []
  );
}

