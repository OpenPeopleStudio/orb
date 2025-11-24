/**
 * Gmail API Integration
 * 
 * OAuth 2.0 authentication and Gmail API client for fetching emails
 */

import type { Email, EmailAccount, EmailFilter, EmailSearchResult, EmailSendRequest } from './types';

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
].join(' ');

/**
 * Initialize Gmail OAuth flow
 */
export async function initGmailAuth(): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('VITE_GOOGLE_CLIENT_ID not configured');
  }
  
  const redirectUri = `${window.location.origin}/auth/gmail/callback`;
  const state = crypto.randomUUID();
  
  // Store state for verification
  sessionStorage.setItem('gmail_auth_state', state);
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', GMAIL_SCOPES);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  
  return authUrl.toString();
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeGmailCode(code: string): Promise<EmailAccount> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
  const redirectUri = `${window.location.origin}/auth/gmail/callback`;
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to exchange code');
  }
  
  // Get user profile
  const profileResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
    },
  });
  
  const profile = await profileResponse.json();
  
  return {
    id: profile.emailAddress,
    provider: 'gmail',
    email: profile.emailAddress,
    displayName: profile.emailAddress.split('@')[0],
    connected: true,
    lastSync: new Date(),
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

/**
 * Fetch emails from Gmail
 */
export async function fetchGmailEmails(
  account: EmailAccount,
  filter: EmailFilter = {}
): Promise<EmailSearchResult> {
  const accessToken = account.accessToken;
  
  if (!accessToken) {
    throw new Error('No access token available');
  }
  
  // Build query string
  const query: string[] = [];
  
  if (filter.unread) query.push('is:unread');
  if (filter.starred) query.push('is:starred');
  if (filter.hasAttachments) query.push('has:attachment');
  if (filter.from) query.push(`from:${filter.from}`);
  if (filter.to) query.push(`to:${filter.to}`);
  if (filter.subject) query.push(`subject:${filter.subject}`);
  if (filter.after) query.push(`after:${Math.floor(filter.after.getTime() / 1000)}`);
  if (filter.before) query.push(`before:${Math.floor(filter.before.getTime() / 1000)}`);
  
  const q = query.join(' ');
  const maxResults = filter.limit || 50;
  
  // Fetch message list
  const listUrl = new URL('https://www.googleapis.com/gmail/v1/users/me/messages');
  listUrl.searchParams.set('maxResults', maxResults.toString());
  if (q) listUrl.searchParams.set('q', q);
  
  const listResponse = await fetch(listUrl.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  const listData = await listResponse.json();
  
  if (!listResponse.ok) {
    throw new Error(listData.error?.message || 'Failed to fetch messages');
  }
  
  const messageIds = listData.messages || [];
  
  // Fetch full messages
  const emails = await Promise.all(
    messageIds.map(async (msg: { id: string }) => {
      const msgResponse = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      const msgData = await msgResponse.json();
      return parseGmailMessage(msgData, account);
    })
  );
  
  return {
    emails,
    threads: [],
    total: listData.resultSizeEstimate || emails.length,
    hasMore: !!listData.nextPageToken,
  };
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailPayload {
  headers: GmailHeader[];
  body?: {
    data?: string;
  };
  mimeType?: string;
  parts?: GmailPayloadPart[];
}

interface GmailPayloadPart {
  mimeType?: string;
  body?: {
    data?: string;
  };
  filename?: string;
}

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet: string;
  internalDate: string;
  payload: GmailPayload;
}

/**
 * Parse Gmail API message format to our Email type
 */
function parseGmailMessage(gmailMsg: GmailMessage, account: EmailAccount): Email {
  const headers = gmailMsg.payload.headers.reduce((acc: Record<string, string>, h: GmailHeader) => {
    acc[h.name.toLowerCase()] = h.value;
    return acc;
  }, {});
  
  const getEmailAddress = (headerValue: string) => {
    const match = headerValue.match(/(.+?)\s*<(.+?)>/) || headerValue.match(/(.+)/);
    return {
      name: match?.[1]?.trim(),
      email: match?.[2]?.trim() || match?.[1]?.trim() || '',
    };
  };
  
  const getBody = (payload: GmailPayload): { text?: string; html?: string } => {
    let text: string | undefined;
    let html: string | undefined;
    
    if (payload.body?.data) {
      const decoded = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      if (payload.mimeType === 'text/html') {
        html = decoded;
      } else {
        text = decoded;
      }
    }
    
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          text = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          html = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
    }
    
    return { text, html };
  };
  
  return {
    id: gmailMsg.id,
    accountId: account.id,
    provider: 'gmail',
    threadId: gmailMsg.threadId,
    from: getEmailAddress(headers.from || ''),
    to: (headers.to || '').split(',').map((t: string) => getEmailAddress(t.trim())),
    cc: headers.cc ? headers.cc.split(',').map((t: string) => getEmailAddress(t.trim())) : undefined,
    subject: headers.subject || '(no subject)',
    body: getBody(gmailMsg.payload),
    snippet: gmailMsg.snippet || '',
    date: new Date(parseInt(gmailMsg.internalDate)),
    labels: gmailMsg.labelIds || [],
    unread: gmailMsg.labelIds?.includes('UNREAD') || false,
    starred: gmailMsg.labelIds?.includes('STARRED') || false,
    important: gmailMsg.labelIds?.includes('IMPORTANT'),
    hasAttachments: gmailMsg.payload.parts?.some((p: GmailPayloadPart) => p.filename) || false,
    inReplyTo: headers['in-reply-to'],
    references: headers.references?.split(/\s+/),
    raw: gmailMsg,
  };
}

/**
 * Send email via Gmail
 */
export async function sendGmailEmail(
  account: EmailAccount,
  request: EmailSendRequest
): Promise<Email> {
  const accessToken = account.accessToken;
  
  if (!accessToken) {
    throw new Error('No access token available');
  }
  
  // Create RFC 2822 formatted message
  const lines: string[] = [];
  lines.push(`From: ${account.email}`);
  lines.push(`To: ${request.to.map(a => a.email).join(', ')}`);
  if (request.cc?.length) lines.push(`Cc: ${request.cc.map(a => a.email).join(', ')}`);
  if (request.bcc?.length) lines.push(`Bcc: ${request.bcc.map(a => a.email).join(', ')}`);
  lines.push(`Subject: ${request.subject}`);
  if (request.inReplyTo) lines.push(`In-Reply-To: ${request.inReplyTo}`);
  if (request.references) lines.push(`References: ${request.references.join(' ')}`);
  lines.push('');
  lines.push(request.body.text || request.body.html || '');
  
  const rawMessage = lines.join('\r\n');
  const encodedMessage = btoa(rawMessage).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to send email');
  }
  
  return parseGmailMessage(data, account);
}

