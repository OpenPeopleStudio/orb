/**
 * iCloud Mail Integration
 * 
 * IMAP/SMTP integration for iCloud Mail via proxy server
 * Note: iCloud doesn't have a public API, so we need to use IMAP/SMTP
 */

import type { Email, EmailAccount, EmailFilter, EmailSearchResult, EmailSendRequest } from './types';

/**
 * iCloud Mail requires app-specific password
 * User must generate one at appleid.apple.com
 */
export async function connectICloudAccount(
  email: string,
  appPassword: string
): Promise<EmailAccount> {
  // Validate credentials by attempting IMAP connection
  // This would typically be done through a backend proxy
  const backendUrl = import.meta.env.VITE_API_URL;
  
  if (!backendUrl) {
    throw new Error('VITE_API_URL not configured');
  }
  
  const response = await fetch(`${backendUrl}/api/email/icloud/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password: appPassword,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to connect to iCloud');
  }
  
  const data = await response.json();
  
  return {
    id: data.accountId,
    provider: 'icloud',
    email,
    displayName: email.split('@')[0],
    connected: true,
    lastSync: new Date(),
    accessToken: data.sessionToken, // Backend-managed session
  };
}

/**
 * Fetch emails from iCloud via IMAP proxy
 */
export async function fetchICloudEmails(
  account: EmailAccount,
  filter: EmailFilter = {}
): Promise<EmailSearchResult> {
  const backendUrl = import.meta.env.VITE_API_URL;
  
  if (!backendUrl) {
    throw new Error('VITE_API_URL not configured');
  }
  
  const params = new URLSearchParams();
  params.set('accountId', account.id);
  if (filter.unread !== undefined) params.set('unread', filter.unread.toString());
  if (filter.starred !== undefined) params.set('starred', filter.starred.toString());
  if (filter.limit) params.set('limit', filter.limit.toString());
  if (filter.offset) params.set('offset', filter.offset.toString());
  if (filter.subject) params.set('subject', filter.subject);
  if (filter.from) params.set('from', filter.from);
  
  const response = await fetch(`${backendUrl}/api/email/icloud/messages?${params}`, {
    headers: {
      Authorization: `Bearer ${account.accessToken}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch iCloud emails');
  }
  
  const data = await response.json() as { messages: ImapMessage[]; total: number; hasMore: boolean };
  
  return {
    emails: data.messages.map((msg: ImapMessage) => parseICloudMessage(msg, account)),
    threads: [],
    total: data.total,
    hasMore: data.hasMore,
  };
}

interface ImapEmailAddress {
  name?: string;
  email: string;
}

interface ImapAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface ImapMessage {
  id: string;
  threadId?: string;
  from: ImapEmailAddress;
  to: ImapEmailAddress[];
  cc?: ImapEmailAddress[];
  subject?: string;
  textBody?: string;
  htmlBody?: string;
  snippet?: string;
  date: string | Date;
  flags?: string[];
  hasAttachments?: boolean;
  attachments?: ImapAttachment[];
}

/**
 * Parse IMAP message format to our Email type
 */
function parseICloudMessage(imapMsg: ImapMessage, account: EmailAccount): Email {
  return {
    id: imapMsg.id,
    accountId: account.id,
    provider: 'icloud',
    threadId: imapMsg.threadId,
    from: {
      name: imapMsg.from.name,
      email: imapMsg.from.email,
    },
    to: imapMsg.to.map((t: ImapEmailAddress) => ({
      name: t.name,
      email: t.email,
    })),
    cc: imapMsg.cc?.map((t: ImapEmailAddress) => ({
      name: t.name,
      email: t.email,
    })),
    subject: imapMsg.subject || '(no subject)',
    body: {
      text: imapMsg.textBody,
      html: imapMsg.htmlBody,
    },
    snippet: imapMsg.snippet || '',
    date: new Date(imapMsg.date),
    flags: imapMsg.flags || [],
    unread: !imapMsg.flags?.includes('\\Seen'),
    starred: imapMsg.flags?.includes('\\Flagged') || false,
    hasAttachments: imapMsg.hasAttachments || false,
    attachments: imapMsg.attachments,
    raw: imapMsg,
  };
}

/**
 * Send email via iCloud using SMTP proxy
 */
export async function sendICloudEmail(
  account: EmailAccount,
  request: EmailSendRequest
): Promise<Email> {
  const backendUrl = import.meta.env.VITE_API_URL;
  
  if (!backendUrl) {
    throw new Error('VITE_API_URL not configured');
  }
  
  const response = await fetch(`${backendUrl}/api/email/icloud/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${account.accessToken}`,
    },
    body: JSON.stringify({
      accountId: account.id,
      to: request.to,
      cc: request.cc,
      bcc: request.bcc,
      subject: request.subject,
      body: request.body,
      inReplyTo: request.inReplyTo,
      references: request.references,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send email');
  }
  
  const data = await response.json();
  return parseICloudMessage(data, account);
}

/**
 * Generate app-specific password instructions
 */
export const ICLOUD_APP_PASSWORD_INSTRUCTIONS = `
# iCloud App-Specific Password Setup

1. Sign in to appleid.apple.com
2. Navigate to "Sign-In and Security"
3. Select "App-Specific Passwords"
4. Click "Generate an app-specific password"
5. Enter a label (e.g., "Orb Email")
6. Copy the generated password
7. Use this password to connect your iCloud account

**Important:** Your regular iCloud password will NOT work. You must use an app-specific password.

**Note:** Two-factor authentication must be enabled on your Apple ID to generate app-specific passwords.
`;

