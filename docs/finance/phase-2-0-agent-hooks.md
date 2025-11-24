# Phase 2.0 — Agent-Ready Hooks

No AI behavior yet; just ensure the system is structurally ready for future agents without schema or API churn.

## Objectives

- Extend schema and APIs to store suggestions and expose context bundles.
- Emit events when meaningful finance actions occur.
- Document agent contracts so future agents can plug in quickly.

## Deliverables

### 1. Schema Extensions

- `transactions` gains `category_suggestion`, `tags_suggestion`, `intent_suggestion`.
- Optional `suggested_by` metadata for auditability.
- Ensure suggestions do not override confirmed data; UI can display them later.

### 2. Event Emission

- Publish events (internal bus or simple webhook):
  - `transactions.created`
  - `transactions.updated` (optional)
  - `review_session.completed`
- Payloads include minimal yet sufficient context for agents (transaction ids, account, amount, state).

### 3. Agent Contracts Documentation

- In `docs/finance/orb-finance-agents.md` (or similar) define:
  - `ImportAgent` interface: shape of ingest payload, expectations.
  - `CategorizationAgent` interface: inputs (transactions needing category), outputs (suggestions API contract).
  - `ReviewCoachAgent` interface: data needed (last week’s transactions + review note), expected response schema.
- Include rate limits, auth expectations, and failure handling guidelines.

### 4. Backend Endpoints

- `POST /agents/finance/categorization/suggestions`
  - Accepts array of transaction suggestions.
  - Validates transaction ids, writes suggestion fields without flipping confirmed data.
- `GET /agents/finance/review/context?period=last_week`
  - Returns curated dataset: transactions, misaligned counts, last review session note.
- Consider `/agents/finance/import/context` if CSV import agent will need standardized mappings later.

### 5. Logging & Observability

- Basic audit log for agent writes (who wrote what, when).
- Metrics for number of suggestions per day, acceptance rate (for later).

## Definition of Done

- Future agents can be implemented purely in code, using the documented contracts, without touching core finance tables or UI.
- Events fire consistently for new transactions and review completions.
- Suggestions fields exist and can be read/written even if UI ignores them for now.

## Suggested Vertical Slices

1. **Schema + Suggestions** — add new columns, migration, tests.
2. **Event Bus** — emit events on transaction creation + review completion.
3. **Agent Contracts & Endpoints** — document interfaces, build suggestion POST + review context GET.

