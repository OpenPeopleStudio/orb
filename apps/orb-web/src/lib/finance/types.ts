/**
 * Finance Types
 * 
 * TypeScript interfaces matching Supabase finance schema
 * Author: Orb System - Sol Agent (Analysis)
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT_CARD = 'credit_card',
  LOAN = 'loan',
  INVESTMENT = 'investment',
  CASH = 'cash',
  OTHER = 'other',
}

export enum AccountStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export enum TransactionReviewStatus {
  UNREVIEWED = 'unreviewed',
  CONFIRMED = 'confirmed',
  FLAGGED = 'flagged',
}

export enum IntentLabel {
  ALIGNED = 'aligned',
  NEUTRAL = 'neutral',
  MISALIGNED = 'misaligned',
}

export enum TransactionSource {
  MANUAL = 'manual',
  CSV_IMPORT = 'csv_import',
  API = 'api',
}

export enum BudgetStatus {
  UNDER = 'under',
  AT = 'at',
  OVER = 'over',
}

export enum ReviewScope {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

// ============================================================================
// ACCOUNT
// ============================================================================

export interface Account {
  id: string;
  user_id: string;
  
  // Core fields
  name: string;
  type: AccountType;
  status: AccountStatus;
  
  // Balance
  current_balance: number | null;
  currency: string;
  
  // Metadata
  institution?: string;
  account_number_last4?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface AccountCreateInput {
  name: string;
  type: AccountType;
  current_balance?: number;
  currency?: string;
  institution?: string;
  account_number_last4?: string;
  notes?: string;
}

export interface AccountUpdateInput {
  name?: string;
  type?: AccountType;
  status?: AccountStatus;
  current_balance?: number;
  institution?: string;
  notes?: string;
}

// ============================================================================
// CATEGORY
// ============================================================================

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  parent_id: string | null;
  is_core: boolean;
  is_active: boolean;
  icon?: string;
  color?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TRANSACTION
// ============================================================================

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  
  // Core transaction data
  date_posted: string; // Date string (YYYY-MM-DD)
  amount: number; // positive = inflow, negative = outflow
  currency: string;
  
  // Descriptions
  description_raw: string;
  description_clean?: string;
  merchant_name?: string;
  
  // Classification
  category_id?: string;
  tags: string[];
  
  // Review & Intent
  review_status: TransactionReviewStatus;
  intent_label?: IntentLabel;
  
  // Metadata
  is_recurring: boolean;
  notes?: string;
  source: TransactionSource;
  metadata?: Record<string, unknown>;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Populated relations (when included)
  account?: Account;
  category?: Category;
}

export interface TransactionCreateInput {
  account_id: string;
  date_posted: string; // YYYY-MM-DD
  amount: number;
  description_raw: string;
  description_clean?: string;
  merchant_name?: string;
  category_id?: string;
  tags?: string[];
  is_recurring?: boolean;
  notes?: string;
  source?: TransactionSource;
}

export interface TransactionUpdateInput {
  date_posted?: string;
  amount?: number;
  description_raw?: string;
  description_clean?: string;
  merchant_name?: string;
  category_id?: string;
  tags?: string[];
  review_status?: TransactionReviewStatus;
  intent_label?: IntentLabel;
  is_recurring?: boolean;
  notes?: string;
}

// ============================================================================
// BUDGET
// ============================================================================

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  period: string; // YYYY-MM
  amount_planned: number;
  amount_spent: number;
  status: BudgetStatus;
  created_at: string;
  updated_at: string;
  
  // Populated relations
  category?: Category;
}

export interface BudgetCreateInput {
  category_id: string;
  period: string;
  amount_planned: number;
}

// ============================================================================
// REVIEW SESSION
// ============================================================================

export interface ReviewSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  scope: ReviewScope;
  transactions_reviewed: string[]; // transaction IDs
  summary_text?: string;
  intent_score?: number; // 1-5
  created_at: string;
}

export interface ReviewSessionCreateInput {
  scope: ReviewScope;
  started_at?: string; // defaults to now
}

export interface ReviewSessionUpdateInput {
  ended_at?: string;
  transactions_reviewed?: string[];
  summary_text?: string;
  intent_score?: number;
}

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

export interface TransactionFilterParams {
  account_id?: string;
  category_id?: string;
  review_status?: TransactionReviewStatus;
  intent_label?: IntentLabel;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface AccountFilterParams {
  type?: AccountType;
  status?: AccountStatus;
}

// ============================================================================
// SUMMARY & ANALYTICS
// ============================================================================

export interface FinanceSummary {
  period: string; // 'this_week' | 'this_month' | 'YYYY-MM'
  total_income: number;
  total_expenses: number;
  net: number;
  
  // By category
  by_category: {
    category_id: string;
    category_name: string;
    amount: number;
    transaction_count: number;
  }[];
  
  // By intent
  intent_breakdown: {
    aligned: number;
    neutral: number;
    misaligned: number;
    unreviewed: number;
  };
  
  // Review status
  review_progress: {
    total: number;
    reviewed: number;
    percent: number;
  };
}

export interface CategorySummary {
  category: Category;
  amount_spent: number;
  transaction_count: number;
  budget?: Budget;
  percentage_of_total: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface TransactionFormState {
  account_id: string;
  date_posted: string;
  amount: string; // string for input handling
  description_raw: string;
  category_id?: string;
  tags: string[];
  notes?: string;
}

export interface AccountBalanceUpdate {
  account_id: string;
  current_balance: number;
}

// ============================================================================
// DATE HELPERS
// ============================================================================

export type DatePeriod = 'today' | 'this_week' | 'this_month' | 'last_30_days' | 'custom';

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

