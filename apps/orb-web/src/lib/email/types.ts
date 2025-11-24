/**
 * Email Types
 * 
 * Unified email data structures for Gmail and iCloud Mail
 */

export type EmailProvider = 'gmail' | 'icloud';

export interface EmailAccount {
  id: string;
  provider: EmailProvider;
  email: string;
  displayName: string;
  connected: boolean;
  lastSync?: Date;
  accessToken?: string;
  refreshToken?: string;
}

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number; // bytes
  url?: string;
}

export interface Email {
  id: string;
  accountId: string;
  provider: EmailProvider;
  threadId?: string;
  
  // Headers
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress;
  subject: string;
  
  // Content
  body: {
    text?: string;
    html?: string;
  };
  snippet: string; // preview text
  
  // Metadata
  date: Date;
  labels?: string[];
  flags?: string[];
  unread: boolean;
  starred: boolean;
  important?: boolean;
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
  
  // Thread info
  inReplyTo?: string;
  references?: string[];
  
  // Raw data (for debugging/advanced use)
  raw?: unknown;
}

export interface EmailThread {
  id: string;
  accountId: string;
  provider: EmailProvider;
  subject: string;
  snippet: string;
  participants: EmailAddress[];
  messageCount: number;
  unreadCount: number;
  lastMessageDate: Date;
  labels?: string[];
  starred: boolean;
  important?: boolean;
  messages?: Email[];
}

export interface EmailFilter {
  accountId?: string;
  provider?: EmailProvider;
  unread?: boolean;
  starred?: boolean;
  hasAttachments?: boolean;
  from?: string;
  to?: string;
  subject?: string;
  labels?: string[];
  after?: Date;
  before?: Date;
  limit?: number;
  offset?: number;
}

export interface EmailSendRequest {
  accountId: string;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: {
    text?: string;
    html?: string;
  };
  attachments?: File[];
  inReplyTo?: string;
  references?: string[];
}

export interface EmailSearchResult {
  emails: Email[];
  threads: EmailThread[];
  total: number;
  hasMore: boolean;
}

