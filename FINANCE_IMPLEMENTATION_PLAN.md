# Finance Implementation Plan: Phases 0 + 0.5
## Multi-Agent Coordination Strategy

**Goal**: Implement full-stack personal finance system with database, API, and UI ready for agent integration.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                 │
│  • Accounts List     • Transaction Entry            │
│  • Transaction List  • Manual Balance Update        │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓ API Calls
┌─────────────────────────────────────────────────────┐
│              Backend API (Node/Supabase)            │
│  • GET /accounts           • POST /transactions     │
│  • GET /transactions       • PATCH /transactions/:id│
│  • GET /finance/summary    • PATCH /accounts/:id    │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓ SQL Queries
┌─────────────────────────────────────────────────────┐
│                 Supabase (PostgreSQL)               │
│  • accounts          • transactions                 │
│  • categories        • budgets                      │
│  • review_sessions   + indexes                      │
└─────────────────────────────────────────────────────┘
```

---

## Workstream Breakdown (Parallel Execution)

### 🔵 Workstream A: Database Schema (Mav Agent)
**Owner**: Schema design and migration  
**Priority**: CRITICAL - Must complete first

**Tasks**:
1. Create Supabase migration for finance tables
2. Define accounts table with all fields
3. Define transactions table with JSONB for tags
4. Define categories table with hierarchy support
5. Define budgets table (minimal for v0.5)
6. Define review_sessions table (for Phase 1.0 prep)
7. Create indexes for performance
8. Add RLS policies for user data isolation
9. Create seed data script for base categories

**Deliverables**:
- `supabase/migrations/YYYYMMDDHHMMSS_finance_schema.sql`
- `scripts/seed-finance-data.sql`

---

### 🟢 Workstream B: Backend API (Sol Agent)
**Owner**: API endpoints and business logic  
**Depends on**: Workstream A (schema)

**Tasks**:
1. Create finance API route structure
2. Implement `GET /api/finance/accounts`
3. Implement `POST /api/finance/accounts`
4. Implement `PATCH /api/finance/accounts/:id`
5. Implement `GET /api/finance/transactions`
6. Implement `POST /api/finance/transactions`
7. Implement `PATCH /api/finance/transactions/:id`
8. Implement `GET /api/finance/summary?period=`
9. Implement `GET /api/finance/categories`
10. Add validation middleware
11. Add error handling
12. Create TypeScript types for all entities

**Deliverables**:
- API route files in `apps/orb-web/src/api/finance/`
- Type definitions in `apps/orb-web/src/types/finance.ts`
- API client utilities

---

### 🟡 Workstream C: Frontend Components (Luna Agent)
**Owner**: UI components and user flows  
**Depends on**: Workstream B (API)

**Tasks**:
1. Create finance page layout structure
2. Build Accounts List component
3. Build Account Balance Edit modal
4. Build Transaction Entry Form component
5. Build Transaction List component
6. Build Transaction Filter controls
7. Build Empty States
8. Create finance context/state management
9. Implement optimistic updates
10. Add keyboard shortcuts for quick entry
11. Style with Orb design system

**Deliverables**:
- Pages: `/finance`, `/finance/accounts`, `/finance/transactions`
- Components in `apps/orb-web/src/components/finance/`
- Context in `apps/orb-web/src/contexts/FinanceContext.tsx`

---

### 🟣 Workstream D: Agent Hooks (Te Agent)
**Owner**: Prepare for future agent integration  
**Parallel with**: Workstream C

**Tasks**:
1. Define agent event types (transaction.created, etc.)
2. Create agent hook points in transaction flow
3. Add placeholder for CategorizationAgent
4. Add placeholder for ReviewCoachAgent
5. Document agent integration points
6. Create agent interface specifications

**Deliverables**:
- `apps/orb-web/src/lib/finance/agent-hooks.ts`
- `docs/finance/agent-integration.md`

---

## Phase 0: Database & API (Days 1-2)

### Day 1: Schema
- [ ] Create migration file
- [ ] Define all tables with proper types
- [ ] Add indexes and constraints
- [ ] Create RLS policies
- [ ] Test migration on dev Supabase instance
- [ ] Create seed data

### Day 2: API
- [ ] Set up API routes
- [ ] Implement all GET endpoints
- [ ] Implement all POST/PATCH endpoints
- [ ] Add validation
- [ ] Test with Postman/Thunder Client
- [ ] Document API contracts

---

## Phase 0.5: Manual Console UI (Days 3-4)

### Day 3: Core UI
- [ ] Create finance page structure
- [ ] Build accounts list view
- [ ] Build transaction entry form
- [ ] Wire up to API
- [ ] Add navigation to main app

### Day 4: Transaction List & Polish
- [ ] Build transaction list component
- [ ] Add date filters (This Week, This Month)
- [ ] Add manual balance update UI
- [ ] Implement optimistic updates
- [ ] Test full user flow
- [ ] Fix any bugs

---

## Success Criteria

### Phase 0 (Backend Complete)
✅ All tables exist in Supabase  
✅ Seed data creates base categories  
✅ Can CRUD accounts via API  
✅ Can CRUD transactions via API  
✅ Summary endpoint returns correct aggregates  
✅ Postman collection validates all endpoints  

### Phase 0.5 (UI Complete)
✅ User can create/view accounts  
✅ User can manually update account balances  
✅ User can add transactions (date, amount, description)  
✅ Transactions appear in list immediately  
✅ Can filter by "This Week" and "This Month"  
✅ Empty states guide user to add first transaction  
✅ Keyboard flow is smooth for daily entry  

---

## File Structure

```
orb/
├── supabase/
│   └── migrations/
│       └── YYYYMMDDHHMMSS_finance_schema.sql
├── apps/orb-web/
│   ├── src/
│   │   ├── api/finance/
│   │   │   ├── accounts.ts
│   │   │   ├── transactions.ts
│   │   │   ├── categories.ts
│   │   │   └── summary.ts
│   │   ├── lib/finance/
│   │   │   ├── client.ts
│   │   │   ├── types.ts
│   │   │   └── agent-hooks.ts
│   │   ├── contexts/
│   │   │   └── FinanceContext.tsx
│   │   ├── components/finance/
│   │   │   ├── AccountsList.tsx
│   │   │   ├── AccountBalanceModal.tsx
│   │   │   ├── TransactionEntry.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   └── TransactionFilters.tsx
│   │   └── pages/finance/
│   │       ├── FinanceHome.tsx
│   │       ├── AccountsPage.tsx
│   │       └── TransactionsPage.tsx
│   └── package.json (add any deps)
└── docs/finance/
    ├── api-contracts.md
    └── agent-integration.md
```

---

## Multi-Agent Coordination

### Forge Orchestrator Role
- Monitors progress across all workstreams
- Resolves blockers and dependencies
- Ensures consistent data types across stack
- Validates integration points
- Coordinates parallel work

### Agent Responsibilities

**Sol (Analysis)**:
- API design and contracts
- Data validation logic
- Query optimization
- Business rules

**Mav (Execution)**:
- Database migrations
- API implementation
- Deployment scripts
- Infrastructure

**Luna (Adaptation)**:
- UI/UX design
- Component implementation
- User flows
- Accessibility

**Te (Reflection)**:
- Testing strategy
- Documentation
- Agent integration design
- Review and validation

---

## Next Steps

1. **Immediate**: Create Supabase migration
2. **Then**: Implement API endpoints
3. **Then**: Build UI components
4. **Finally**: Test end-to-end and deploy

---

## Agent Hooks for Future Phases

The system will be ready for:
- **CategorizationAgent**: Auto-categorize transactions
- **ReviewCoachAgent**: Guide daily/weekly reviews
- **AlertAgent**: Watch for anomalies
- **ImportAgent**: Handle CSV/API imports

All hooks are documented and stubbed for Phase 2.0+.

