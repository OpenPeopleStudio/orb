/**
 * CRM Types
 * 
 * Types for contact relationship management
 */

export type ContactType = 'person' | 'company' | 'organization';
export type ContactOrigin = 'manual' | 'email-import' | 'calendar' | 'form' | 'api';
export type RelationshipStatus = 'cold' | 'warm' | 'hot' | 'active' | 'dormant' | 'conflict';
export type EmailDirection = 'inbound' | 'outbound';
export type EmailProvider = 'gmail' | 'icloud' | 'outlook' | 'other';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface Contact {
  id: string;
  user_id: string;
  
  // Identity
  full_name: string;
  first_name?: string;
  last_name?: string;
  nickname?: string;
  
  // Type
  type: ContactType;
  
  // Communication
  primary_email?: string;
  emails: string[];
  phones: string[];
  
  // Professional
  company?: string;
  title?: string;
  
  // Origin
  origin: ContactOrigin;
  
  // Categorization
  tags: string[];
  
  // Metadata
  avatar_url?: string;
  notes?: string;
  
  // Relationship
  relationship_status: RelationshipStatus;
  
  // Timestamps
  last_interaction_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CrmEmail {
  id: string;
  user_id: string;
  contact_id: string;
  
  // Email metadata
  external_id: string;
  provider: EmailProvider;
  account_id: string;
  
  // Email data
  direction: EmailDirection;
  from_email: string;
  from_name?: string;
  to_emails: string[];
  cc_emails?: string[];
  bcc_emails?: string[];
  
  subject?: string;
  snippet?: string;
  body_text?: string;
  body_html?: string;
  
  // Thread
  thread_id?: string;
  
  // Status
  unread: boolean;
  starred: boolean;
  has_attachments: boolean;
  
  // Labels
  labels: string[];
  
  // AI enrichment
  ai_summary?: string;
  sentiment_score?: number;
  energy_level?: EnergyLevel;
  urgency?: UrgencyLevel;
  topics?: string[];
  
  // Timestamps
  received_at: string;
  created_at: string;
}

export interface ClientContext {
  id: string;
  contact_id: string;
  user_id: string;
  context_json: ClientContextData;
  created_at: string;
  updated_at: string;
}

export interface ClientContextData {
  summary?: string;
  relationship_status?: RelationshipStatus;
  emotion_trend?: {
    valence: number; // -1 to 1
    energy: EnergyLevel;
    stability: 'stable' | 'volatile';
  };
  roles?: string[];
  key_facts?: string[];
  open_threads?: Array<{
    channel: string;
    thread_id: string;
    topic: string;
    last_message_at: string;
    needs_reply: boolean;
    suggested_tone?: string;
  }>;
  opportunities?: Array<{
    type: string;
    stage: string;
    estimated_value?: number;
    next_action?: string;
  }>;
  risks?: Array<{
    type: string;
    note: string;
  }>;
  system_links?: {
    finance_accounts?: string[];
    swl_guest_profile_id?: string;
    open_people_profile_id?: string;
  };
}

export interface ContactWithEmails extends Contact {
  emails_count: number;
  latest_email?: CrmEmail;
}

export interface ContactFilter {
  search?: string;
  tags?: string[];
  relationship_status?: RelationshipStatus;
  has_email?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateContactRequest {
  full_name: string;
  first_name?: string;
  last_name?: string;
  nickname?: string;
  type?: ContactType;
  primary_email?: string;
  emails?: string[];
  phones?: string[];
  company?: string;
  title?: string;
  tags?: string[];
  notes?: string;
  avatar_url?: string;
  origin?: ContactOrigin;
  relationship_status?: RelationshipStatus;
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {
  id: string;
}

export interface LinkEmailRequest {
  external_id: string;
  provider: EmailProvider;
  account_id: string;
  direction: EmailDirection;
  from_email: string;
  from_name?: string;
  to_emails: string[];
  cc_emails?: string[];
  bcc_emails?: string[];
  subject?: string;
  snippet?: string;
  body_text?: string;
  body_html?: string;
  thread_id?: string;
  unread?: boolean;
  starred?: boolean;
  has_attachments?: boolean;
  labels?: string[];
  received_at: Date;
}

export interface CrmStats {
  total_contacts: number;
  contacts_by_status: Record<RelationshipStatus, number>;
  emails_count: number;
  recent_interactions: number; // Last 7 days
}

