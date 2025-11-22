export type AgentStatus = "draft" | "active" | "paused";

export interface AgentCapability {
  id: string;
  label: string;
  description: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string; // e.g. "Codegen Worker", "Refiner", "Supervisor"
  status: AgentStatus;
  model: string; // e.g. "gpt-5.1-thinking", "gpt-4.1-mini"
  description: string;
  tags: string[];
  capabilities: AgentCapability[];
}

export type RunStatus = "queued" | "running" | "succeeded" | "failed";

export type RunTrigger = "manual" | "schedule" | "webhook";

export interface PipelineStep {
  id: string;
  index: number;
  agentId: string;
  name: string;
  description?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  steps: PipelineStep[];
  lastRunStatus?: RunStatus;
}

export interface Run {
  id: string;
  pipelineId: string;
  status: RunStatus;
  startedAt: string; // ISO string
  durationMs?: number;
  trigger: RunTrigger;
}

