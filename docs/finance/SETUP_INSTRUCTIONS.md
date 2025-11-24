# Finance System Setup Instructions

## Quick Start

### 1. Create `.env` file

Create `apps/orb-web/.env` with:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these values:**
- Go to https://app.supabase.com
- Select your project
- Go to **Settings → API**
- Copy:
  - **Project URL** → `VITE_SUPABASE_URL`
  - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 2. Run Database Migrations

In your Supabase project dashboard:

1. **SQL Editor → New Query**
2. Copy and paste: `supabase/migrations/20250123000000_finance_schema.sql`
3. Run it
4. **New Query**
5. Copy and paste: `supabase/migrations/20250123000001_finance_demo_policies.sql`
6. Run it
7. **New Query**
8. Copy and paste: `scripts/seed-finance-data.sql`
9. Run it

### 3. Start the App

```bash
pnpm install
pnpm dev --filter @orb-system/orb-web
```

Navigate to: `http://localhost:5173/finance`

## Testing Checklist

- [ ] Create an account (manually via SQL for now)
- [ ] Update account balance
- [ ] Add a transaction
- [ ] Filter transactions by period
- [ ] Edit transaction category
- [ ] Delete a transaction

## Full Documentation

See `docs/finance/phase-0-deployment.md` for complete deployment guide.

