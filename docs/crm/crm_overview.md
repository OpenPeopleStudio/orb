# CRM – Contact-Centric Intelligence

## Purpose

The CRM is the **contact-centric nervous system** of Orb:
- Every person, company, or entity has a **single canonical profile**.
- All communication (email, SMS, calls, notes, tasks) anchors to that profile.
- AI uses this to understand relationships, context, and emotional resonance over time.

The CRM is the substrate for:
- Personal + business relationships
- Real estate clients
- Snow White Laundry (SWL) guests, suppliers, and partners
- Open People partners, donors, and collaborators

---

## Core Concepts

### Contact

- `id`
- `full_name`
- `type` (person, company, organization)
- `primary_email`
- `phone`
- `tags` (VIP, investor, buyer, vendor, family, etc.)
- `origin` (manual, email-import, calendar, form, etc.)
- `created_at`, `updated_at`

### Relationship Context

A rolling, AI-friendly context object summarizing:
- History of interactions (high level)
- Emotional tone trends (positive/negative, stable/volatile)
- Key milestones (deals, visits, conflicts, resolutions)
- Current status (cold, warm, hot, active, dormant)
- Suggested next action

This is stored as:
- `relationship_state` (structured JSON)
- `last_ai_summary` (text)
- `last_summary_at` (timestamp)

---

## Email Integration (v1 Scope)

Goal: **Pull email into the CRM and attach it to the correct contacts.**

### Inbound Email Flow (v1)

1. Email is received from provider (Gmail/IMAP/OAuth scope TBD).
2. System parses:
   - `from`, `to`, `cc`, `bcc`, `subject`, `body`, `attachments`
   - `received_at`
3. System matches or creates contacts for:
   - `from` address primarily
   - optional: `to`/`cc` for multi-party mapping
4. Email stored in `crm_emails` table:
   - `id`
   - `contact_id` (primary relationship)
   - `thread_id` (provider-level or internal)
   - `direction` (inbound, outbound)
   - `subject`
   - `snippet`
   - `body_raw` (sanitized HTML or text)
   - `body_text`
   - `received_at`
   - `provider_metadata` (JSON)

5. Optional AI enrichment:
   - `ai_summary`
   - `sentiment_score` (-1 to 1)
   - `energy_level` (low/medium/high)
   - `urgency` (low/medium/high)
   - `topics` (array of keywords)

### Outbound Email (v1)

- Drafts created from contact card UI.
- Stored as:
  - `direction = outbound`
  - `draft_status` (draft, queued, sent)
- Sending handled via:
  - provider API (Gmail/Outlook/etc.)
  - or a bridge service

---

## Client Card – Data Model (v1)

The **client card** surface should show:

1. **Header**
   - Name, tags, primary role (e.g. “Real Estate – Buyer”)
   - Contact info
   - Relationship status + emotional indicator

2. **Timeline**
   - Emails (summarized)
   - Notes
   - Tasks
   - Key events (meetings, visits, closings, bookings)

3. **Context Panel**
   - Last AI summary of relationship
   - Open deals / opportunities
   - Risk or attention flags

4. **Actions**
   - Compose email
   - Add note
   - Add task
   - Trigger system process (e.g. “Onboarding sequence”)

---

## AI Usage Notes

- AI operates **per contact**, not per inbox.
- All contexts are anchored by `contact_id`.
- Summaries must be:
  - Short
  - Actionable
  - Timestamped and versioned for later comparison

---

## v1 vs Later

**v1 CRM needs:**
- Robust contact model
- Email ingestion and mapping
- Basic client card UI
- Simple AI summaries per contact

Future:
- Multi-channel (SMS, WhatsApp, calendar, calls)
- Advanced relationship health metrics
- Automatic process triggers (system processes layer)

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

