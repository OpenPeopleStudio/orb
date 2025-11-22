import { useMemo } from "react";
import type { Run } from "../types";
import { runs } from "../mocks/runs";

export function useRun(id: string): Run | undefined {
  return useMemo(() => runs.find((run) => run.id === id), [id]);
}

