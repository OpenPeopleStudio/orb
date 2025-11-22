import { useMemo } from "react";
import type { Agent } from "../types";
import { agents } from "../mocks/agents";

export function useAgent(id: string): Agent | undefined {
  return useMemo(() => agents.find((agent) => agent.id === id), [id]);
}

