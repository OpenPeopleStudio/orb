/**
 * Communication Unifier
 * 
 * Converts emails, messages, and contacts into a unified format
 * for the unified inbox view
 */

import type { Email } from '../email';

import type { UnifiedItem, Message, Contact } from './types';

/**
 * Convert an email to a unified item
 */
export function emailToUnified(email: Email): UnifiedItem {
  return {
    id: `email-${email.id}`,
    type: 'email',
    from: {
      name: email.from.name,
      email: email.from.email,
    },
    to: email.to.map(t => ({
      name: t.name,
      email: t.email,
    })),
    subject: email.subject,
    snippet: email.snippet,
    date: email.date,
    unread: email.unread,
    starred: email.starred,
    important: email.important,
    hasAttachments: email.hasAttachments,
    provider: email.provider,
    accountId: email.accountId,
    threadId: email.threadId,
    labels: email.labels,
    original: email,
  };
}

/**
 * Convert a message to a unified item
 */
export function messageToUnified(message: Message): UnifiedItem {
  return {
    id: `message-${message.id}`,
    type: 'message',
    from: message.from,
    to: message.to,
    subject: undefined, // Messages don't have subjects
    snippet: message.body,
    date: message.date,
    unread: message.unread,
    starred: false,
    hasAttachments: (message.attachments?.length || 0) > 0,
    provider: message.provider,
    threadId: message.threadId,
    original: message,
  };
}

/**
 * Convert a contact to a unified item
 */
export function contactToUnified(contact: Contact): UnifiedItem {
  return {
    id: `contact-${contact.id}`,
    type: 'contact',
    from: {
      name: contact.name,
      email: contact.emails?.[0],
      phone: contact.phones?.[0],
      avatar: contact.avatar,
    },
    snippet: [contact.company, contact.title].filter(Boolean).join(' • ') || contact.notes || '',
    date: contact.lastContact || new Date(0),
    unread: false,
    starred: contact.tags?.includes('favorite') || false,
    labels: contact.tags,
    original: contact,
  };
}

/**
 * Merge and sort multiple communication sources
 */
export function mergeAndSort(
  emails: Email[],
  messages: Message[],
  contacts: Contact[]
): UnifiedItem[] {
  const unified: UnifiedItem[] = [
    ...emails.map(emailToUnified),
    ...messages.map(messageToUnified),
    ...contacts.map(contactToUnified),
  ];

  // Sort by date, newest first
  unified.sort((a, b) => b.date.getTime() - a.date.getTime());

  return unified;
}

/**
 * Group items by conversation/thread
 */
export function groupByThread(items: UnifiedItem[]): Map<string, UnifiedItem[]> {
  const threads = new Map<string, UnifiedItem[]>();

  for (const item of items) {
    const threadId = item.threadId || item.id;
    
    if (!threads.has(threadId)) {
      threads.set(threadId, []);
    }
    
    threads.get(threadId)!.push(item);
  }

  return threads;
}

/**
 * Group items by contact
 */
export function groupByContact(items: UnifiedItem[]): Map<string, UnifiedItem[]> {
  const contacts = new Map<string, UnifiedItem[]>();

  for (const item of items) {
    const contactKey = item.from.email || item.from.phone || item.from.name;
    
    if (!contacts.has(contactKey)) {
      contacts.set(contactKey, []);
    }
    
    contacts.get(contactKey)!.push(item);
  }

  return contacts;
}

/**
 * Filter unified items
 */
export function filterItems(
  items: UnifiedItem[],
  filter: {
    type?: 'all' | 'email' | 'message' | 'contact';
    accountId?: string;
    unread?: boolean;
    starred?: boolean;
    search?: string;
  }
): UnifiedItem[] {
  return items.filter((item) => {
    // Type filter
    if (filter.type && filter.type !== 'all' && item.type !== filter.type) {
      return false;
    }

    // Account filter
    if (filter.accountId && item.accountId !== filter.accountId) {
      return false;
    }

    // Unread filter
    if (filter.unread !== undefined && item.unread !== filter.unread) {
      return false;
    }

    // Starred filter
    if (filter.starred !== undefined && item.starred !== filter.starred) {
      return false;
    }

    // Search filter
    if (filter.search) {
      const query = filter.search.toLowerCase();
      const matchesFrom = item.from.name?.toLowerCase().includes(query) ||
                         item.from.email?.toLowerCase().includes(query);
      const matchesSubject = item.subject?.toLowerCase().includes(query);
      const matchesSnippet = item.snippet.toLowerCase().includes(query);
      
      if (!matchesFrom && !matchesSubject && !matchesSnippet) {
        return false;
      }
    }

    return true;
  });
}

