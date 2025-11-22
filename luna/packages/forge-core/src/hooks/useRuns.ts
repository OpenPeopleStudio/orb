import { useMemo } from "react";
import type { Run } from "../types";
import { runs } from "../mocks/runs";

export interface UseRunsResult {
  data: Run[];
  isLoading: boolean;
  error: Error | null;
}

export function useRuns(): UseRunsResult {
  return useMemo(
    () => ({
      data: runs,
      isLoading: false,
      error: null,
    }),
    []
  );
}

