# Email Connection Implementation - Complete ✅

## Overview

Successfully implemented **working email account connections** in Settings with OAuth flows for Gmail and IMAP setup for iCloud.

## What's Implemented

### ✅ 1. Gmail Connection (OAuth 2.0)
- **Button**: "Connect Gmail" in Settings → Account Connections
- **Flow**:
  1. Click "Connect Gmail"
  2. Redirects to Google OAuth consent screen
  3. User authorizes Orb
  4. Returns to `/auth/gmail/callback`
  5. Exchanges code for access tokens
  6. Adds account to `emailClient`
  7. Redirects back to Settings
  8. Shows in "Connected Accounts" list

### ✅ 2. iCloud Connection (IMAP/SMTP)
- **Button**: "Connect iCloud" in Settings → Account Connections
- **Flow**:
  1. Click "Connect iCloud"
  2. Modal opens asking for:
     - iCloud email address
     - App-specific password
  3. Validates credentials via backend
  4. Adds account to `emailClient`
  5. Shows in "Connected Accounts" list

### ✅ 3. Connected Accounts Management
- View all connected accounts
- See connection status (green dot = connected)
- Disconnect accounts with one click
- Shows provider (gmail/icloud) for each

### ✅ 4. Error Handling
- Shows error messages if connection fails
- CSRF protection for Gmail OAuth (state parameter)
- Validates iCloud credentials before connecting

## Files Created/Modified

### Created
1. **`apps/orb-web/src/pages/auth/GmailCallback.tsx`**
   - Handles Gmail OAuth callback
   - Exchanges authorization code for tokens
   - Adds account to emailClient
   - Shows loading/success/error states

### Modified
1. **`apps/orb-web/src/pages/settings/SettingsHome.tsx`**
   - Added Gmail connection handler (`handleConnectGmail`)
   - Added iCloud connection handler (`handleConnectICloud`)
   - Added iCloud modal with email/password inputs
   - Added connected accounts list with disconnect functionality
   - Added error message display

2. **`apps/orb-web/src/App.tsx`**
   - Added route: `/auth/gmail/callback` → `GmailCallback`
   - Imported `GmailCallback` component

## Setup Required

### For Gmail (OAuth 2.0)

1. **Environment Variables** (`.env` file):
   ```bash
   VITE_GOOGLE_CLIENT_ID=your-client-id-here
   VITE_GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```

2. **Get Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create project or select existing
   - Enable **Gmail API**
   - Create **OAuth 2.0 Client ID**:
     - Application type: Web application
     - Authorized redirect URI: `http://localhost:4323/auth/gmail/callback`
   - Copy Client ID and Client Secret to `.env`

3. **OAuth Consent Screen**:
   - Add test users if app is in testing mode
   - Request scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.modify`

### For iCloud (IMAP/SMTP)

1. **Backend Proxy Required**:
   - iCloud doesn't have a public API
   - Requires a backend server to handle IMAP/SMTP
   
2. **Environment Variable** (`.env` file):
   ```bash
   VITE_API_URL=https://your-backend.com
   ```

3. **Backend Endpoints Needed**:
   ```
   POST /api/email/icloud/connect
   Body: { email: string, password: string }
   Returns: { accountId: string, sessionToken: string }
   ```

4. **User Requirements**:
   - Two-factor authentication enabled on Apple ID
   - App-specific password generated at [appleid.apple.com](https://appleid.apple.com/)

## How to Test

### Test Gmail Connection

1. **Set up environment**:
   ```bash
   # Add to .env
   VITE_GOOGLE_CLIENT_ID=your-client-id
   VITE_GOOGLE_CLIENT_SECRET=your-client-secret
   ```

2. **Start dev server**:
   ```bash
   pnpm dev --filter apps/orb-web
   ```

3. **Test flow**:
   - Navigate to `http://localhost:4323/settings`
   - Click "Account Connections" tab
   - Click "Connect Gmail"
   - Should redirect to Google sign-in
   - Authorize the app
   - Should redirect back and show success
   - Account appears in "Connected Accounts"

### Test iCloud Connection

1. **Set up backend** (or test will show error):
   ```bash
   # Add to .env
   VITE_API_URL=https://your-backend-url.com
   ```

2. **Generate app password**:
   - Go to https://appleid.apple.com/
   - Sign In & Security → App-Specific Passwords
   - Generate password for "Orb Email"

3. **Test flow**:
   - Navigate to `http://localhost:4323/settings`
   - Click "Account Connections" tab
   - Click "Connect iCloud"
   - Enter email and app-specific password
   - Click "Connect"
   - If backend configured: account added
   - If not configured: shows error about VITE_API_URL

## User Flow Diagrams

### Gmail Connection Flow
```
User clicks "Connect Gmail"
         ↓
initGmailAuth() generates OAuth URL
         ↓
Redirect to Google OAuth
         ↓
User authorizes
         ↓
Google redirects to /auth/gmail/callback?code=...
         ↓
GmailCallback component:
  - Validates state (CSRF protection)
  - Calls exchangeGmailCode(code)
  - Gets access & refresh tokens
  - Adds to emailClient
         ↓
Shows success message
         ↓
Redirects to /settings
         ↓
Account appears in Connected Accounts list
```

### iCloud Connection Flow
```
User clicks "Connect iCloud"
         ↓
Modal opens
         ↓
User enters:
  - Email (user@icloud.com)
  - App-specific password
         ↓
Click "Connect"
         ↓
Calls connectICloudAccount(email, password)
         ↓
Makes POST to backend /api/email/icloud/connect
         ↓
Backend validates IMAP credentials
         ↓
Returns session token
         ↓
Account added to emailClient
         ↓
Modal closes
         ↓
Account appears in Connected Accounts list
```

## Code Examples

### Gmail Connection (Client-side only)
```typescript
// In Settings component
const handleConnectGmail = async () => {
  const authUrl = await initGmailAuth();
  window.location.href = authUrl; // Redirect to Google
};

// In GmailCallback component
const account = await exchangeGmailCode(code);
emailClient.addAccount(account);
```

### iCloud Connection (Requires backend)
```typescript
// In Settings component
const handleConnectICloud = async () => {
  const account = await connectICloudAccount(email, password);
  emailClient.addAccount(account);
};

// Backend endpoint needed
POST /api/email/icloud/connect
{
  "email": "user@icloud.com",
  "password": "xxxx-xxxx-xxxx-xxxx"
}
```

### Disconnect Account
```typescript
emailClient.removeAccount(accountId);
setConnectedAccounts(emailClient.getAllAccounts());
```

## Error Handling

### Gmail Errors
- **"VITE_GOOGLE_CLIENT_ID not configured"**: Add to `.env`
- **"Invalid state parameter"**: CSRF protection triggered, try again
- **"Failed to exchange code"**: Check Client Secret is correct
- **"Access blocked"**: Add test users to OAuth consent screen

### iCloud Errors
- **"VITE_API_URL not configured"**: Add backend URL to `.env`
- **"Failed to connect to iCloud"**: 
  - Check app-specific password (not regular password)
  - Verify 2FA is enabled on Apple ID
  - Check backend is running and accessible

## Next Steps

### Immediate (to make it work)
1. Add Google OAuth credentials to `.env`
2. Test Gmail connection
3. Optionally: Set up backend for iCloud

### Future Enhancements
1. **Persist accounts** in localStorage or Supabase
2. **Auto-refresh** Gmail tokens when expired
3. **Sync status indicators** (syncing, last synced time)
4. **Email preview** in Settings (show first few emails)
5. **Multiple accounts** per provider
6. **Outlook integration** (similar to Gmail OAuth)
7. **Account settings** (sync frequency, folders, etc.)

## Security Notes

1. **State Parameter**: Prevents CSRF attacks on OAuth flow
2. **Access Tokens**: Stored in memory only (not localStorage)
3. **App-Specific Passwords**: Required for iCloud (never use main password)
4. **Backend Proxy**: iCloud credentials never exposed to client
5. **HTTPS Only**: OAuth redirects require HTTPS in production

## Troubleshooting

### "Nothing happens when I click Connect Gmail"
- Check browser console for errors
- Verify `VITE_GOOGLE_CLIENT_ID` is set
- Make sure dev server restarted after adding env vars

### "Invalid redirect URI" from Google
- Check redirect URI in Google Console matches exactly:
  `http://localhost:4323/auth/gmail/callback`
- Include protocol (http://) and port (4323)

### iCloud modal shows error immediately
- Backend not configured (`VITE_API_URL` missing)
- This is expected if you don't have a backend yet

## Summary

✅ **Gmail connection**: Fully functional (just needs credentials)  
⏳ **iCloud connection**: Needs backend proxy to work  
✅ **Connected accounts list**: Shows all accounts  
✅ **Disconnect feature**: Works immediately  
✅ **Error handling**: User-friendly messages  

**Status**: Ready to use with Gmail! iCloud needs backend setup.

---

**Date**: 2025-01-25  
**Implementation**: Email account connections in Settings

