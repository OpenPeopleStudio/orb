# CRM Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ORB CRM SYSTEM                                │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  EMAIL PROVIDERS                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │   Gmail     │  │   iCloud    │  │   Outlook   │                      │
│  │    API      │  │    IMAP     │  │    API      │                      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                      │
│         │                │                │                              │
│         └────────────────┴────────────────┘                              │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  EMAIL CLIENT LAYER (apps/orb-web/src/lib/email/)                        │
│  ┌───────────────────────────────────────────────────────────────┐      │
│  │  EmailClient                                                   │      │
│  │  - fetchEmails()                                               │      │
│  │  - sendEmail()                                                 │      │
│  │  - getAllAccounts()                                            │      │
│  └────────────────────────┬──────────────────────────────────────┘      │
└──────────────────────────┬┼──────────────────────────────────────────────┘
                           ││
                           ││  Email[]
                           ││
                           ↓│
┌──────────────────────────────────────────────────────────────────────────┐
│  INBOX CONTEXT (apps/orb-web/src/contexts/InboxContext.tsx)              │
│  ┌───────────────────────────────────────────────────────────────┐      │
│  │  InboxProvider                                                 │      │
│  │  1. Fetch emails from EmailClient                             │      │
│  │  2. Sync emails with CRM (auto-create contacts)    ← NEW ✨   │      │
│  │  3. Fetch contacts from CRM                         ← NEW ✨   │      │
│  │  4. Merge & sort for unified view                             │      │
│  └─────────────────┬─────────────────────────────────────────────┘      │
└────────────────────┼──────────────────────────────────────────────────────┘
                     │
                     │  syncEmailsWithCrm(emails)
                     ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  CRM CLIENT LIBRARY (apps/orb-web/src/lib/crm/)                          │
│                                                                           │
│  ┌─────────────────────────┐  ┌──────────────────────────┐              │
│  │  email-sync.ts          │  │  client.ts               │              │
│  │  ─────────────          │  │  ─────────               │              │
│  │  syncEmailsWithCrm()    │  │  getContacts()           │              │
│  │  syncEmailWithCrm()     │  │  getContact()            │              │
│  │  - Detect direction     │  │  createContact()         │              │
│  │  - Call linkEmail...()  │  │  updateContact()         │              │
│  └────────┬────────────────┘  │  deleteContact()         │              │
│           │                   │  getContactEmails()      │              │
│           │                   │  getCrmStats()           │              │
│           │                   └───────────┬──────────────┘              │
│           │                               │                             │
│           └───────────────┬───────────────┘                             │
└───────────────────────────┼─────────────────────────────────────────────┘
                            │
                            │  Supabase RPC & REST API
                            ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  SUPABASE DATABASE                                                        │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │  TABLES                                                         │     │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐ │     │
│  │  │ crm_contacts    │  │ crm_emails      │  │ crm_client_    │ │     │
│  │  │ ───────────────│  │ ───────────────│  │ context        │ │     │
│  │  │ • id            │◄─┤ • contact_id    │  │ ──────────────│ │     │
│  │  │ • user_id       │  │ • external_id   │  │ • contact_id   │ │     │
│  │  │ • full_name     │  │ • provider      │  │ • context_json │ │     │
│  │  │ • primary_email │  │ • direction     │  │ • updated_at   │ │     │
│  │  │ • emails[]      │  │ • from_email    │  └────────────────┘ │     │
│  │  │ • phones[]      │  │ • to_emails[]   │                     │     │
│  │  │ • tags[]        │  │ • subject       │  ┌────────────────┐ │     │
│  │  │ • status        │  │ • snippet       │  │ crm_client_    │ │     │
│  │  │ • last_inter... │  │ • received_at   │  │ context_history│ │     │
│  │  └─────────────────┘  └─────────────────┘  │ ──────────────│ │     │
│  │                                             │ • snapshots    │ │     │
│  │                                             └────────────────┘ │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │  FUNCTIONS (Postgres)                                          │     │
│  │  ┌───────────────────────────────┐  ┌──────────────────────┐  │     │
│  │  │ find_or_create_contact_by_    │  │ link_email_to_       │  │     │
│  │  │ email(email, name)            │  │ contact(...)         │  │     │
│  │  │ ─────────────────────────     │  │ ────────────────     │  │     │
│  │  │ 1. Search for contact         │  │ 1. Find/create       │  │     │
│  │  │ 2. Create if not found        │  │    contact           │  │     │
│  │  │ 3. Return contact_id          │  │ 2. Insert email      │  │     │
│  │  └───────────────────────────────┘  │ 3. Update last_int.. │  │     │
│  │                                      │ 4. Return email_id   │  │     │
│  │                                      └──────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │  SECURITY (Row-Level Security)                                 │     │
│  │  • All tables have RLS enabled                                 │     │
│  │  • Users can only access their own data (user_id filter)       │     │
│  │  • Policies: SELECT, INSERT, UPDATE, DELETE per user           │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │  INDEXES (Performance)                                         │     │
│  │  • user_id (B-tree)                                            │     │
│  │  • primary_email (B-tree)                                      │     │
│  │  • emails[], tags[] (GIN arrays)                               │     │
│  │  • search_vector (GIN full-text)                               │     │
│  │  • last_interaction_at (B-tree desc)                           │     │
│  └────────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────┘
                            ↑
                            │
┌──────────────────────────────────────────────────────────────────────────┐
│  USER INTERFACE LAYER                                                     │
│                                                                           │
│  ┌────────────────────────┐  ┌─────────────────────────┐                │
│  │  /contacts              │  │  /contacts/:id          │                │
│  │  ContactsHome           │  │  ContactDetail          │                │
│  │  ───────────            │  │  ─────────────          │                │
│  │  • Contact list         │  │  • Profile header       │                │
│  │  • Search bar           │  │  • Email timeline       │                │
│  │  • Status filters       │  │  • Details tab          │                │
│  │  • Statistics cards     │  │  • Quick actions        │                │
│  │  • Tag display          │  │  • Metadata             │                │
│  └────────────────────────┘  └─────────────────────────┘                │
│                                                                           │
│  ┌────────────────────────┐  ┌─────────────────────────┐                │
│  │  /inbox                 │  │  /emails                │                │
│  │  InboxHome              │  │  EmailsHome             │                │
│  │  ─────────              │  │  ──────────             │                │
│  │  • Unified feed         │  │  • Email list           │                │
│  │  • Type filters         │  │  • Account switcher     │                │
│  │  • Shows contacts ✨    │  │  • Compose              │                │
│  └────────────────────────┘  └─────────────────────────┘                │
└──────────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Email → Contact Linking

```
1. USER CONNECTS EMAIL ACCOUNT
   ↓
2. EmailClient.fetchEmails()
   ↓
   Returns: Email[]
   ↓
3. InboxContext.refresh()
   ↓
   Calls: syncEmailsWithCrm(emails)
   ↓
4. For each email:
   ┌────────────────────────────────────────┐
   │ syncEmailWithCrm(email)                │
   │                                        │
   │ ┌────────────────────────────────────┐ │
   │ │ Determine Direction                │ │
   │ │ • Inbound: from_email → contact    │ │
   │ │ • Outbound: to_email[0] → contact  │ │
   │ └────────────────────────────────────┘ │
   │                                        │
   │ ┌────────────────────────────────────┐ │
   │ │ Call: linkEmailToContact()         │ │
   │ │                                    │ │
   │ │ Supabase RPC:                      │ │
   │ │   link_email_to_contact(...)       │ │
   │ └────────────────────────────────────┘ │
   └────────────────────────────────────────┘
   ↓
5. Postgres Function:
   ┌────────────────────────────────────────┐
   │ link_email_to_contact()                │
   │                                        │
   │ Step 1: Find or create contact         │
   │   → find_or_create_contact_by_email()  │
   │   → Returns: contact_id                │
   │                                        │
   │ Step 2: Insert/update email            │
   │   → INSERT INTO crm_emails             │
   │   → ON CONFLICT UPDATE (dedup)         │
   │                                        │
   │ Step 3: Update contact timestamp       │
   │   → UPDATE crm_contacts                │
   │   → SET last_interaction_at = ...      │
   │                                        │
   │ Returns: email_id                      │
   └────────────────────────────────────────┘
   ↓
6. RESULT: Contact created/updated ✅
           Email linked to contact ✅
           Timeline updated ✅
```

## Component Hierarchy

```
App
├── InboxProvider (context)
│   ├── Fetches emails from EmailClient
│   ├── Syncs with CRM
│   └── Provides unified items
│
├── Routes
│   ├── /contacts → ContactsHome
│   │   ├── Calls: getContactsWithEmails()
│   │   ├── Renders: ContactCard (list)
│   │   └── Shows: Statistics, Search, Filters
│   │
│   ├── /contacts/:id → ContactDetail
│   │   ├── Calls: getContact(id)
│   │   ├── Calls: getContactEmails(id)
│   │   ├── Tabs: Timeline | Details
│   │   └── Renders: EmailTimelineItem
│   │
│   ├── /inbox → InboxHome
│   │   ├── Uses: useInbox() hook
│   │   ├── Shows: Emails + Contacts + Messages
│   │   └── Filters: Type, Account, Unread
│   │
│   └── /emails → EmailsHome
│       ├── Calls: emailClient.fetchEmails()
│       └── Triggers: CRM sync automatically
```

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│  ROW-LEVEL SECURITY (RLS)                                   │
│                                                             │
│  Every table has policies that enforce:                     │
│                                                             │
│  SELECT: WHERE user_id = auth.uid()                         │
│  INSERT: WITH CHECK (user_id = auth.uid())                  │
│  UPDATE: WHERE user_id = auth.uid()                         │
│  DELETE: WHERE user_id = auth.uid()                         │
│                                                             │
│  ┌─────────────────────────────────────────────────┐       │
│  │  User A                                         │       │
│  │  ─────────────────────────────────────          │       │
│  │  Can ONLY see/edit:                             │       │
│  │  • crm_contacts WHERE user_id = A               │       │
│  │  • crm_emails WHERE user_id = A                 │       │
│  │  • crm_client_context WHERE user_id = A         │       │
│  └─────────────────────────────────────────────────┘       │
│                                                             │
│  ┌─────────────────────────────────────────────────┐       │
│  │  User B                                         │       │
│  │  ─────────────────────────────────────          │       │
│  │  Can ONLY see/edit:                             │       │
│  │  • crm_contacts WHERE user_id = B               │       │
│  │  • crm_emails WHERE user_id = B                 │       │
│  │  • crm_client_context WHERE user_id = B         │       │
│  └─────────────────────────────────────────────────┘       │
│                                                             │
│  ISOLATION: Complete data separation per user              │
└─────────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌──────────────────────────────────────────────────────────┐
│  QUERY OPTIMIZATION                                      │
│                                                          │
│  Common Query: Get contacts for user                    │
│  ───────────────────────────────────────                │
│  SELECT * FROM crm_contacts                             │
│  WHERE user_id = $1                                     │
│  ORDER BY last_interaction_at DESC                      │
│  LIMIT 100;                                             │
│                                                          │
│  Indexes Used:                                          │
│  ✅ idx_crm_contacts_user_id (B-tree on user_id)        │
│  ✅ idx_crm_contacts_last_interaction (B-tree desc)     │
│                                                          │
│  Performance: Sub-millisecond for <10k contacts         │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  FULL-TEXT SEARCH                                        │
│                                                          │
│  Common Query: Search contacts                          │
│  ───────────────────────────────────────                │
│  SELECT * FROM crm_contacts                             │
│  WHERE search_vector @@ to_tsquery('john & doe')        │
│  AND user_id = $1;                                      │
│                                                          │
│  Index Used:                                            │
│  ✅ idx_crm_contacts_search (GIN on search_vector)      │
│                                                          │
│  Search Vector Includes:                                │
│  • full_name (weight A - highest)                       │
│  • primary_email (weight B)                             │
│  • company (weight B)                                   │
│  • notes (weight C)                                     │
│                                                          │
│  Performance: Sub-millisecond for <10k contacts         │
└──────────────────────────────────────────────────────────┘
```

## Future Extensions

```
┌───────────────────────────────────────────────────────────────┐
│  PHASE 2: AI INTEGRATION                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Sol Agent (AI)                                         │  │
│  │  ──────────────                                         │  │
│  │  • Analyze email sentiment                             │  │
│  │  • Generate relationship summaries                     │  │
│  │  • Detect opportunities/risks                          │  │
│  │  • Suggest next actions                                │  │
│  │                                                         │  │
│  │  Updates: crm_client_context.context_json              │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  PHASE 3: MULTI-CHANNEL                                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Additional Channels                                    │  │
│  │  ──────────────────                                     │  │
│  │  • SMS/iMessage → crm_messages                          │  │
│  │  • WhatsApp → crm_messages                              │  │
│  │  • Calendar events → crm_events                         │  │
│  │  • Phone calls → crm_calls                              │  │
│  │                                                         │  │
│  │  All linked to: crm_contacts.id                         │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

**This diagram represents the complete CRM system architecture as implemented.**

