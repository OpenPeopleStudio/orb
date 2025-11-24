/**
 * Transaction List Component
 * 
 * Displays transactions with filters and inline editing
 * Author: Orb System - Luna Agent (UI/UX)
 */

import React, { useState } from 'react';

import { useFinance } from '../../contexts/FinanceContext';
import type { Category, Transaction } from '../../lib/finance/types';

export function TransactionList() {
  const {
    transactions,
    transactionsLoading,
    categories,
    editTransaction,
    removeTransaction,
    period,
    setPeriod,
  } = useFinance();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    await removeTransaction(id);
  };

  const handleUpdateCategory = async (id: string, category_id: string) => {
    await editTransaction(id, { category_id: category_id || undefined });
  };

  const handleToggleReview = async (transaction: Transaction) => {
    const nextStatus = transaction.review_status === 'confirmed' ? 'unreviewed' : 'confirmed';
    await editTransaction(transaction.id, { review_status: nextStatus });
  };

  if (transactionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period Filter Chips */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-text-secondary">Show:</span>
        {(['today', 'this_week', 'this_month', 'last_30_days'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              period === p
                ? 'bg-accent-orb text-white'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
            }`}
          >
            {p === 'today' && 'Today'}
            {p === 'this_week' && 'This Week'}
            {p === 'this_month' && 'This Month'}
            {p === 'last_30_days' && 'Last 30 Days'}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-4">💸</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No transactions yet
          </h3>
          <p className="text-text-secondary">
            Add your first transaction to start tracking your finances.
          </p>
        </div>
      )}

      {/* Transactions List */}
      {transactions.length > 0 && (
        <div className="space-y-2">
          {transactions.map(transaction => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              categories={categories}
              isExpanded={expandedId === transaction.id}
              onToggleExpand={() => setExpandedId(
                expandedId === transaction.id ? null : transaction.id
              )}
              onUpdateCategory={(category_id) => handleUpdateCategory(transaction.id, category_id)}
              onToggleReview={() => handleToggleReview(transaction)}
              onDelete={() => handleDelete(transaction.id)}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {transactions.length > 0 && (
        <div className="mt-6 p-4 bg-bg-secondary rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-text-secondary text-xs mb-1">Income</div>
              <div className="text-lg font-semibold text-green-500">
                {formatCurrency(
                  transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
            </div>
            <div>
              <div className="text-text-secondary text-xs mb-1">Expenses</div>
              <div className="text-lg font-semibold text-red-500">
                {formatCurrency(
                  Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
                )}
              </div>
            </div>
            <div>
              <div className="text-text-secondary text-xs mb-1">Net</div>
              <div className="text-lg font-semibold text-text-primary">
                {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TRANSACTION ROW
// ============================================================================

interface TransactionRowProps {
  transaction: Transaction;
  categories: Category[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateCategory: (category_id: string) => void;
  onToggleReview: () => void;
  onDelete: () => void;
}

function TransactionRow({
  transaction,
  categories,
  isExpanded,
  onToggleExpand,
  onUpdateCategory,
  onToggleReview,
  onDelete,
}: TransactionRowProps) {
  const isIncome = transaction.amount > 0;
  const relevantCategories = categories.filter(c =>
    isIncome ? c.type === 'income' : c.type === 'expense'
  );

  return (
    <div className="bg-bg-secondary rounded-lg border border-border-primary hover:border-accent-orb transition-colors">
      {/* Main Row */}
      <div
        className="px-4 py-3 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          {/* Left: Date & Description */}
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className="text-xs text-text-secondary min-w-[80px]">
                {formatDate(transaction.date_posted)}
              </div>
              <div>
                <div className="font-medium text-text-primary">
                  {transaction.description_clean || transaction.description_raw}
                </div>
                {transaction.category && (
                  <div className="text-xs text-text-secondary mt-0.5">
                    {transaction.category.icon} {transaction.category.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Amount & Status */}
          <div className="flex items-center space-x-4">
            {/* Review Status */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleReview();
              }}
              className={`text-xs px-2 py-1 rounded ${
                transaction.review_status === 'confirmed'
                  ? 'bg-green-500 bg-opacity-20 text-green-500'
                  : 'bg-yellow-500 bg-opacity-20 text-yellow-500'
              }`}
            >
              {transaction.review_status === 'confirmed' ? '✓' : '?'}
            </button>

            {/* Amount */}
            <div className={`text-lg font-semibold min-w-[100px] text-right ${
              isIncome ? 'text-green-500' : 'text-red-500'
            }`}>
              {isIncome ? '+' : ''}{formatCurrency(transaction.amount)}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border-primary space-y-3 mt-2 pt-3">
          {/* Category Selector */}
          <div>
            <label className="block text-xs text-text-secondary mb-1">Category</label>
            <select
              value={transaction.category_id || ''}
              onChange={(e) => onUpdateCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-bg-root border border-border-primary rounded focus:outline-none focus:ring-2 focus:ring-accent-orb text-text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">Uncategorized</option>
              {relevantCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account */}
          {transaction.account && (
            <div>
              <span className="text-xs text-text-secondary">Account: </span>
              <span className="text-sm text-text-primary">{transaction.account.name}</span>
            </div>
          )}

          {/* Merchant */}
          {transaction.merchant_name && (
            <div>
              <span className="text-xs text-text-secondary">Merchant: </span>
              <span className="text-sm text-text-primary">{transaction.merchant_name}</span>
            </div>
          )}

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-xs text-red-500 hover:underline"
          >
            Delete Transaction
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    signDisplay: 'never',
  }).format(Math.abs(amount));
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return new Intl.DateTimeFormat('en-CA', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  }
}

