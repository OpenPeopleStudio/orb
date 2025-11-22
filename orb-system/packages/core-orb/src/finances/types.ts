/**
 * Finances Types
 * 
 * Role: Core finances layer
 * 
 * Types for transactions, categories, and accounts.
 * Ported from SomaOS finance architecture.
 * 
 * Source: SomaOS finance docs & schema
 */

/**
 * Transaction Type
 */
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

/**
 * Transaction Status
 */
export enum TransactionStatus {
  PENDING = 'pending',
  CLEARED = 'cleared',
  RECONCILED = 'reconciled',
  VOID = 'void',
}

/**
 * Account Type
 */
export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT = 'credit',
  INVESTMENT = 'investment',
  LOAN = 'loan',
  OTHER = 'other',
}

/**
 * Transaction Category
 */
export interface TransactionCategory {
  id: string;
  userId: string;
  name: string;
  parentId?: string; // For hierarchical categories
  type: TransactionType;
  color?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Account - financial account
 */
export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  institution?: string; // Bank/institution name
  accountNumber?: string; // Last 4 digits or masked
  balance: number; // Current balance in cents
  currency: string; // ISO currency code (USD, EUR, etc.)
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * Transaction - financial transaction
 */
export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  
  // Transaction details
  type: TransactionType;
  status: TransactionStatus;
  amount: number; // Amount in cents (positive for income, negative for expense)
  currency: string; // ISO currency code
  
  // Categorization
  categoryId?: string;
  category?: TransactionCategory;
  
  // Description
  description: string;
  memo?: string;
  notes?: string;
  
  // Dates
  date: string; // ISO date (transaction date)
  postedAt?: string; // ISO timestamp (when it posted to account)
  clearedAt?: string; // ISO timestamp (when it cleared)
  
  // Payee/Merchant
  payee?: string;
  merchant?: string;
  
  // Transfer details (if type is TRANSFER)
  transferAccountId?: string;
  transferTransactionId?: string;
  
  // Metadata
  tags?: string[];
  metadata?: Record<string, unknown>;
  
  // Timestamps
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * Transaction Filter - for querying transactions
 */
export interface TransactionFilter {
  userId: string;
  accountId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  categoryId?: string;
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
  amountMin?: number; // cents
  amountMax?: number; // cents
  search?: string; // Description/payee search
  tags?: string[];
}

/**
 * Financial Summary - aggregated financial data
 */
export interface FinancialSummary {
  userId: string;
  period: {
    start: string; // ISO date
    end: string; // ISO date
  };
  totalIncome: number; // cents
  totalExpenses: number; // cents
  netAmount: number; // cents (income - expenses)
  byCategory: Record<string, number>; // categoryId -> amount in cents
  byAccount: Record<string, number>; // accountId -> amount in cents
}

