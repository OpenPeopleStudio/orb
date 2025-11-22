import type { Run } from "../types";

const now = Date.now();

export const runs: Run[] = [
  // Full Stack Feature Pipeline runs
  {
    id: "run-001",
    pipelineId: "pipeline-full-stack-001",
    status: "succeeded",
    startedAt: new Date(now - 7200000).toISOString(), // 2 hours ago
    durationMs: 180000, // 3 minutes
    trigger: "manual",
  },
  {
    id: "run-002",
    pipelineId: "pipeline-full-stack-001",
    status: "succeeded",
    startedAt: new Date(now - 86400000).toISOString(), // 1 day ago
    durationMs: 165000, // 2.75 minutes
    trigger: "schedule",
  },
  {
    id: "run-003",
    pipelineId: "pipeline-full-stack-001",
    status: "failed",
    startedAt: new Date(now - 172800000).toISOString(), // 2 days ago
    durationMs: 45000, // 45 seconds
    trigger: "webhook",
  },
  {
    id: "run-004",
    pipelineId: "pipeline-full-stack-001",
    status: "queued",
    startedAt: new Date(now - 300000).toISOString(), // 5 minutes ago
    trigger: "manual",
  },
  // Quick Development Pipeline runs
  {
    id: "run-005",
    pipelineId: "pipeline-quick-dev-001",
    status: "running",
    startedAt: new Date(now - 120000).toISOString(), // 2 minutes ago
    trigger: "webhook",
  },
  {
    id: "run-006",
    pipelineId: "pipeline-quick-dev-001",
    status: "succeeded",
    startedAt: new Date(now - 3600000).toISOString(), // 1 hour ago
    durationMs: 90000, // 1.5 minutes
    trigger: "manual",
  },
  {
    id: "run-007",
    pipelineId: "pipeline-quick-dev-001",
    status: "succeeded",
    startedAt: new Date(now - 7200000).toISOString(), // 2 hours ago
    durationMs: 85000, // 1.4 minutes
    trigger: "schedule",
  },
  {
    id: "run-008",
    pipelineId: "pipeline-quick-dev-001",
    status: "succeeded",
    startedAt: new Date(now - 10800000).toISOString(), // 3 hours ago
    durationMs: 95000, // 1.6 minutes
    trigger: "manual",
  },
  // Quality Assurance Pipeline runs
  {
    id: "run-009",
    pipelineId: "pipeline-quality-001",
    status: "succeeded",
    startedAt: new Date(now - 86400000).toISOString(), // 1 day ago
    durationMs: 420000, // 7 minutes
    trigger: "schedule",
  },
  {
    id: "run-010",
    pipelineId: "pipeline-quality-001",
    status: "failed",
    startedAt: new Date(now - 259200000).toISOString(), // 3 days ago
    durationMs: 120000, // 2 minutes
    trigger: "manual",
  },
  {
    id: "run-011",
    pipelineId: "pipeline-quality-001",
    status: "succeeded",
    startedAt: new Date(now - 604800000).toISOString(), // 1 week ago
    durationMs: 400000, // 6.7 minutes
    trigger: "schedule",
  },
  // Code Review Pipeline runs
  {
    id: "run-012",
    pipelineId: "pipeline-review-001",
    status: "failed",
    startedAt: new Date(now - 1800000).toISOString(), // 30 minutes ago
    durationMs: 35000, // 35 seconds
    trigger: "webhook",
  },
  {
    id: "run-013",
    pipelineId: "pipeline-review-001",
    status: "succeeded",
    startedAt: new Date(now - 14400000).toISOString(), // 4 hours ago
    durationMs: 55000, // 55 seconds
    trigger: "manual",
  },
  {
    id: "run-014",
    pipelineId: "pipeline-review-001",
    status: "succeeded",
    startedAt: new Date(now - 43200000).toISOString(), // 12 hours ago
    durationMs: 60000, // 1 minute
    trigger: "webhook",
  },
  {
    id: "run-015",
    pipelineId: "pipeline-full-stack-001",
    status: "running",
    startedAt: new Date(now - 60000).toISOString(), // 1 minute ago
    trigger: "schedule",
  },
];

