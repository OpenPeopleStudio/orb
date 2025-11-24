# Phase 0.5 — Manual Finance Console

Smallest UI where finance is usable day to day. Focus on manual data entry and visibility for the last 30 days.

## Objectives

- Let a human track money without leaving Orb/Soma.
- Keep implementation vertical slices: accounts list, manual entry, transactions list/filter.

## Deliverables

### 1. Account List View

- Columns: name, type, current_balance (manual), last_updated_at.
- Allow manual balance edits (modal or inline).
- Optional quick links for “update balance” to encourage freshness.

### 2. Manual Transaction Entry

- Form fields: account selector, date, amount (+/-), raw description.
- Default category = Uncategorized until later phases.
- Save action writes via `POST /transactions` and clears the form.

### 3. Transaction List

- Shows last 30 days of transactions after each save.
- Columns: date, account, description, amount (with +/- formatting).
- Basic filters: quick chips for “This week” and “This month”.
- Empty state when no transactions; suggest creating one manually.

### 4. UX Notes

- Keep latency low by using existing APIs; optimistic updates acceptable.
- Minimal styling fine; prioritize keyboard flow for quick entry.

## Definition of Done

- User can log inflows/outflows daily and immediately see them listed.
- Filter chips work and constrain the list in-memory or via API query params.
- Accounts page reflects manual balance updates, enabling at-a-glance totals.

## Suggested Vertical Slices

1. **Accounts List** — read-only list + manual balance edit dialog.
2. **Manual Transaction Form** — bound to API, includes validation.
3. **Transaction List + Filters** — fetch/display last 30 days, add filter toggles.

