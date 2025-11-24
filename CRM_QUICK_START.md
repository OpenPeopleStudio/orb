# CRM Quick Start Guide

## Setup (5 minutes)

### 1. Run the Database Migration

```bash
cd C:\Users\toml_\Code\orb

# If using Supabase CLI
supabase db push

# Or apply directly to your database
# Make sure your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
```

### 2. Verify Migration

Open Supabase Studio or run:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'crm_%';

-- Should show:
-- crm_contacts
-- crm_emails
-- crm_client_context
-- crm_client_context_history
```

### 3. Start the Dev Server

```bash
pnpm dev --filter apps/orb-web
```

## Testing the CRM (10 minutes)

### Test 1: Automatic Contact Creation from Emails

1. **Navigate to** `http://localhost:4323/emails`
2. **Connect an email account** (Gmail or iCloud)
3. **Fetch emails** - the app will automatically:
   - Sync emails with CRM
   - Create contacts for all unique email addresses
   - Link emails to contacts
4. **Navigate to** `http://localhost:4323/contacts`
5. **Verify** contacts appear in the list

**Expected Result**: You should see contacts with:
- Names (or email usernames if name not available)
- Email addresses
- Email counts
- Last interaction dates
- Relationship status: "cold" (default)
- Origin: "email-import"

### Test 2: View Contact Details

1. **Click on any contact** in the list
2. **Verify the contact detail page** shows:
   - Full profile information
   - Email timeline with all communications
   - Inbound/outbound indicators
   - Timestamps for each email
   - Tabs: Timeline / Details

### Test 3: Search and Filter

1. **Go to** `/contacts`
2. **Try searching** for:
   - Contact name
   - Email address
   - Company name
3. **Try filtering** by relationship status:
   - All
   - Hot, Warm, Active, Cold, Dormant

### Test 4: Unified Inbox Integration

1. **Navigate to** `/inbox`
2. **Verify** you can see:
   - Emails from your account
   - Contacts from CRM (if you click "Contacts" filter)
3. **Click** on an email
4. **Verify** it shows the linked contact

### Test 5: Statistics

1. **Go to** `/contacts`
2. **Check the stats dashboard** at the top:
   - Total Contacts
   - Emails Tracked
   - Recent (7 days)
   - Active contacts

## Manual Testing Checklist

- [ ] Contacts auto-create from Gmail emails
- [ ] Contacts auto-create from iCloud emails
- [ ] Contact list displays correctly
- [ ] Search works across names/emails/companies
- [ ] Filter by relationship status works
- [ ] Contact detail page loads
- [ ] Email timeline shows all communications
- [ ] Inbound/outbound emails are labeled correctly
- [ ] Stats are accurate
- [ ] No duplicate contacts for same email
- [ ] Last interaction date updates
- [ ] Unified inbox shows contacts

## Common Issues & Solutions

### Issue: Contacts not appearing

**Solution**:
1. Check browser console for errors
2. Verify Supabase environment variables are set:
   ```bash
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```
3. Check network tab for failed API calls
4. Verify migration ran successfully

### Issue: Emails not syncing

**Solution**:
1. Check console logs for sync errors
2. Verify the `link_email_to_contact` function exists in database:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'link_email_to_contact';
   ```
3. Check RLS policies are enabled

### Issue: "User not authenticated" error

**Solution**:
1. Make sure you're logged in to Supabase
2. Check `supabase.auth.getUser()` returns a user
3. Verify RLS policies allow authenticated users

## Next Steps

After verifying the basics work:

1. **Test with multiple email accounts** to ensure contacts don't duplicate
2. **Test editing contacts** (update relationship status, add tags)
3. **Test manual contact creation** (coming soon - add form)
4. **Add some tags** to contacts manually in Supabase Studio
5. **Experiment with relationship statuses** to see filtering work

## Database Queries for Testing

### View all contacts

```sql
SELECT id, full_name, primary_email, emails, tags, relationship_status, last_interaction_at
FROM crm_contacts
ORDER BY last_interaction_at DESC NULLS LAST;
```

### View all linked emails

```sql
SELECT 
  e.id,
  e.subject,
  e.direction,
  e.from_email,
  e.received_at,
  c.full_name as contact_name
FROM crm_emails e
JOIN crm_contacts c ON e.contact_id = c.id
ORDER BY e.received_at DESC
LIMIT 20;
```

### Check for duplicate contacts

```sql
SELECT primary_email, COUNT(*) as count
FROM crm_contacts
WHERE primary_email IS NOT NULL
GROUP BY primary_email
HAVING COUNT(*) > 1;
```

### View statistics

```sql
-- Total contacts
SELECT COUNT(*) FROM crm_contacts;

-- Contacts by status
SELECT relationship_status, COUNT(*) 
FROM crm_contacts 
GROUP BY relationship_status;

-- Emails in last 7 days
SELECT COUNT(*) 
FROM crm_emails 
WHERE received_at > NOW() - INTERVAL '7 days';
```

## Troubleshooting Commands

### Reset CRM data (careful!)

```sql
-- Delete all CRM data (for testing only!)
TRUNCATE crm_client_context_history CASCADE;
TRUNCATE crm_client_context CASCADE;
TRUNCATE crm_emails CASCADE;
TRUNCATE crm_contacts CASCADE;
```

### Check RLS policies

```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename LIKE 'crm_%';
```

### Manually create test contact

```sql
INSERT INTO crm_contacts (
  user_id,
  full_name,
  primary_email,
  emails,
  type,
  tags,
  origin,
  relationship_status
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Test Contact',
  'test@example.com',
  ARRAY['test@example.com'],
  'person',
  ARRAY['test', 'demo'],
  'manual',
  'warm'
);
```

## Support

If you encounter issues:

1. Check the full documentation: `CRM_IMPLEMENTATION_COMPLETE.md`
2. Review the schema: `supabase/migrations/20250125000000_crm_schema.sql`
3. Check the implementation: `apps/orb-web/src/lib/crm/`
4. Look at the UI code: `apps/orb-web/src/pages/contacts/`

---

**Quick Links**:
- Contacts List: `http://localhost:4323/contacts`
- Unified Inbox: `http://localhost:4323/inbox`
- Email Integration: `http://localhost:4323/emails`
- Database Viewer (Admin): `http://localhost:4323/admin/database`

**Status**: Ready to test! 🚀

