/**
 * Accounts List Component
 * 
 * Displays all financial accounts with balances
 * Author: Orb System - Luna Agent (UI/UX)
 */

import React, { useState } from 'react';

import { useFinance } from '../../contexts/FinanceContext';
import type { Account } from '../../lib/finance/types';

import { AccountBalanceModal } from './AccountBalanceModal';
import { AddAccountModal } from './AddAccountModal';

export function AccountsList() {
  const { accounts, accountsLoading } = useFinance();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleEditBalance = (account: Account) => {
    setSelectedAccount(account);
    setIsBalanceModalOpen(true);
  };

  const handleCloseBalanceModal = () => {
    setIsBalanceModalOpen(false);
    setSelectedAccount(null);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  if (accountsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">Loading accounts...</div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-4">🏦</div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No accounts yet
        </h3>
        <p className="text-text-secondary mb-6 max-w-md">
          Add your first financial account to start tracking your money.
        </p>
        <button
          className="px-4 py-2 bg-accent-orb text-white rounded-lg hover:bg-opacity-90"
          onClick={handleOpenAddModal}
        >
          + Add Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Accounts</h2>
        <button
          className="px-4 py-2 bg-accent-orb text-white rounded-lg hover:bg-opacity-90"
          onClick={handleOpenAddModal}
        >
          + Add Account
        </button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(account => (
          <AccountCard
            key={account.id}
            account={account}
            onEditBalance={() => handleEditBalance(account)}
          />
        ))}
      </div>

      {/* Total Balance */}
      <div className="mt-8 p-6 bg-bg-secondary rounded-lg">
        <div className="text-text-secondary text-sm mb-1">Total Balance</div>
        <div className="text-3xl font-bold text-text-primary">
          {formatCurrency(
            accounts.reduce((sum, a) => sum + (a.current_balance || 0), 0)
          )}
        </div>
        <div className="text-text-secondary text-sm mt-2">
          Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
      />

      {/* Balance Edit Modal */}
      {selectedAccount && (
        <AccountBalanceModal
          account={selectedAccount}
          isOpen={isBalanceModalOpen}
          onClose={handleCloseBalanceModal}
        />
      )}
    </div>
  );
}

// ============================================================================
// ACCOUNT CARD
// ============================================================================

interface AccountCardProps {
  account: Account;
  onEditBalance: () => void;
}

function AccountCard({ account, onEditBalance }: AccountCardProps) {
  const accountTypeIcon = {
    checking: '🏦',
    savings: '💰',
    credit_card: '💳',
    loan: '📄',
    investment: '📈',
    cash: '💵',
    other: '🔷',
  };

  const accountTypeLabel = {
    checking: 'Checking',
    savings: 'Savings',
    credit_card: 'Credit Card',
    loan: 'Loan',
    investment: 'Investment',
    cash: 'Cash',
    other: 'Other',
  };

  return (
    <div className="p-6 bg-bg-secondary rounded-lg border border-border-primary hover:border-accent-orb transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{accountTypeIcon[account.type]}</div>
          <div>
            <h3 className="font-semibold text-text-primary">{account.name}</h3>
            <p className="text-sm text-text-secondary">
              {accountTypeLabel[account.type]}
            </p>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <div className="text-text-secondary text-xs mb-1">Current Balance</div>
        <div className="text-2xl font-bold text-text-primary">
          {account.current_balance !== null
            ? formatCurrency(account.current_balance)
            : '—'}
        </div>
      </div>

      {/* Institution */}
      {account.institution && (
        <div className="text-sm text-text-secondary mb-4">
          {account.institution}
          {account.account_number_last4 && ` •••• ${account.account_number_last4}`}
        </div>
      )}

      {/* Actions */}
      <button
        onClick={onEditBalance}
        className="text-sm text-accent-orb hover:underline"
      >
        Update Balance
      </button>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount);
  
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    signDisplay: 'never',
  }).format(absAmount);
}

