/**
 * Messaging Types
 * 
 * Role: Core messaging layer
 * 
 * Types for email, SMS, and app messages.
 * Ported from SomaOS messaging architecture.
 * 
 * Source: SomaOS EMAIL_LOADING_TROUBLESHOOTING.md, GMAIL_MIGRATION_LINKS.md
 */

/**
 * Message Channel - where the message was sent/received
 */
export enum MessageChannel {
  EMAIL = 'email',
  SMS = 'sms',
  APP = 'app', // In-app messages
}

/**
 * Message Status
 */
export enum MessageStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  RECEIVED = 'received',
  READ = 'read',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

/**
 * Message Priority
 */
export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Orb Message - base message type
 */
export interface OrbMessage {
  id: string;
  channel: MessageChannel;
  status: MessageStatus;
  priority: MessagePriority;
  
  // Sender/Recipient
  from: string; // Email address, phone number, or user ID
  to: string[]; // Array of recipients
  cc?: string[];
  bcc?: string[];
  
  // Content
  subject?: string;
  body: string;
  htmlBody?: string;
  
  // Metadata
  threadId?: string; // For grouping related messages
  inReplyTo?: string; // Message ID this is replying to
  references?: string[]; // Message IDs in conversation
  
  // Timestamps
  sentAt?: string; // ISO timestamp
  receivedAt?: string; // ISO timestamp
  readAt?: string; // ISO timestamp
  
  // Attachments
  attachments?: MessageAttachment[];
  
  // User context
  userId: string;
  deviceId?: string;
  
  // Metadata
  metadata?: Record<string, unknown>;
}

/**
 * Message Attachment
 */
export interface MessageAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number; // bytes
  url?: string; // URL to download
  data?: string; // Base64 encoded data
}

/**
 * Email Message - specific to email channel
 */
export interface EmailMessage extends OrbMessage {
  channel: MessageChannel.EMAIL;
  from: string; // Email address
  to: string[]; // Email addresses
  cc?: string[];
  bcc?: string[];
  
  // Email-specific
  headers?: Record<string, string>;
  messageId?: string; // RFC 5322 Message-ID
  inReplyTo?: string;
  references?: string[];
}

/**
 * SMS Message - specific to SMS channel
 */
export interface SmsMessage extends OrbMessage {
  channel: MessageChannel.SMS;
  from: string; // Phone number
  to: string[]; // Phone numbers
  body: string; // SMS body (no HTML)
}

/**
 * App Message - in-app messaging
 */
export interface AppMessage extends OrbMessage {
  channel: MessageChannel.APP;
  from: string; // User ID
  to: string[]; // User IDs
  appId?: string; // Which app/service
}

/**
 * Message Thread - collection of related messages
 */
export interface MessageThread {
  id: string;
  threadId: string;
  channel: MessageChannel;
  subject?: string;
  participants: string[];
  messages: OrbMessage[];
  unreadCount: number;
  lastMessageAt: string; // ISO timestamp
  userId: string;
}

/**
 * Message Filter - for querying messages
 */
export interface MessageFilter {
  channel?: MessageChannel;
  status?: MessageStatus;
  priority?: MessagePriority;
  from?: string;
  to?: string;
  threadId?: string;
  userId: string;
  dateFrom?: string; // ISO timestamp
  dateTo?: string; // ISO timestamp
  search?: string; // Full-text search
}

