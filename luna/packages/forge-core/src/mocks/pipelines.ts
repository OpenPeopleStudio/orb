import type { Pipeline } from "../types";

export const pipelines: Pipeline[] = [
  {
    id: "pipeline-full-stack-001",
    name: "Full Stack Feature Pipeline",
    description: "Complete workflow from code generation to deployment",
    steps: [
      {
        id: "step-codegen",
        index: 0,
        agentId: "agent-codegen-001",
        name: "Generate code",
        description: "Generate new feature code based on requirements",
      },
      {
        id: "step-lint",
        index: 1,
        agentId: "agent-linter-001",
        name: "Lint and format",
        description: "Lint and format the generated code",
      },
      {
        id: "step-test",
        index: 2,
        agentId: "agent-test-001",
        name: "Run tests",
        description: "Generate and run test suites",
      },
      {
        id: "step-refine",
        index: 3,
        agentId: "agent-refiner-001",
        name: "Summarize changes",
        description: "Review and summarize the changes made",
      },
    ],
    lastRunStatus: "succeeded",
  },
  {
    id: "pipeline-quick-dev-001",
    name: "Quick Development Pipeline",
    description: "Fast iteration pipeline for rapid development",
    steps: [
      {
        id: "step-quick-codegen",
        index: 0,
        agentId: "agent-codegen-001",
        name: "Generate code",
        description: "Quick code generation",
      },
      {
        id: "step-quick-test",
        index: 1,
        agentId: "agent-test-001",
        name: "Run tests",
        description: "Run basic test suite",
      },
    ],
    lastRunStatus: "running",
  },
  {
    id: "pipeline-quality-001",
    name: "Quality Assurance Pipeline",
    description: "Comprehensive quality check including security and documentation",
    steps: [
      {
        id: "step-qa-lint",
        index: 0,
        agentId: "agent-linter-001",
        name: "Lint and format",
        description: "Comprehensive linting",
      },
      {
        id: "step-qa-security",
        index: 1,
        agentId: "agent-security-001",
        name: "Security scan",
        description: "Scan for security vulnerabilities",
      },
      {
        id: "step-qa-test",
        index: 2,
        agentId: "agent-test-001",
        name: "Run tests",
        description: "Execute full test suite",
      },
      {
        id: "step-qa-docs",
        index: 3,
        agentId: "agent-docs-001",
        name: "Update documentation",
        description: "Generate and update documentation",
      },
    ],
    lastRunStatus: "succeeded",
  },
  {
    id: "pipeline-review-001",
    name: "Code Review Pipeline",
    description: "Automated code review and refinement workflow",
    steps: [
      {
        id: "step-review-refine",
        index: 0,
        agentId: "agent-refiner-001",
        name: "Review code",
        description: "Comprehensive code review",
      },
      {
        id: "step-review-summarize",
        index: 1,
        agentId: "agent-refiner-001",
        name: "Summarize changes",
        description: "Summarize review findings and recommendations",
      },
    ],
    lastRunStatus: "failed",
  },
];

