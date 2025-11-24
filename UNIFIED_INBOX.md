# Unified Inbox - Documentation

## Overview

The **Unified Inbox** (`/inbox`) is the primary communications hub in Orb. It combines emails, messages, and contacts into a single, filterable view, making it easy to see all communications in one place or drill down into specific categories.

## Features

### ✅ Implemented

1. **Unified View**
   - All communications (emails, messages, contacts) in one chronological feed
   - Smart date formatting (Today, Yesterday, dates)
   - Type indicators with color coding

2. **Intelligent Filtering**
   - **View Filters**: All, Emails only, Messages only, Contacts only
   - **Account Filtering**: See specific email accounts or messaging providers
   - **Unread Filter**: Toggle to show only unread items
   - **Search**: Full-text search across from, subject, and content

3. **Real-time Stats**
   - Total items count
   - Breakdown by type (emails, messages, contacts)
   - Unread count across all sources

4. **Smart UI**
   - Loading states with skeleton screens
   - Error handling with retry option
   - Empty states with quick action links
   - Responsive design

5. **Integration**
   - Auto-fetches from all connected accounts
   - Context-based data management
   - Seamless navigation to detail views

## Architecture

```
apps/orb-web/src/
├── contexts/
│   └── InboxContext.tsx          # Global inbox state & data fetching
├── lib/
│   └── inbox/
│       ├── types.ts              # TypeScript interfaces
│       ├── unifier.ts            # Converts emails/messages/contacts to unified format
│       └── index.ts              # Public API
└── pages/
    └── inbox/
        └── InboxHome.tsx         # Main unified inbox UI
```

### Data Flow

```
┌─────────────────┐
│  InboxContext   │  ← Wraps entire app
└────────┬────────┘
         │
         ├─→ emailClient.fetchEmails()
         ├─→ messageClient.fetchMessages() (TODO)
         ├─→ contactClient.fetchContacts() (TODO)
         │
         ↓
    mergeAndSort()  ← Converts to UnifiedItem[]
         │
         ↓
   ┌─────────────┐
   │ InboxHome   │  ← Applies filters
   └─────────────┘
         │
         ↓
    filteredItems
```

## Usage

### Accessing the Unified Inbox

Navigate to `/inbox` or click **📥 Inbox** in the main navigation (highlighted in Orb color).

### Using the Context

```typescript
import { useInbox } from '@/contexts/InboxContext';

function MyComponent() {
  const { items, loading, error, stats, refresh } = useInbox();
  
  // items: UnifiedItem[] - all communications
  // loading: boolean - fetching state
  // error: string | null - error message
  // stats: InboxStats - counts by type
  // refresh: () => Promise<void> - refetch data
  
  return (
    <div>
      <p>Total: {stats.total}</p>
      <p>Unread: {stats.unread}</p>
      {items.map(item => (
        <div key={item.id}>{item.snippet}</div>
      ))}
    </div>
  );
}
```

### Converting Data to Unified Format

```typescript
import { emailToUnified, messageToUnified, mergeAndSort } from '@/lib/inbox';

// Convert individual items
const unifiedEmail = emailToUnified(email);
const unifiedMessage = messageToUnified(message);

// Merge multiple sources
const unified = mergeAndSort(emails, messages, contacts);
```

### Filtering Items

```typescript
import { filterItems } from '@/lib/inbox';

const filtered = filterItems(items, {
  type: 'email',           // 'all', 'email', 'message', 'contact'
  accountId: 'user@gmail.com',
  unread: true,
  starred: true,
  search: 'important',
});
```

### Grouping by Thread or Contact

```typescript
import { groupByThread, groupByContact } from '@/lib/inbox';

// Group by conversation thread
const threads = groupByThread(items);
// Returns: Map<threadId, UnifiedItem[]>

// Group by contact
const contacts = groupByContact(items);
// Returns: Map<contactKey, UnifiedItem[]>
```

## Data Types

### UnifiedItem

The core data structure for all communications:

```typescript
interface UnifiedItem {
  id: string;                    // Unique ID (prefixed: email-, message-, contact-)
  type: 'email' | 'message' | 'contact';
  
  // Common fields
  from: UnifiedContact;
  to?: UnifiedContact[];
  subject?: string;              // Emails only
  snippet: string;               // Preview text
  date: Date;
  
  // Status flags
  unread: boolean;
  starred?: boolean;
  important?: boolean;
  hasAttachments?: boolean;
  
  // Metadata
  provider?: string;             // 'gmail', 'icloud', 'whatsapp', etc.
  accountId?: string;
  threadId?: string;
  labels?: string[];
  
  // Original data (for accessing raw details)
  original: Email | Message | Contact;
}
```

### UnifiedContact

```typescript
interface UnifiedContact {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}
```

### InboxStats

```typescript
interface InboxStats {
  total: number;
  emails: number;
  messages: number;
  contacts: number;
  unread: number;
  starred: number;
  important: number;
}
```

## UI Components

### InboxHome

**Location**: `apps/orb-web/src/pages/inbox/InboxHome.tsx`

Main unified inbox page with:
- View filter buttons (All, Emails, Messages, Contacts)
- Search bar
- Unread toggle
- Communication feed
- Loading/error/empty states

### UnifiedItemCard

Displays a single communication item with:
- Type icon (📧, 💬, 👤)
- From name/email
- Subject (for emails)
- Snippet
- Status indicators (unread, starred, attachments)
- Provider badge
- Smart date formatting

### Color Coding

- **Emails**: `text-accent-sol` (cyan)
- **Messages**: `text-accent-mav` (orange)
- **Contacts**: `text-accent-luna` (purple)
- **Inbox** (nav): `text-accent-orb` (blue)

## Integration with Existing Pages

The unified inbox **complements** existing pages:

- **`/inbox`** - Unified view (primary interface)
- **`/emails`** - Detailed email management
- **`/messages`** - Messaging-specific features
- **`/contacts`** - Contact management & CRM

Users can:
1. Start in `/inbox` to see everything
2. Filter to specific types
3. Click items to navigate to detail pages:
   - Email → `/emails/{id}`
   - Message → `/messages/{id}`
   - Contact → `/contacts/{id}`

## Navigation Flow

```
┌─────────────────────────────────────────────┐
│         📥 Inbox (Unified View)              │
│  • All communications chronologically        │
│  • Filter by type, account, unread          │
│  • Search across everything                  │
└──────┬──────────┬─────────────┬──────────────┘
       │          │             │
       ↓          ↓             ↓
  ┌────────┐ ┌─────────┐ ┌──────────┐
  │ Emails │ │Messages │ │ Contacts │
  │        │ │         │ │          │
  │Detailed│ │Specific │ │   CRM    │
  │  View  │ │Features │ │ Features │
  └────────┘ └─────────┘ └──────────┘
```

## Implementation Status

### ✅ Complete

- [x] Unified inbox UI
- [x] InboxContext for data management
- [x] Filter system (type, account, unread, search)
- [x] Email integration
- [x] UnifiedItem type system
- [x] Conversion utilities (emailToUnified, etc.)
- [x] Navigation integration
- [x] Loading/error/empty states
- [x] Smart date formatting
- [x] Stats calculation

### 🚧 In Progress

- [ ] Message provider integration
- [ ] Contact provider integration
- [ ] Thread view (conversation grouping)
- [ ] Contact grouping view

### 📋 Planned

- [ ] Mark as read/unread from inbox
- [ ] Star/unstar from inbox
- [ ] Archive/delete from inbox
- [ ] Quick reply (inline compose)
- [ ] Keyboard shortcuts (j/k navigation, etc.)
- [ ] Infinite scroll / pagination
- [ ] Real-time updates (websockets)
- [ ] Notification badges
- [ ] Filter persistence (save view preferences)
- [ ] Custom views/saved searches
- [ ] Bulk actions (select multiple, mark all read, etc.)
- [ ] Split view (inbox + detail side-by-side)

## Performance Considerations

### Current Approach

- All items loaded into memory (up to 100 per source)
- Client-side filtering (fast for <1000 items)
- Single fetch on mount + manual refresh

### Future Optimizations

1. **Pagination**: Load items in batches
2. **Virtual Scrolling**: Render only visible items
3. **Incremental Loading**: Fetch more as user scrolls
4. **Caching**: Store fetched data in IndexedDB
5. **Background Sync**: Auto-refresh every N minutes
6. **Optimistic Updates**: Update UI immediately, sync later

## Testing

### Manual Testing Checklist

- [ ] Connect email account
- [ ] Navigate to `/inbox`
- [ ] Verify emails appear in unified feed
- [ ] Test "All" filter shows all items
- [ ] Test "Emails" filter shows only emails
- [ ] Test "Messages" filter (when implemented)
- [ ] Test "Contacts" filter (when implemented)
- [ ] Test unread toggle
- [ ] Test search functionality
- [ ] Click email → navigates to detail page
- [ ] Verify loading state appears during fetch
- [ ] Test error state (disconnect network)
- [ ] Test empty state (no accounts connected)

### Unit Tests (TODO)

```typescript
// Test data conversion
describe('emailToUnified', () => {
  it('converts email to unified format', () => {
    const email = createMockEmail();
    const unified = emailToUnified(email);
    expect(unified.type).toBe('email');
    expect(unified.id).toMatch(/^email-/);
  });
});

// Test filtering
describe('filterItems', () => {
  it('filters by type', () => {
    const items = [createEmailItem(), createMessageItem()];
    const filtered = filterItems(items, { type: 'email' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].type).toBe('email');
  });
});
```

## Troubleshooting

### No items showing up

1. Check if accounts are connected:
   ```typescript
   const { stats } = useInbox();
   console.log(stats); // Should show counts
   ```

2. Verify email client has accounts:
   ```typescript
   import { emailClient } from '@/lib/email';
   console.log(emailClient.getAllAccounts());
   ```

3. Check for errors:
   ```typescript
   const { error } = useInbox();
   console.log(error);
   ```

### Filters not working

- Clear all filters and try again
- Check console for JavaScript errors
- Verify `filterItems` function is working:
  ```typescript
  const filtered = filterItems(items, { type: 'email' });
  console.log(filtered.length, items.length);
  ```

### Performance issues

- Check number of items:
  ```typescript
  const { items } = useInbox();
  console.log('Item count:', items.length);
  ```
- If >500 items, consider implementing pagination

## Future Enhancements

### Smart Features

1. **AI-Powered Prioritization**
   - Sol analyzes importance
   - Urgent items float to top
   - "Focus Mode" hides non-critical

2. **Conversation Intelligence**
   - Detect related items across types
   - Link emails ↔ messages ↔ contacts
   - Show conversation history

3. **Context-Aware Actions**
   - Quick replies with AI suggestions
   - Smart categorization
   - Auto-scheduling from emails

4. **Luna Integration**
   - Learn user preferences
   - Adapt filtering based on behavior
   - Personalized inbox experience

### UX Improvements

1. **Compact/Comfortable/Spacious density**
2. **Dark/Light theme toggle**
3. **Custom color schemes per account**
4. **Drag-and-drop for organization**
5. **Swipe gestures (mobile)**

## Resources

- See `EMAIL_INTEGRATION.md` for email setup
- See `SCAFFOLDING_SUMMARY.md` for full app overview
- Check `src/lib/inbox/types.ts` for all type definitions

---

**Status**: ✅ Core functionality complete, ready for use!

The unified inbox is fully functional with email integration. Messages and contacts will be added as those providers are implemented.

