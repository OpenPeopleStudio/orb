# Email Integration Documentation

## Overview

Orb now has full email integration supporting both **Gmail** and **iCloud Mail**. This document explains the architecture, setup, and usage.

## Features

### ✅ Implemented

- **Gmail Integration**
  - OAuth 2.0 authentication
  - Fetch emails with filters (unread, starred, attachments, date range, etc.)
  - Send emails
  - Full message parsing (headers, body, attachments)
  - Label support

- **iCloud Mail Integration**
  - App-specific password authentication  
  - IMAP-based email fetching via backend proxy
  - SMTP-based email sending via backend proxy
  - Full message parsing

- **Unified Email Client**
  - Single interface for both providers
  - Merged inbox view across all accounts
  - Account-specific filtering
  - Consistent data structures

- **UI Components**
  - Email list with smart date formatting
  - Email composer with Cc/Bcc support
  - Account switcher
  - Unread/starred/attachment indicators

## Architecture

```
apps/orb-web/src/lib/email/
├── types.ts          # TypeScript interfaces for emails, accounts, etc.
├── gmail.ts          # Gmail API integration (OAuth + REST API)
├── icloud.ts         # iCloud Mail integration (IMAP/SMTP via proxy)
└── index.ts          # Unified EmailClient class

apps/orb-web/src/components/
├── EmailList.tsx     # Email list display
└── EmailComposer.tsx # Compose/reply interface

apps/orb-web/src/pages/emails/
├── EmailsHome.tsx    # Main email inbox page
└── EmailDetail.tsx   # Single email view
```

## Setup

### Environment Variables

```bash
# Gmail OAuth (frontend)
VITE_GOOGLE_CLIENT_ID=your-client-id
VITE_GOOGLE_CLIENT_SECRET=your-client-secret

# iCloud (requires backend proxy)
VITE_API_URL=https://your-backend.com

# Optional: Supabase for storing account credentials
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Gmail Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth 2.0 credentials
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:4323/auth/gmail/callback`
5. Copy Client ID and Client Secret to `.env`

### iCloud Setup

1. Sign in to [appleid.apple.com](https://appleid.apple.com/)
2. Go to "Sign-In and Security"
3. Select "App-Specific Passwords"
4. Generate password for "Orb Email"
5. Use this password (NOT your regular iCloud password)

**Note:** Two-factor authentication must be enabled on your Apple ID.

## Usage

### Connecting Accounts

```typescript
import { initGmailAuth, connectICloudAccount, emailClient } from '@/lib/email';

// Gmail
const authUrl = await initGmailAuth();
window.location.href = authUrl; // Redirect to OAuth

// iCloud
const account = await connectICloudAccount(
  'user@icloud.com',
  'app-specific-password'
);
emailClient.addAccount(account);
```

### Fetching Emails

```typescript
import { emailClient } from '@/lib/email';

// All accounts
const result = await emailClient.fetchEmails({
  limit: 50,
  unread: true,
});

// Specific account
const result = await emailClient.fetchEmails({
  accountId: 'user@gmail.com',
  starred: true,
});

// With filters
const result = await emailClient.fetchEmails({
  from: 'sender@example.com',
  subject: 'important',
  after: new Date('2024-01-01'),
  hasAttachments: true,
});
```

### Sending Emails

```typescript
import { emailClient } from '@/lib/email';

const email = await emailClient.sendEmail({
  accountId: 'user@gmail.com',
  to: [{ email: 'recipient@example.com', name: 'John Doe' }],
  cc: [{ email: 'cc@example.com' }],
  subject: 'Hello from Orb',
  body: {
    text: 'Plain text body',
    html: '<p>HTML body</p>',
  },
});
```

## Data Structures

### Email

```typescript
interface Email {
  id: string;
  accountId: string;
  provider: 'gmail' | 'icloud';
  
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  
  body: {
    text?: string;
    html?: string;
  };
  snippet: string;
  
  date: Date;
  unread: boolean;
  starred: boolean;
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
}
```

### EmailAccount

```typescript
interface EmailAccount {
  id: string;
  provider: 'gmail' | 'icloud';
  email: string;
  displayName: string;
  connected: boolean;
  accessToken?: string;
  refreshToken?: string;
}
```

## Backend Requirements (for iCloud)

Since iCloud doesn't have a public API, you need a backend proxy to handle IMAP/SMTP:

### Required Endpoints

```
POST /api/email/icloud/connect
  - Validates credentials and creates session
  - Returns: { accountId, sessionToken }

GET /api/email/icloud/messages?accountId=...&limit=...&unread=...
  - Fetches emails via IMAP
  - Returns: { messages[], total, hasMore }

POST /api/email/icloud/send
  - Sends email via SMTP
  - Returns: { success, messageId }
```

### Example Implementation (Node.js)

```javascript
// Using node-imap and nodemailer
import Imap from 'node-imap';
import nodemailer from 'nodemailer';

const imap = new Imap({
  user: 'user@icloud.com',
  password: 'app-specific-password',
  host: 'imap.mail.me.com',
  port: 993,
  tls: true,
});

const smtp = nodemailer.createTransport({
  host: 'smtp.mail.me.com',
  port: 587,
  secure: false,
  auth: {
    user: 'user@icloud.com',
    pass: 'app-specific-password',
  },
});
```

## Security Considerations

1. **Never commit credentials** - Use environment variables
2. **Store tokens securely** - Consider using Supabase or encrypted storage
3. **HTTPS only** - Always use HTTPS in production
4. **Token refresh** - Implement automatic token refresh for Gmail
5. **Rate limiting** - Respect API rate limits
6. **App passwords** - For iCloud, ALWAYS use app-specific passwords

## Troubleshooting

### Gmail: "Access blocked" error
- Ensure OAuth consent screen is configured
- Add test users if app is in testing mode
- Check redirect URI matches exactly

### iCloud: Authentication failed
- Verify two-factor authentication is enabled
- Use app-specific password, NOT regular password
- Check IMAP is enabled (Settings → iCloud → Mail)

### General: No emails showing
- Check account is connected (`emailClient.getAllAccounts()`)
- Verify access tokens are valid
- Check browser console for errors
- Test API endpoints directly

## Next Steps

### Planned Features

- [ ] Email threading/conversation view
- [ ] Rich text editor for composing
- [ ] Attachment upload/download
- [ ] Search functionality
- [ ] Labels/folders management
- [ ] Push notifications for new emails
- [ ] Offline mode with IndexedDB cache
- [ ] Email rules/filters
- [ ] Keyboard shortcuts

## Example: Full Integration

```typescript
import { useEffect, useState } from 'react';
import { emailClient } from '@/lib/email';
import EmailList from '@/components/EmailList';
import EmailComposer from '@/components/EmailComposer';

export default function EmailsPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      const result = await emailClient.fetchEmails({ limit: 50 });
      setEmails(result.emails);
    } catch (error) {
      console.error('Failed to load emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (request) => {
    await emailClient.sendEmail(request);
    await loadEmails(); // Refresh
  };

  return (
    <div>
      <button onClick={() => setComposing(true)}>
        New Email
      </button>
      
      <EmailList emails={emails} loading={loading} />
      
      {composing && (
        <EmailComposer
          accounts={emailClient.getAllAccounts()}
          onSend={handleSend}
          onCancel={() => setComposing(false)}
        />
      )}
    </div>
  );
}
```

## Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [iCloud Mail Settings](https://support.apple.com/en-us/HT202304)
- [OAuth 2.0 for Client-side Apps](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
- [IMAP RFC 3501](https://tools.ietf.org/html/rfc3501)

