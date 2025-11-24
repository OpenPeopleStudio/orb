# Phase 1.5 — Home & Reflection Integration

Finance stops being its own island. Surface state on the home screen and push review insights into reflection/journal surfaces.

## Objectives

- Provide at-a-glance money health without opening finance routes.
- Feed weekly review outputs into reflection logs for narrative continuity.
- Optional calendar hints for key pay/bill events.

## Deliverables

### 1. Home Widget

- Card on home/dashboard:
  - “This month: income $X, spending $Y, net $Z.”
  - “N unreviewed transactions” link to review screen.
- Refresh cadence: daily or on transaction changes.
- Handles empty state gracefully (e.g., “No data yet — add an account”).

### 2. Reflection / Journal Link

- Weekly review summary automatically posts to reflection log with `finance` tag.
- Include:
  - Date range covered.
  - Intent score and note.
  - Optional highlights (top category, misaligned count).
- Deep link back to finance review in case user wants detail.

### 3. Optional Calendar Hints

- Expose paydays and large recurring bills as events.
- Manual input acceptable: allow marking a transaction as recurring and adding to calendar.
- Even a static reminder for rent/payday is enough at this phase.

### 4. Backend Support

- API endpoint or internal bus event to fetch “home finance summary”.
- Reflection service hook to ingest finance review data.
- Calendar integration (if manual) can reuse events table with `finance` source tagging.

## Definition of Done

- User can gauge money state from the home view and see pending reviews count.
- Reflection timeline automatically gains weekly finance summaries.
- Optional calendar hints exist for recurring anchors (payday/bills) even if manually curated.

## Suggested Vertical Slices

1. **Home Widget** — summary API + UI card with review link.
2. **Reflection Sync** — pipe review_session data into reflection log.
3. **Calendar Hints (Optional)** — manual annotation for paydays/recurring bills.

