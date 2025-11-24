/**
 * Unified Inbox Types
 * 
 * Types for combining emails, messages, and contacts into a unified view
 */

import type { Email } from '../email';

export type CommunicationType = 'email' | 'message' | 'contact';

export interface UnifiedContact {
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface UnifiedItem {
  id: string;
  type: CommunicationType;
  
  // Common fields
  from: UnifiedContact;
  to?: UnifiedContact[];
  subject?: string;
  snippet: string;
  date: Date;
  
  // Status flags
  unread: boolean;
  starred?: boolean;
  important?: boolean;
  hasAttachments?: boolean;
  
  // Metadata
  provider?: string; // 'gmail', 'icloud', 'whatsapp', etc.
  accountId?: string;
  threadId?: string;
  labels?: string[];
  
  // Original data
  original: Email | Message | Contact;
}

export interface Message {
  id: string;
  provider: 'imessage' | 'sms' | 'whatsapp' | 'telegram';
  from: UnifiedContact;
  to: UnifiedContact[];
  body: string;
  date: Date;
  unread: boolean;
  threadId?: string;
  attachments?: Array<{
    type: string;
    url: string;
  }>;
}

export interface Contact {
  id: string;
  name: string;
  emails?: string[];
  phones?: string[];
  avatar?: string;
  company?: string;
  title?: string;
  notes?: string;
  lastContact?: Date;
  tags?: string[];
  socialProfiles?: Array<{
    platform: string;
    url: string;
  }>;
}

export interface InboxFilter {
  type?: CommunicationType | 'all';
  accountId?: string;
  unread?: boolean;
  starred?: boolean;
  important?: boolean;
  hasAttachments?: boolean;
  from?: string;
  to?: string;
  search?: string;
  after?: Date;
  before?: Date;
  labels?: string[];
}

export interface InboxStats {
  total: number;
  emails: number;
  messages: number;
  contacts: number;
  unread: number;
  starred: number;
  important: number;
}

