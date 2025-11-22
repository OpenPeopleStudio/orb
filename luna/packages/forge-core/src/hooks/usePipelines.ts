import { useMemo } from "react";
import type { Pipeline } from "../types";
import { pipelines } from "../mocks/pipelines";

export interface UsePipelinesResult {
  data: Pipeline[];
  isLoading: boolean;
  error: Error | null;
}

export function usePipelines(): UsePipelinesResult {
  return useMemo(
    () => ({
      data: pipelines,
      isLoading: false,
      error: null,
    }),
    []
  );
}

