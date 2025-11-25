-- CRM Schema
-- Contact-centric relationship intelligence for Orb

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 0. Helper Functions
--------------------------------------------------------------------------------

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
-- 1. CRM Contacts
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identity
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  nickname TEXT,
  
  -- Contact Type
  type TEXT NOT NULL DEFAULT 'person' CHECK (type IN ('person', 'company', 'organization')),
  
  -- Communication channels
  primary_email TEXT,
  emails TEXT[] DEFAULT '{}', -- All known emails
  phones TEXT[] DEFAULT '{}',
  
  -- Professional info
  company TEXT,
  title TEXT,
  
  -- Origin tracking
  origin TEXT DEFAULT 'manual' CHECK (origin IN ('manual', 'email-import', 'calendar', 'form', 'api')),
  
  -- Tags for categorization
  tags TEXT[] DEFAULT '{}', -- ['VIP', 'investor', 'buyer', 'vendor', 'family', etc.]
  
  -- Metadata
  avatar_url TEXT,
  notes TEXT,
  
  -- Relationship status
  relationship_status TEXT DEFAULT 'cold' CHECK (relationship_status IN ('cold', 'warm', 'hot', 'active', 'dormant', 'conflict')),
  
  -- Timestamps
  last_interaction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Full text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(full_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(primary_email, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(company, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(notes, '')), 'C')
  ) STORED
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crm_contacts_user_id ON public.crm_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_primary_email ON public.crm_contacts(primary_email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_emails ON public.crm_contacts USING GIN(emails);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_tags ON public.crm_contacts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_search ON public.crm_contacts USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_last_interaction ON public.crm_contacts(user_id, last_interaction_at DESC);

-- Updated at trigger
DROP TRIGGER IF EXISTS set_crm_contacts_updated_at ON public.crm_contacts;
CREATE TRIGGER set_crm_contacts_updated_at
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

--------------------------------------------------------------------------------
-- 2. CRM Emails (Link emails to contacts)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.crm_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  
  -- Email metadata
  external_id TEXT NOT NULL, -- Provider's message ID (Gmail ID, etc.)
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'icloud', 'outlook', 'other')),
  account_id TEXT NOT NULL, -- Email account that received/sent this
  
  -- Email data
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT[] DEFAULT '{}',
  cc_emails TEXT[] DEFAULT '{}',
  bcc_emails TEXT[] DEFAULT '{}',
  
  subject TEXT,
  snippet TEXT,
  body_text TEXT,
  body_html TEXT,
  
  -- Thread info
  thread_id TEXT,
  
  -- Status
  unread BOOLEAN DEFAULT FALSE,
  starred BOOLEAN DEFAULT FALSE,
  has_attachments BOOLEAN DEFAULT FALSE,
  
  -- Labels/categories
  labels TEXT[] DEFAULT '{}',
  
  -- AI enrichment (optional)
  ai_summary TEXT,
  sentiment_score DECIMAL(3, 2), -- -1 to 1
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')),
  topics TEXT[] DEFAULT '{}',
  
  -- Timestamps
  received_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one email per external ID per account
  UNIQUE(external_id, account_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crm_emails_user_id ON public.crm_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_emails_contact_id ON public.crm_emails(contact_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_emails_account_id ON public.crm_emails(account_id);
CREATE INDEX IF NOT EXISTS idx_crm_emails_thread_id ON public.crm_emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_crm_emails_direction ON public.crm_emails(user_id, direction);
CREATE INDEX IF NOT EXISTS idx_crm_emails_unread ON public.crm_emails(user_id, unread) WHERE unread = TRUE;

--------------------------------------------------------------------------------
-- 3. CRM Client Context (AI-generated relationship intelligence)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.crm_client_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Context snapshot
  context_json JSONB NOT NULL DEFAULT '{}',
  -- Expected structure:
  -- {
  --   "summary": "Short human-readable overview",
  --   "relationship_status": "warm",
  --   "emotion_trend": { "valence": 0.2, "energy": "medium", "stability": "stable" },
  --   "roles": ["real_estate_buyer"],
  --   "key_facts": ["Prefers SMS", "Budget $500k-$650k"],
  --   "open_threads": [...],
  --   "opportunities": [...],
  --   "risks": [...]
  -- }
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One current context per contact
  UNIQUE(contact_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_crm_client_context_contact_id ON public.crm_client_context(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_client_context_user_id ON public.crm_client_context(user_id);

-- Updated at trigger
DROP TRIGGER IF EXISTS set_crm_client_context_updated_at ON public.crm_client_context;
CREATE TRIGGER set_crm_client_context_updated_at
  BEFORE UPDATE ON public.crm_client_context
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

--------------------------------------------------------------------------------
-- 4. CRM Client Context History (For drift analysis)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.crm_client_context_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Snapshot of context at this point in time
  context_json JSONB NOT NULL DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crm_context_history_contact_id ON public.crm_client_context_history(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_context_history_user_id ON public.crm_client_context_history(user_id);

--------------------------------------------------------------------------------
-- 5. Helper Functions
--------------------------------------------------------------------------------

-- Function to find or create contact by email
CREATE OR REPLACE FUNCTION public.find_or_create_contact_by_email(
  p_user_id UUID,
  p_email TEXT,
  p_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contact_id UUID;
  v_display_name TEXT;
BEGIN
  -- Try to find existing contact by email
  SELECT id INTO v_contact_id
  FROM public.crm_contacts
  WHERE user_id = p_user_id
    AND (primary_email = p_email OR p_email = ANY(emails))
  LIMIT 1;
  
  -- If not found, create new contact
  IF v_contact_id IS NULL THEN
    v_display_name := COALESCE(p_name, split_part(p_email, '@', 1));
    
    INSERT INTO public.crm_contacts (
      user_id,
      full_name,
      primary_email,
      emails,
      origin
    ) VALUES (
      p_user_id,
      v_display_name,
      p_email,
      ARRAY[p_email],
      'email-import'
    )
    RETURNING id INTO v_contact_id;
  END IF;
  
  RETURN v_contact_id;
END;
$$;

-- Function to link email to contact
CREATE OR REPLACE FUNCTION public.link_email_to_contact(
  p_user_id UUID,
  p_external_id TEXT,
  p_provider TEXT,
  p_account_id TEXT,
  p_direction TEXT,
  p_from_email TEXT,
  p_from_name TEXT,
  p_to_emails TEXT[],
  p_subject TEXT,
  p_snippet TEXT,
  p_received_at TIMESTAMPTZ,
  p_unread BOOLEAN DEFAULT TRUE,
  p_starred BOOLEAN DEFAULT FALSE,
  p_has_attachments BOOLEAN DEFAULT FALSE,
  p_thread_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contact_id UUID;
  v_email_id UUID;
BEGIN
  -- Find or create contact based on direction
  IF p_direction = 'inbound' THEN
    -- Inbound: contact is the sender
    v_contact_id := public.find_or_create_contact_by_email(p_user_id, p_from_email, p_from_name);
  ELSE
    -- Outbound: contact is the primary recipient
    IF array_length(p_to_emails, 1) > 0 THEN
      v_contact_id := public.find_or_create_contact_by_email(p_user_id, p_to_emails[1], NULL);
    ELSE
      RAISE EXCEPTION 'Outbound email must have at least one recipient';
    END IF;
  END IF;
  
  -- Insert or update email record
  INSERT INTO public.crm_emails (
    user_id,
    contact_id,
    external_id,
    provider,
    account_id,
    direction,
    from_email,
    from_name,
    to_emails,
    subject,
    snippet,
    received_at,
    unread,
    starred,
    has_attachments,
    thread_id
  ) VALUES (
    p_user_id,
    v_contact_id,
    p_external_id,
    p_provider,
    p_account_id,
    p_direction,
    p_from_email,
    p_from_name,
    p_to_emails,
    p_subject,
    p_snippet,
    p_received_at,
    p_unread,
    p_starred,
    p_has_attachments,
    p_thread_id
  )
  ON CONFLICT (external_id, account_id) DO UPDATE
  SET
    unread = EXCLUDED.unread,
    starred = EXCLUDED.starred
  RETURNING id INTO v_email_id;
  
  -- Update contact's last interaction time
  UPDATE public.crm_contacts
  SET 
    last_interaction_at = GREATEST(COALESCE(last_interaction_at, p_received_at), p_received_at),
    updated_at = NOW()
  WHERE id = v_contact_id;
  
  RETURN v_email_id;
END;
$$;

--------------------------------------------------------------------------------
-- 6. Row Level Security (RLS)
--------------------------------------------------------------------------------

ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_client_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_client_context_history ENABLE ROW LEVEL SECURITY;

-- Contacts policies
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.crm_contacts;
CREATE POLICY "Users can view their own contacts"
  ON public.crm_contacts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.crm_contacts;
CREATE POLICY "Users can insert their own contacts"
  ON public.crm_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own contacts" ON public.crm_contacts;
CREATE POLICY "Users can update their own contacts"
  ON public.crm_contacts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.crm_contacts;
CREATE POLICY "Users can delete their own contacts"
  ON public.crm_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Emails policies
DROP POLICY IF EXISTS "Users can view their own emails" ON public.crm_emails;
CREATE POLICY "Users can view their own emails"
  ON public.crm_emails FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own emails" ON public.crm_emails;
CREATE POLICY "Users can insert their own emails"
  ON public.crm_emails FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own emails" ON public.crm_emails;
CREATE POLICY "Users can update their own emails"
  ON public.crm_emails FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own emails" ON public.crm_emails;
CREATE POLICY "Users can delete their own emails"
  ON public.crm_emails FOR DELETE
  USING (auth.uid() = user_id);

-- Client context policies
DROP POLICY IF EXISTS "Users can view their own client context" ON public.crm_client_context;
CREATE POLICY "Users can view their own client context"
  ON public.crm_client_context FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own client context" ON public.crm_client_context;
CREATE POLICY "Users can insert their own client context"
  ON public.crm_client_context FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own client context" ON public.crm_client_context;
CREATE POLICY "Users can update their own client context"
  ON public.crm_client_context FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own client context" ON public.crm_client_context;
CREATE POLICY "Users can delete their own client context"
  ON public.crm_client_context FOR DELETE
  USING (auth.uid() = user_id);

-- Context history policies
DROP POLICY IF EXISTS "Users can view their own context history" ON public.crm_client_context_history;
CREATE POLICY "Users can view their own context history"
  ON public.crm_client_context_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own context history" ON public.crm_client_context_history;
CREATE POLICY "Users can insert their own context history"
  ON public.crm_client_context_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 7. Comments
--------------------------------------------------------------------------------

COMMENT ON TABLE public.crm_contacts IS 'Contact-centric profiles for people, companies, and organizations';
COMMENT ON TABLE public.crm_emails IS 'Emails linked to contacts for relationship tracking';
COMMENT ON TABLE public.crm_client_context IS 'AI-generated relationship intelligence per contact';
COMMENT ON TABLE public.crm_client_context_history IS 'Historical snapshots of client context for drift analysis';

COMMENT ON FUNCTION public.find_or_create_contact_by_email IS 'Find existing contact by email or create new one';
COMMENT ON FUNCTION public.link_email_to_contact IS 'Link an email to its associated contact, creating contact if needed';

