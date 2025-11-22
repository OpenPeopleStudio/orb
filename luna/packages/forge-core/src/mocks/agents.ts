import type { Agent } from "../types";

export const agents: Agent[] = [
  {
    id: "agent-codegen-001",
    name: "Codegen Worker Alpha",
    role: "Codegen Worker",
    status: "active",
    model: "gpt-5.1-thinking",
    description: "Primary code generation agent for creating new features and components",
    tags: ["codegen", "frontend", "typescript"],
    capabilities: [
      {
        id: "cap-001",
        label: "TypeScript Generation",
        description: "Generates TypeScript code following best practices",
      },
      {
        id: "cap-002",
        label: "Component Creation",
        description: "Creates React components with proper structure",
      },
    ],
  },
  {
    id: "agent-refiner-001",
    name: "Code Refiner Beta",
    role: "Refiner",
    status: "active",
    model: "gpt-4.1-mini",
    description: "Reviews and refines generated code for quality and consistency",
    tags: ["refinement", "quality", "review"],
    capabilities: [
      {
        id: "cap-003",
        label: "Code Review",
        description: "Reviews code for bugs, style, and best practices",
      },
      {
        id: "cap-004",
        label: "Optimization",
        description: "Optimizes code for performance and readability",
      },
    ],
  },
  {
    id: "agent-test-001",
    name: "Test Runner Gamma",
    role: "Test Runner",
    status: "active",
    model: "gpt-4.1-mini",
    description: "Generates and executes comprehensive test suites",
    tags: ["testing", "automation", "quality"],
    capabilities: [
      {
        id: "cap-005",
        label: "Test Generation",
        description: "Generates unit and integration tests",
      },
      {
        id: "cap-006",
        label: "Test Execution",
        description: "Executes tests and reports results",
      },
    ],
  },
  {
    id: "agent-supervisor-001",
    name: "Supervisor Delta",
    role: "Supervisor",
    status: "active",
    model: "gpt-5.1-thinking",
    description: "Orchestrates pipeline execution and coordinates agent workflows",
    tags: ["orchestration", "coordination", "supervision"],
    capabilities: [
      {
        id: "cap-007",
        label: "Workflow Orchestration",
        description: "Orchestrates multi-agent workflows",
      },
      {
        id: "cap-008",
        label: "Decision Making",
        description: "Makes high-level decisions about pipeline execution",
      },
    ],
  },
  {
    id: "agent-docs-001",
    name: "Documentation Epsilon",
    role: "Documentation Writer",
    status: "draft",
    model: "gpt-4.1-mini",
    description: "Generates and maintains project documentation",
    tags: ["documentation", "markdown", "writing"],
    capabilities: [
      {
        id: "cap-009",
        label: "Documentation Generation",
        description: "Generates API documentation and guides",
      },
      {
        id: "cap-010",
        label: "Content Writing",
        description: "Writes clear, comprehensive documentation",
      },
    ],
  },
  {
    id: "agent-security-001",
    name: "Security Scanner Zeta",
    role: "Security Scanner",
    status: "paused",
    model: "gpt-4.1-mini",
    description: "Scans code for security vulnerabilities and compliance issues",
    tags: ["security", "compliance", "scanning"],
    capabilities: [
      {
        id: "cap-011",
        label: "Vulnerability Scanning",
        description: "Identifies security vulnerabilities in code",
      },
      {
        id: "cap-012",
        label: "Compliance Checking",
        description: "Checks code against security standards",
      },
    ],
  },
  {
    id: "agent-linter-001",
    name: "Linter Eta",
    role: "Code Linter",
    status: "active",
    model: "gpt-4.1-mini",
    description: "Lints and formats code according to project standards",
    tags: ["linting", "formatting", "standards"],
    capabilities: [
      {
        id: "cap-013",
        label: "Code Linting",
        description: "Lints code for style and quality issues",
      },
      {
        id: "cap-014",
        label: "Code Formatting",
        description: "Formats code according to style guides",
      },
    ],
  },
  {
    id: "agent-deploy-001",
    name: "Deployment Theta",
    role: "Deployment Agent",
    status: "draft",
    model: "gpt-4.1-mini",
    description: "Handles deployment automation and rollback procedures",
    tags: ["deployment", "devops", "automation"],
    capabilities: [
      {
        id: "cap-015",
        label: "Deployment Automation",
        description: "Automates deployment processes",
      },
      {
        id: "cap-016",
        label: "Rollback Management",
        description: "Manages rollback procedures when needed",
      },
    ],
  },
];

