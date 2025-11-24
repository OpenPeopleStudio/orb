# Phase 1.0 — Review & Monthly Clarity

Turn the finance console into a full ritual: categorize, tag, set intent, and close out daily/weekly reviews with a monthly summary.

## Objectives

- Inline classification tools on the transaction list.
- Dedicated daily review experience that persists `review_sessions`.
- Lightweight monthly summary with income vs expenses and intent insight.

## Deliverables

### 1. Transaction List Enhancements

- Inline controls per row:
  - Category selector (dropdown w/ base categories).
  - Tags editor (multi-select or free-text chips).
  - Intent label toggle (`aligned`, `neutral`, `misaligned`).
  - Review status toggle (`unreviewed`, `confirmed`, `flagged`).
- Changes persist via `PATCH /transactions/:id`.
- Visual indicators for unreviewed transactions.

### 2. Daily Review Screen

- Entry point: “Transactions since last review”.
- Batch workflow:
  - Step through transactions, confirm/tweak category & intent.
  - Quick actions for confirm/flag.
- Completion modal:
  - 1–5 prompt: “How did today’s spending feel?”
  - Free-text reflection note.
- Writes a `review_sessions` record with scope (daily/weekly) and metadata.

### 3. Monthly Summary

- Show for selected month (default = current).
- Metrics:
  - Total income vs expenses, net difference.
  - Top 5 categories by spend (with totals).
  - Count of misaligned transactions.
- Include a short textual summary (e.g., “You can see where money is going”).

### 4. Data/API Support

- `GET /finance/summary?period=monthly` extended to return:
  - Category aggregates (top 5).
  - Intent counts.
  - Review completion percentage.
- `POST /review_sessions` (or extend transactions summary endpoint to accept review payload) to persist daily ritual data.

## Definition of Done

- A user can perform their entire daily/weekly check-in inside the app, recording intent score and notes.
- Monthly summary surfaces meaningful insights without exporting data.
- Every transaction processed through the review screen updates its review status and persists classification.

## Suggested Vertical Slices

1. **Inline Controls** — add category/tags/intent/review widgets to list.
2. **Daily Review Flow** — dedicated route + backend hook for review sessions.
3. **Monthly Summary** — summary API extensions + UI card/page.

