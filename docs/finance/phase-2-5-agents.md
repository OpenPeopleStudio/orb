# Phase 2.5 — First Agents (Suggest & Coach)

Introduce low-risk AI helpers: auto-suggest categories/tags and provide light weekly coaching. Humans stay in control via “apply” flows.

## Objectives

- Build `CategorizationAgent v1` to pre-fill suggestions for uncategorized transactions.
- Build `ReviewCoachAgent v1` to deliver weekly bullet points + questions.
- Surface suggestions in UI with explicit user confirmation.

## Deliverables

### 1. CategorizationAgent v1

- Trigger: batch job (cron) or event-driven when new uncategorized transactions exist.
- Logic:
  - Fetch transactions with null `category_id` and no pending suggestion.
  - Generate `category_suggestion`, `tags_suggestion`.
  - Write via `POST /agents/finance/categorization/suggestions`.
- Metrics/logging for accuracy monitoring.

### 2. UI for Suggestions

- Transaction list shows suggested category/tags (e.g., pill or badge).
- Controls:
  - “Apply” per transaction to accept suggestion (writes real category/tags, clears suggestion).
  - “Apply all” for batch acceptance (only when safe).
  - “Dismiss” to drop suggestion without applying.
- Visual differentiation between suggested vs confirmed data.

### 3. ReviewCoachAgent v1

- Input: last week’s transactions + latest review session note (via `GET /agents/finance/review/context`).
- Output contract:
  - 2–3 bullet observations (e.g., “Dining Out up 30% vs usual”).
  - 1–2 reflection questions.
  - Optional encouragement line.
- Storage: `coach_cards` table or reuse review session metadata.
- UI: card on weekly summary screen showing observations/questions.

### 4. Supervision & Controls

- Manual refresh button for suggestions/coach card.
- Ability to hide/dismiss a coach card for the week.
- Logging for which suggestions were applied vs dismissed.

## Definition of Done

- System auto-populates sensible suggestions for uncategorized transactions, and users can apply/dismiss them confidently.
- Weekly summary displays a coach card derived from the ReviewCoachAgent.
- No automatic changes happen without explicit user confirmation.

## Suggested Vertical Slices

1. **CategorizationAgent Service** — batch job writing suggestions.
2. **Suggestion UI** — surface/apply/dismiss flows.
3. **ReviewCoachAgent + Coach Card** — backend generation + weekly summary component.

