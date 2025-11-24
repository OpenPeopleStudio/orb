/**
 * Finance Home Page
 * 
 * Main finance dashboard with overview and quick actions
 * Author: Orb System - Luna Agent (UI/UX)
 */

import React from 'react';
import { Link } from 'react-router-dom';

import { TransactionEntry } from '../../components/finance/TransactionEntry';
import { TransactionList } from '../../components/finance/TransactionList';
import { useFinance } from '../../contexts/FinanceContext';

export default function FinanceHome() {
  const { summary, summaryLoading } = useFinance();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Finance</h1>
          <p className="text-text-secondary mt-1">
            Track your money, understand your patterns
          </p>
        </div>
        <Link
          to="/finance/accounts"
          className="px-4 py-2 bg-accent-orb text-white rounded-lg hover:bg-opacity-90"
        >
          Manage Accounts
        </Link>
      </div>

      {/* Summary Cards */}
      {!summaryLoading && summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard
            title="Income"
            value={summary.total_income}
            color="green"
            period={summary.period}
          />
          <SummaryCard
            title="Expenses"
            value={summary.total_expenses}
            color="red"
            period={summary.period}
          />
          <SummaryCard
            title="Net"
            value={summary.net}
            color={summary.net >= 0 ? 'green' : 'red'}
            period={summary.period}
          />
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Transaction Entry */}
        <div className="lg:col-span-1">
          <TransactionEntry />
        </div>

        {/* Right: Recent Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-bg-secondary rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Recent Transactions
            </h2>
            <TransactionList />
          </div>
        </div>
      </div>

      {/* Categories Breakdown */}
      {!summaryLoading && summary && summary.by_category.length > 0 && (
        <div className="bg-bg-secondary rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Top Categories
          </h2>
          <div className="space-y-3">
            {summary.by_category.slice(0, 5).map(cat => {
              const percentage = summary.total_expenses > 0
                ? (cat.amount / summary.total_expenses) * 100
                : 0;
              
              return (
                <div key={cat.category_id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-primary">{cat.category_name}</span>
                    <span className="text-text-secondary">
                      ${cat.amount.toFixed(2)} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-bg-root rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-accent-orb h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUMMARY CARD
// ============================================================================

interface SummaryCardProps {
  title: string;
  value: number;
  color: 'green' | 'red' | 'blue';
  period: string;
}

function SummaryCard({ title, value, color, period }: SummaryCardProps) {
  const colorClasses = {
    green: 'text-green-500',
    red: 'text-red-500',
    blue: 'text-accent-orb',
  };

  return (
    <div className="bg-bg-secondary rounded-lg p-6">
      <div className="text-text-secondary text-sm mb-1">{title}</div>
      <div className={`text-3xl font-bold ${colorClasses[color]}`}>
        {new Intl.NumberFormat('en-CA', {
          style: 'currency',
          currency: 'CAD',
        }).format(value)}
      </div>
      <div className="text-text-secondary text-xs mt-2">
        {formatPeriod(period)}
      </div>
    </div>
  );
}

function formatPeriod(period: string): string {
  switch (period) {
    case 'today':
      return 'Today';
    case 'this_week':
      return 'This Week';
    case 'this_month':
      return 'This Month';
    case 'last_30_days':
      return 'Last 30 Days';
    default:
      return period;
  }
}

