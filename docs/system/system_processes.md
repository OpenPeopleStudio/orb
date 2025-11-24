# System Processes – Behavioral Layer

## Purpose

Define **recurring and event-driven processes** that orchestrate the system over time.

A “system process” is:
- A named, versioned workflow
- With triggers, actions, and conditions
- That can be invoked manually or automatically

---

## Concepts

### Process

- `id`
- `name`
- `slug`
- `description`
- `version`
- `active` (bool)
- `definition_json` (JSONB – see below)
- `created_at`
- `updated_at`

### Trigger Types (v1)

- Time-based:
  - cron-like: “every Monday at 09:00”
- Event-based:
  - “new email from contact tagged X”
  - “transaction above threshold”
  - “contact status changed to hot”

### Actions (v1)

- Create/update:
  - CRM note
  - Task
- Send:
  - AI-generated summary to a log or inbox
- Flag:
  - Contact / transaction / account for review

---

## Definition JSON (Draft)

```jsonc
{
  "triggers": [
    {
      "type": "cron",
      "cron": "0 9 * * MON",
      "description": "Every Monday at 9am"
    }
  ],
  "conditions": [
    {
      "type": "sql_filter",
      "target": "contacts",
      "where": "tags @> '{\"real_estate_buyer\"}' AND relationship_status = 'warm'"
    }
  ],
  "actions": [
    {
      "type": "generate_summary",
      "target": "contact",
      "output": "system_log"
    }
  ]
}
