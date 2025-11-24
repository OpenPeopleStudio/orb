/**
 * Finance Context
 * 
 * Global state management for finance data
 * Author: Orb System - Luna Agent (UI/UX & State)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import {
  createAccount,
  createTransaction,
  deleteTransaction,
  fetchAccounts,
  fetchCategories,
  fetchFinanceSummary,
  fetchTransactions,
  updateAccount,
  updateTransaction,
} from '../lib/finance/client';
import type {
  Account,
  AccountCreateInput,
  AccountUpdateInput,
  Category,
  DatePeriod,
  FinanceSummary,
  Transaction,
  TransactionCreateInput,
  TransactionFilterParams,
  TransactionUpdateInput,
} from '../lib/finance/types';

// ============================================================================
// CONTEXT TYPES
// ============================================================================

interface FinanceContextValue {
  // Data
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  summary: FinanceSummary | null;
  
  // Loading states
  accountsLoading: boolean;
  transactionsLoading: boolean;
  categoriesLoading: boolean;
  summaryLoading: boolean;
  
  // Filters
  filters: TransactionFilterParams;
  setFilters: (filters: TransactionFilterParams) => void;
  
  // Selected period
  period: DatePeriod;
  setPeriod: (period: DatePeriod) => void;
  
  // Actions - Accounts
  refreshAccounts: () => Promise<void>;
  addAccount: (input: AccountCreateInput) => Promise<Account | null>;
  editAccount: (id: string, input: AccountUpdateInput) => Promise<Account | null>;
  
  // Actions - Transactions
  refreshTransactions: () => Promise<void>;
  addTransaction: (input: TransactionCreateInput) => Promise<Transaction | null>;
  editTransaction: (id: string, input: TransactionUpdateInput) => Promise<Transaction | null>;
  removeTransaction: (id: string) => Promise<boolean>;
  
  // Actions - Summary
  refreshSummary: () => Promise<void>;
  
  // Actions - Categories
  refreshCategories: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface FinanceProviderProps {
  children: React.ReactNode;
}

export function FinanceProvider({ children }: FinanceProviderProps) {
  // State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  
  const [filters, setFilters] = useState<TransactionFilterParams>({});
  const [period, setPeriod] = useState<DatePeriod>('this_month');
  
  // ============================================================================
  // FETCH FUNCTIONS
  // ============================================================================
  
  const refreshAccounts = useCallback(async () => {
    setAccountsLoading(true);
    try {
      const response = await fetchAccounts({ status: 'active' });
      if (!response.error && response.data) {
        setAccounts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setAccountsLoading(false);
    }
  }, []);
  
  const refreshTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    try {
      const dateRange = getDateRangeForPeriod(period);
      const response = await fetchTransactions({
        ...filters,
        date_from: dateRange.start,
        date_to: dateRange.end,
      });
      if (response.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  }, [filters, period]);
  
  const refreshCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetchCategories();
      if (!response.error && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);
  
  const refreshSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const periodString = period === 'custom' ? 'this_month' : period;
      const response = await fetchFinanceSummary(periodString);
      if (!response.error && response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  }, [period]);
  
  // ============================================================================
  // ACCOUNT ACTIONS
  // ============================================================================
  
  const addAccount = useCallback(async (input: AccountCreateInput): Promise<Account | null> => {
    try {
      const response = await createAccount(input);
      if (!response.error && response.data) {
        setAccounts(prev => [response.data, ...prev]);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to create account:', error);
      return null;
    }
  }, []);
  
  const editAccount = useCallback(async (
    id: string,
    input: AccountUpdateInput
  ): Promise<Account | null> => {
    try {
      const response = await updateAccount(id, input);
      if (!response.error && response.data) {
        setAccounts(prev => prev.map(a => a.id === id ? response.data : a));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to update account:', error);
      return null;
    }
  }, []);
  
  // ============================================================================
  // TRANSACTION ACTIONS
  // ============================================================================
  
  const addTransaction = useCallback(async (
    input: TransactionCreateInput
  ): Promise<Transaction | null> => {
    try {
      const response = await createTransaction(input);
      if (!response.error && response.data) {
        // Optimistic update
        setTransactions(prev => [response.data, ...prev]);
        // Refresh summary to reflect new transaction
        refreshSummary();
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      return null;
    }
  }, [refreshSummary]);
  
  const editTransaction = useCallback(async (
    id: string,
    input: TransactionUpdateInput
  ): Promise<Transaction | null> => {
    try {
      const response = await updateTransaction(id, input);
      if (!response.error && response.data) {
        setTransactions(prev => prev.map(t => t.id === id ? response.data : t));
        // Refresh summary if amount/category changed
        if (input.amount !== undefined || input.category_id !== undefined) {
          refreshSummary();
        }
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to update transaction:', error);
      return null;
    }
  }, [refreshSummary]);
  
  const removeTransaction = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await deleteTransaction(id);
      if (!response.error && response.data) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        refreshSummary();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      return false;
    }
  }, [refreshSummary]);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Initial load
  useEffect(() => {
    refreshAccounts();
    refreshCategories();
  }, [refreshAccounts, refreshCategories]);
  
  // Reload transactions when filters or period changes
  useEffect(() => {
    refreshTransactions();
    refreshSummary();
  }, [refreshTransactions, refreshSummary]);
  
  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const value: FinanceContextValue = {
    // Data
    accounts,
    transactions,
    categories,
    summary,
    
    // Loading
    accountsLoading,
    transactionsLoading,
    categoriesLoading,
    summaryLoading,
    
    // Filters & Period
    filters,
    setFilters,
    period,
    setPeriod,
    
    // Actions
    refreshAccounts,
    addAccount,
    editAccount,
    
    refreshTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
    
    refreshSummary,
    refreshCategories,
  };
  
  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDateRangeForPeriod(period: DatePeriod): { start: string; end: string } {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return {
        start: formatDate(now),
        end: formatDate(now),
      };
    
    case 'this_week': {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
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
    
    case 'custom':
    default: {
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

