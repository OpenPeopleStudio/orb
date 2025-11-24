# CRM – Client Context Model

## Purpose

Define the **structured context object** that AI agents will use to:
- Understand a client quickly
- Generate replies in the correct tone
- Propose next steps and system processes

---

## Context Object Shape (Draft)

```jsonc
{
  "contact_id": "uuid",
  "last_updated_at": "2025-11-24T00:00:00Z",
  "summary": "Short human-readable overview of who this is and where things stand.",
  "relationship_status": "warm", // cold | warm | hot | active | dormant | conflict
  "emotion_trend": {
    "valence": 0.2,   // -1 to 1
    "energy": "medium", // low | medium | high
    "stability": "stable" // stable | volatile
  },
  "roles": ["real_estate_buyer", "restaurant_guest"],
  "key_facts": [
    "Prefers SMS over email.",
    "Interested in downtown properties within $500k–$650k.",
    "Vegetarian; visited SWL twice this month."
  ],
  "open_threads": [
    {
      "channel": "email",
      "thread_id": "provider-or-internal",
      "topic": "Offer on 123 Example Street",
      "last_message_at": "2025-11-20T...",
      "needs_reply": true,
      "suggested_tone": "reassuring and clear"
    }
  ],
  "opportunities": [
    {
      "type": "real_estate_purchase",
      "stage": "negotiation",
      "estimated_value": 550000,
      "next_action": "Send updated comparables and clarify closing timeline."
    }
  ],
  "risks": [
    {
      "type": "communications_gap",
      "note": "Has not received reply for 3 days on a time-sensitive topic."
    }
  ],
  "system_links": {
    "finance_accounts": ["account_id_1", "account_id_2"],
    "swl_guest_profile_id": "uuid or null",
    "open_people_profile_id": "uuid or null"
  }
}

Storage Strategy

Store canonical context in a crm_client_context table:

contact_id (PK, FK)

context_json (JSONB)

last_updated_at (TIMESTAMPTZ)

Allow multiple snapshots over time:

crm_client_context_history

for drift / alignment analysis later

AI Update Policy

Context is updated:

After key email threads

After meetings / calls

On-demand (manual refresh button)

AI must:

Respect existing facts unless contradicted

Append new facts rather than overwriting history



### C. Schema Visualization & Editing  
**File:** `docs/devtools/schema_visualization.md`

```md
# Devtools – Schema Visualization & Editing

## Purpose

Provide a **live map of the Orb / SomaOS / SWL / OP database schema** that is:
- Human-readable (for Tom/devs)
- Machine-readable (for AI agents)
- Safely editable (in controlled stages)

---

## v1 Scope – Read-Only Explorer

- Connect to **Supabase/Postgres**.
- Introspect:
  - Tables
  - Columns
  - Types
  - Foreign keys
  - Indexes
- Present:
  - Entity list by schema (e.g. `public`, `swl`, `crm`, `finance`)
  - Table detail view
  - Relation graph (lightweight: references in/out)

### Data Model (internal)

Option: create a cached representation in `system_schema_cache`:

- `id`
- `schema_name`
- `table_name`
- `column_name`
- `data_type`
- `is_nullable`
- `is_pk`
- `is_fk`
- `references_table`
- `references_column`
- `raw_metadata` (JSONB)
- `refreshed_at`

This can be regenerated from `information_schema` and `pg_catalog`.

---

## v1 UI

Key views:

1. **Schema List**
   - Group tables by concerns: CRM, finance, SWL, real_estate, system, etc.

2. **Table Detail**
   - Columns, types, constraints
   - Incoming/outgoing relations

3. **Relation Map**
   - Simple graph view: node = table, edge = FK

No editing in v1 – **read-only**.

---

## Editing – Future Scope (Not in v1)

Later, the tool can:
- Propose schema changes via **migration drafts** (SQL / Supabase migrations).
- Enforce:
  - PR-based review
  - Backups before migration
  - Automated tests.

The schema editor will be the primary surface where:
- Tom designs new tables
- AI agents propose safe migrations
- System processes find the correct entities.
