import { useMemo } from "react";
import type { Pipeline } from "../types";
import { pipelines } from "../mocks/pipelines";

export function usePipeline(id: string): Pipeline | undefined {
  return useMemo(() => pipelines.find((pipeline) => pipeline.id === id), [id]);
}

