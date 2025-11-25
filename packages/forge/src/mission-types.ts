// packages/forge/src/mission-types.ts
// Types for mission processing and agent coordination

import type { PersonaBrief } from '@orb-system/core-luna';
import type { ActionPlan } from '@orb-system/core-mav';
import { OrbRole } from '@orb-system/core-orb';
import type { SolInsight } from '@orb-system/core-sol';
import type { Reflection } from '@orb-system/core-te';

export type MissionStatus = 
  | 'idle'
  | 'analyzing'      // Sol analyzing intent
  | 'reflecting'     // Te reflecting on context
  | 'planning'       // Mav creating action plan
  | 'adapting'       // Luna adjusting preferences
  | 'coordinating'   // Orb coordinating agents
  | 'ready'          // Mission plan ready
  | 'executing'      // Actions being executed
  | 'completed'      // Mission completed
  | 'error';         // Error occurred

export interface MissionPrompt {
  id: string;
  prompt: string;
  userId: string;
  sessionId: string;
  createdAt: string;
}

export interface AgentResponse {
  role: OrbRole;
  status: 'idle' | 'processing' | 'complete' | 'error';
  timestamp: string;
  data?: unknown;
  error?: string;
}

export interface SolResponse extends AgentResponse {
  role: OrbRole.SOL;
  data?: SolInsight;
}

export interface TeResponse extends AgentResponse {
  role: OrbRole.TE;
  data?: Reflection;
}

export interface MavResponse extends AgentResponse {
  role: OrbRole.MAV;
  data?: ActionPlan;
}

export interface LunaResponse extends AgentResponse {
  role: OrbRole.LUNA;
  data?: PersonaBrief;
}

export interface OrbResponse extends AgentResponse {
  role: OrbRole.ORB;
  data?: {
    coordination: string;
    nextSteps: string[];
    blockers?: string[];
  };
}

export type AnyAgentResponse = 
  | SolResponse 
  | TeResponse 
  | MavResponse 
  | LunaResponse 
  | OrbResponse;

export interface MissionState {
  mission: MissionPrompt;
  status: MissionStatus;
  agents: {
    sol?: SolResponse;
    te?: TeResponse;
    mav?: MavResponse;
    luna?: LunaResponse;
    orb?: OrbResponse;
  };
  timeline: Array<{
    timestamp: string;
    agent: OrbRole;
    event: string;
    details?: string;
  }>;
  startedAt?: string;
  completedAt?: string;
}

export interface MissionProcessingOptions {
  userId: string;
  sessionId?: string;
  sequential?: boolean;  // If true, agents run in sequence; if false, in parallel
  includeAgents?: OrbRole[];  // Which agents to include (default: all)
}

export interface MissionResult {
  mission: MissionPrompt;
  state: MissionState;
  success: boolean;
  error?: string;
}

