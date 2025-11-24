# orb-finance.md  
> Personal finance as intention made visible.  
> Smallest working model first, agents later.

---

## 0. Scope

This document defines the **minimum viable finance system** for Orb/Soma:

- **Personal-only** to start (Tom-as-individual).  
- Designed so that **agents can be added later** without changing the core model.  
- Focus: **cash flow clarity + intention alignment**, not full accounting.

Non-goal for v0:  
- No double-entry accounting, no tax engine, no business bookkeeping here (SWL/RealEstate get their own stacks).

---

## 1. V0 Goals & Non-Goals

### 1.1 Goals

1. **Single source of truth** for personal money:
   - Where is it?
   - What is coming in?
   - What is going out?
2. **Simple categorization + tags**:
   - “What kind of spending is this?”
   - “Was this aligned with my intention?”
3. **Basic time views**:
   - This week / this month: inflow vs outflow.
   - Category breakdown.
4. **Review ritual**:
   - A daily/weekly “finance review” flow.
   - Each transaction can be **confirmed, tagged, or flagged**.
5. **Agent-ready interfaces**:
   - Clear functions / events that future agents can call/emit.

### 1.2 Non-Goals (for v0)

- No bank API integration (CSV/manual import only).
- No multi-currency.
- No investments tracking beyond “manual balance”.
- No forecasting/simulation.
- No shared budgets / multi-user logic.

---

## 2. Core Concepts (Data Model)

Minimum set of entities we actually need.

### 2.1 Account

Represents a place where money sits or flows.

- `id`
- `name` (e.g. “RBC Chequing”, “Amex Personal”)
- `type` (checking, savings, credit_card, cash, wallet, other)
- `status` (active, archived)
- `current_balance` (optional; can be manually updated)
- `currency` (default: CAD)
- `default_owner` (Tom-personal)
- `metadata` (JSON for bank name, last 4 digits, notes, etc.)

### 2.2 Transaction

Atomic money movement. Central object.

- `id`
- `account_id`
- `date_posted`
- `amount` (positive = inflow, negative = outflow)
- `currency`
- `description_raw` (original text from CSV/manual input)
- `description_clean` (normalized/cleaned label)
- `category_id` (nullable; can be “uncategorized”)
- `tags` (string[] – e.g. `["coffee","friend","treat"]`)
- `merchant_name` (optional)
- `is_recurring` (bool, optional)
- `review_status` (`unreviewed` | `confirmed` | `flagged`)
- `intent_label` (`aligned` | `neutral` | `misaligned` | null)
- `notes` (user text)
- `source` (`manual` | `csv_import` | `api_future`)

### 2.3 Category

Lightweight classification.

- `id`
- `name` (e.g. “Rent”, “Groceries”, “Dining Out”, “Tools”, “Subscriptions”)
- `type` (`income` | `expense` | `transfer`)
- `is_core` (true if part of the base set)
- `parent_id` (optional, for grouping like “Food → Groceries / Dining Out”)
- `is_active` (bool)

### 2.4 Budget (optional-but-small)

Simple monthly envelope per category.

- `id`
- `category_id`
- `period` (e.g. `2025-11`)
- `amount_planned`
- `amount_spent` (computed)
- `status` (`under`, `at`, `over` – computed)

V0 can implement only **a few key budgets** (e.g. “Dining Out”, “Groceries”, “Subscriptions”) to avoid complexity.

### 2.5 Review Session

Meta for the “finance check-in” ritual.

- `id`
- `started_at`
- `ended_at`
- `scope` (`daily` | `weekly` | `monthly`)
- `transactions_reviewed` (array of transaction IDs)
- `summary_text` (reflection, e.g. “felt overspendy on food”)
- `intent_score` (small 1–5 alignment number)

---

## 3. Core Flows (Smallest Working Model)

### 3.1 Ingest Transactions

Initial build: **manual + CSV**.

**Manual add:**

- User can add a transaction:
  - Account
  - Date
  - Amount
  - Description
- System can auto-guess:
  - Category (later via agent, initial = “Uncategorized”)
  - Clean description (e.g. strip bank noise)

**CSV import (v0):**

- Upload a bank CSV.
- Map CSV columns → `date`, `amount`, `description`.
- Preview parsed rows.
- Import into `transactions` table with `source = "csv_import"`.

*(No dedupe logic in v0; user can delete duplicates manually.)*

---

### 3.2 Categorize & Tag

Core actions per transaction:

- Set / change **category**.
- Add/remove **tags**.
- Set **intent_label**:
  - `aligned` (this spend reflects my priorities)
  - `neutral`
  - `misaligned` (regret / impulse)
- Mark **review_status**:
  - `confirmed` when user has looked at it.
  - `flagged` for follow-up (e.g. dispute, cancel subscription).

This is the “friction point” where intention meets money. Keep UI minimal and fast.

---

### 3.3 Daily / Weekly Review Ritual

**Daily (5–10 transactions):**

- Screen: “Transactions to review since last check-in.”
- For each:
  - Confirm category / fix if wrong.
  - Mark intent (aligned/neutral/misaligned).
  - Flag if any issues.
- End with a tiny summary:
  - “How did today’s spending feel?” (1–5)
  - Text note.

**Weekly:**

- Totals:
  - Income vs expenses this week.
  - Top 3 categories by spend.
- Count of `misaligned` transactions.
- Option to adjust **next week’s focus**:
  - e.g. “Cap dining at $X”, “No impulse purchases this week”.

These reviews later become **agent hooks** (“FinanceReviewAgent: prepare weekly dashboard + talking points”).

---

### 3.4 Simple Views / Dashboards

V0 needs only three main views:

1. **Today / This Week**  
   - List of transactions.
   - Total inflow/outflow.
   - % reviewed.

2. **This Month**  
   - Bar chart (or list) of categories with totals.
   - Budget status for key categories.
   - Count of `aligned` vs `misaligned` transactions.

3. **Accounts Overview**  
   - List of accounts.
   - Simple current balance (manual).
   - Last updated timestamp.

No complex charts needed; text + simple bars are enough.

---

## 4. Agent-Ready Shapes (Future Hooks)

We design the interface so agents can be dropped in later.

### 4.1 ImportAgent (future)

- **Input:** CSV file or raw transaction records.
- **Job:** Normalize → dedupe → emit `transactions.created` events.

### 4.2 CategorizationAgent (future)

- **Input:** `transactions` where `category_id` is null.
- **Job:** Suggest category + tags.
- **Output:** `transactions.suggested_category` records.

For v0 we just implement the tables with a field for `category_suggestion` (optional).

### 4.3 ReviewCoachAgent (future)

- **Input:** Last week’s transactions + review sessions.
- **Job:** Summarize patterns, ask 1–3 reflection questions.
- **Output:** A small “coach card” on weekly review.

### 4.4 AlertAgent (future)

- **Input:** Stream of transactions.
- **Job:** Watch for:
  - Subscription charges
  - Large out-of-pattern spends
- **Output:** Alerts → notification system.

We don’t build the agents in this file; we just make sure the **data model + events** support them.

---

## 5. Integration Points (Orb / SomaOS)

Where finance shows up elsewhere in the system.

- **Home / Launcher widget:**
  - “This month: spent $X / income $Y / net $Z.”
  - Tiny note: “3 transactions to review.”
- **Calendar:**
  - Optional: mark paydays and big recurring bills as events.
- **Reflection / Journal:**
  - Weekly review summary can be piped into reflection logs (“finance” tag).
- **Notifications (later):**
  - “You have 7 unreviewed transactions.”
  - “Dining Out is at 80% of the monthly budget.”

---

## 6. Implementation Checklist (MVP)

**Data:**

- [ ] Tables for `accounts`, `transactions`, `categories`, `budgets`, `review_sessions`.
- [ ] Seed categories with a **small, opinionated base set**.
- [ ] Seed 1–3 example budgets.

**Flows:**

- [ ] Manual transaction entry UI.
- [ ] CSV import flow with mapping.
- [ ] Transaction list view with:
  - [ ] Inline category selection.
  - [ ] Tags editing.
  - [ ] Intent label selector.
  - [ ] Review status toggle (unreviewed/confirmed/flagged).
- [ ] Daily review screen.
- [ ] Simple monthly summary screen.

**Integration:**

- [ ] Home widget showing:
  - [ ] Net this month.
  - [ ] Count of unreviewed transactions.
- [ ] Route + API endpoints that agents can call later:
  - `POST /transactions`
  - `PATCH /transactions/:id` (for category, tags, intent, status)
  - `GET /finance/summary?period=this_month`

---

## 7. Future Phases (Not in v0, but keep in mind)

- Bank API sync (Plaid or Canadian equivalent).
- Investments, net-worth tracking.
- Forecasting / “what if” scenarios.
- Joint/shared budgets.
- Business finances integration (SWL, RealEstate) as separate but linkable domains.

---

**Definition of Done for v0:**  
Tom can, inside Orb/Soma, **see all personal transactions for the month, classify them, review them, and get a simple sense of whether his spending matches his intention** – without any external tools.
