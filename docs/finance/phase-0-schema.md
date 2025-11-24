# Phase 0 — Schema & Plumbing

Make the finance model real in the database and backend. No UI expectations; success means finance data exists, is queryable, and can be mutated via internal tools/Postman.

## Objectives

- Stand up persistent tables for accounts, transactions, categories, budgets, and review sessions.
- Seed a concise, opinionated data set so the API has meaningful responses on day one.
- Expose CRUD endpoints that the later UI and agents can rely on without further schema churn.

## Deliverables

### 1. Database & Schema

- `accounts` table with id, name, type, status, current_balance, currency, metadata, timestamps.
- `transactions` table with account linkage, amounts, descriptions (raw + clean), category reference, tags (jsonb), merchant data, intent_label, review_status, notes, source, timestamps.
- `categories` table with base categories, income/expense/transfer type, parent grouping, is_core, is_active.
- `budgets` table scoped per period + category with planned amount, computed spent, status enum.
- `review_sessions` table capturing start/end, scope, reviewed transaction ids (jsonb), intent score, summary text.
- Necessary supporting indexes (e.g., on `transactions.account_id`, `transactions.date_posted`, `transactions.review_status`).

### 2. Seed Data

- Base categories:
  - Expenses: Rent, Groceries, Dining Out, Tools, Subscriptions.
  - Income: Salary, Other.
  - Transfers (generic bucket for intra-account moves).
- Example budgets for Dining Out, Groceries, Subscriptions with current month periods.
- Optional helper seeds: sample account, handful of example transactions for smoke testing.

### 3. Backend / API Surface

- `POST /transactions` — create manual or imported transactions.
- `PATCH /transactions/:id` — update category, tags, intent_label, review_status, description fields.
- `GET /finance/summary?period=` — summarized totals (income, expenses, net, top categories).
- `GET /accounts` — list accounts with balances, updated timestamps.
- `GET /transactions` — filter by date range, account, review status, category.
- Request/response contracts documented (`docs/finance/api-contracts.md` or inline in this file) so UI/agents have a single source.

### 4. Ops Tooling

- Database migration scripts or Supabase migrations committed.
- Seed script runnable via `pnpm` task (e.g., `pnpm finance:seed`).
- Postman collection / REST client file to exercise endpoints quickly.

## Definition of Done

- Hitting the endpoints returns or mutates real finance data.
- Schema is versioned, reproducible via migrations, and covered by lightweight tests (e.g., hitting summary endpoint after seeding returns expected totals).
- No UI dependencies required to validate the phase.

## Suggested Vertical Slices

1. **Schema Migration** — define tables, indexes, constraints.
2. **Seed Script** — insert baseline categories, budgets, sample accounts.
3. **Transactions API** — `POST` + `PATCH`.
4. **Read APIs** — `GET /accounts`, `GET /transactions`, `GET /finance/summary`.

