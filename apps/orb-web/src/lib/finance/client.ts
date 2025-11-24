/**
 * Finance Supabase Client
 * 
 * API client for finance operations
 * Author: Orb System - Sol Agent (Analysis & API Design)
 */

import { getSupabaseClient } from '../supabase/client';

import type {
  Account,
  AccountCreateInput,
  AccountFilterParams,
  AccountUpdateInput,
  ApiResponse,
  Category,
  FinanceSummary,
  PaginatedResponse,
  Transaction,
  TransactionCreateInput,
  TransactionFilterParams,
  TransactionUpdateInput,
} from './types';

/**
 * Get current user ID from Supabase auth
 * Throws error if user is not authenticated
 */
async function getCurrentUserId(): Promise<string> {
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Auth error:', error);
    throw new Error('Authentication error. Please sign in again.');
  }
  
  if (!user) {
    // Allow demo mode in development only
    if (import.meta.env.DEV) {
      console.warn('⚠️ DEV MODE: Using demo user. In production, this will require authentication.');
      return 'demo-user';
    }
    throw new Error('Not authenticated. Please sign in to continue.');
  }
  
  return user.id;
}

// ============================================================================
// ACCOUNTS API
// ============================================================================

export async function fetchAccounts(
  filters: AccountFilterParams = {}
): Promise<ApiResponse<Account[]>> {
  try {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();

    let query = supabase
      .from('finance_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function fetchAccountById(id: string): Promise<ApiResponse<Account | null>> {
  try {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('finance_accounts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function createAccount(
  input: AccountCreateInput
): Promise<ApiResponse<Account>> {
  try {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('finance_accounts')
      .insert({
        user_id: userId,
        ...input,
      })
      .select()
      .single();

    if (error) {
      return { data: null as unknown as Account, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null as unknown as Account,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updateAccount(
  id: string,
  input: AccountUpdateInput
): Promise<ApiResponse<Account>> {
  try {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();

    const { data, error} = await supabase
      .from('finance_accounts')
      .update(input)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { data: null as unknown as Account, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null as unknown as Account,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function deleteAccount(id: string): Promise<ApiResponse<boolean>> {
  try {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from('finance_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return { data: false, error: error.message };
    }

    return { data: true, error: null };
  } catch (error) {
    return {
      data: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// TRANSACTIONS API
// ============================================================================

export async function fetchTransactions(
  filters: TransactionFilterParams = {}
): Promise<PaginatedResponse<Transaction>> {
  try {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    let query = supabase
      .from('finance_transactions')
      .select('*, account:finance_accounts(*), category:finance_categories(*)', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (filters.account_id) {
      query = query.eq('account_id', filters.account_id);
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.review_status) {
      query = query.eq('review_status', filters.review_status);
    }
    if (filters.intent_label) {
      query = query.eq('intent_label', filters.intent_label);
    }
    if (filters.date_from) {
      query = query.gte('date_posted', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('date_posted', filters.date_to);
    }
    if (filters.search) {
      query = query.or(`description_raw.ilike.%${filters.search}%,description_clean.ilike.%${filters.search}%,merchant_name.ilike.%${filters.search}%`);
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    // Order by date descending
    query = query.order('date_posted', { ascending: false });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return {
        data: [],
        total: 0,
        limit,
        offset,
        has_more: false,
      };
    }

    return {
      data: data || [],
      total: count || 0,
      limit,
      offset,
      has_more: (count || 0) > offset + limit,
    };
  } catch {
    return {
      data: [],
      total: 0,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      has_more: false,
    };
  }
}

export async function createTransaction(
  input: TransactionCreateInput
): Promise<ApiResponse<Transaction>> {
  try {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('finance_transactions')
      .insert({
        user_id: userId,
        ...input,
        tags: input.tags || [],
      })
      .select('*, account:finance_accounts(*), category:finance_categories(*)')
      .single();

    if (error) {
      return { data: null as unknown as Transaction, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null as unknown as Transaction,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updateTransaction(
  id: string,
  input: TransactionUpdateInput
): Promise<ApiResponse<Transaction>> {
  try {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('finance_transactions')
      .update(input)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, account:finance_accounts(*), category:finance_categories(*)')
      .single();

    if (error) {
      return { data: null as unknown as Transaction, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null as unknown as Transaction,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function deleteTransaction(id: string): Promise<ApiResponse<boolean>> {
  try {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from('finance_transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return { data: false, error: error.message };
    }

    return { data: true, error: null };
  } catch (error) {
    return {
      data: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// CATEGORIES API
// ============================================================================

export async function fetchCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('finance_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// SUMMARY & ANALYTICS API
// ============================================================================

export async function fetchFinanceSummary(
  period: string = 'this_month'
): Promise<ApiResponse<FinanceSummary>> {
  try {
    // Calculate date range based on period
    const { start, end } = getDateRangeForPeriod(period);
    
    // Fetch transactions for period
    const transactionsResponse = await fetchTransactions({
      date_from: start,
      date_to: end,
      limit: 1000, // Get all for summary
    });

    const transactions = transactionsResponse.data;

    // Calculate totals
    const total_income = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const total_expenses = Math.abs(
      transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    const net = total_income - total_expenses;

    // Group by category
    const categoryMap = new Map<string, { name: string; amount: number; count: number }>();
    transactions.forEach(t => {
      if (t.category) {
        const existing = categoryMap.get(t.category.id) || { name: t.category.name, amount: 0, count: 0 };
        categoryMap.set(t.category.id, {
          name: existing.name,
          amount: existing.amount + Math.abs(t.amount),
          count: existing.count + 1,
        });
      }
    });

    const by_category = Array.from(categoryMap.entries())
      .map(([category_id, data]) => ({
        category_id,
        category_name: data.name,
        amount: data.amount,
        transaction_count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Intent breakdown
    const intent_breakdown = {
      aligned: transactions.filter(t => t.intent_label === 'aligned').length,
      neutral: transactions.filter(t => t.intent_label === 'neutral').length,
      misaligned: transactions.filter(t => t.intent_label === 'misaligned').length,
      unreviewed: transactions.filter(t => !t.intent_label).length,
    };

    // Review progress
    const total = transactions.length;
    const reviewed = transactions.filter(t => t.review_status !== 'unreviewed').length;
    const review_progress = {
      total,
      reviewed,
      percent: total > 0 ? Math.round((reviewed / total) * 100) : 0,
    };

    const summary: FinanceSummary = {
      period,
      total_income,
      total_expenses,
      net,
      by_category,
      intent_breakdown,
      review_progress,
    };

    return { data: summary, error: null };
  } catch (error) {
    return {
      data: null as unknown as FinanceSummary,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDateRangeForPeriod(period: string): { start: string; end: string } {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return {
        start: formatDate(now),
        end: formatDate(now),
      };
    
    case 'this_week': {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      return {
        start: formatDate(weekStart),
        end: formatDate(now),
      };
    }
    
    case 'this_month': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: formatDate(monthStart),
        end: formatDate(now),
      };
    }
    
    case 'last_30_days': {
      const daysStart = new Date(now);
      daysStart.setDate(now.getDate() - 30);
      return {
        start: formatDate(daysStart),
        end: formatDate(now),
      };
    }
    
    default: {
      // Assume period is YYYY-MM format
      if (/^\d{4}-\d{2}$/.test(period)) {
        const [year, month] = period.split('-').map(Number);
        const periodStart = new Date(year, month - 1, 1);
        const periodEnd = new Date(year, month, 0); // Last day of month
        return {
          start: formatDate(periodStart),
          end: formatDate(periodEnd),
        };
      }
      
      // Default to this month
      const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: formatDate(defaultStart),
        end: formatDate(now),
      };
    }
  }
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

