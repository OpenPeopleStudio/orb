# Phase 3.0 — Alerts & Light Automation

Let the system tap you on the shoulder for recurring drains and anomalies, and add gentle automation for confirmed subscriptions.

## Objectives

- Detect subscriptions/recurring charges and flag them for confirmation.
- Provide anomaly/spike alerts for out-of-pattern spend.
- Add soft automation: tagging future transactions once a subscription is confirmed.

## Deliverables

### 1. Subscription Detector

- Pattern finder for recurring transactions (same merchant + similar amount, monthly cadence).
- UI flow:
  - “Looks like these are subscriptions. Confirm?” list.
  - On confirmation, apply `subscription` tag + optional category.
  - Offer “snooze/dismiss” for false positives.
- Store subscription metadata (merchant, amount, cadence, last seen).

### 2. Anomaly / Spike Alerts

- Heuristics: compare current month category spend vs trailing average (e.g., Dining Out > 150% of usual).
- Alert surfaces:
  - Home widget badge.
  - Notification panel/list inside finance section.
- Allow user to acknowledge/dismiss alerts (persist state).

### 3. Notification Surface

- Extend home widget or add mini notification drawer.
- Optional in-app notifications feed dedicated to finance events.
- Show alert summary + link to detailed view.

### 4. Soft Automation

- When a subscription is confirmed:
  - Future matching transactions auto-label with stored category/tags.
  - Provide “undo auto-label” option per transaction.
- Track automation effectiveness (how often user overrides).

### 5. Backend Support

- Background jobs for detection (run daily).
- Data structures:
  - `subscriptions` table storing pattern metadata.
  - `finance_alerts` table capturing alert type, state, references.
- API endpoints:
  - `GET /finance/alerts`
  - `POST /finance/alerts/:id/acknowledge`
  - `POST /finance/subscriptions/:id/confirm` and `/dismiss`

## Definition of Done

- System proactively surfaces subscription matches and spending spikes before month end.
- Users receive gentle nudges on home/notifications and can act within finance UI.
- Confirmed subscriptions automatically tag future transactions, reducing repetitive work.

## Suggested Vertical Slices

1. **Subscription Detection** — background job + confirmation UI.
2. **Anomaly Alerts** — heuristics + alert surfaces (home + notifications).
3. **Soft Automation** — auto-label future subscription transactions with undo controls.

