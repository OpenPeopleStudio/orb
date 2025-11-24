/**
 * Account Balance Update Modal
 * 
 * Modal for manually updating account balance
 * Author: Orb System - Luna Agent (UI/UX)
 */

import React, { useState, useEffect } from 'react';

import { useFinance } from '../../contexts/FinanceContext';
import { useToast } from '../../contexts/ToastContext';
import type { Account } from '../../lib/finance/types';

interface AccountBalanceModalProps {
  account: Account;
  isOpen: boolean;
  onClose: () => void;
}

export function AccountBalanceModal({ account, isOpen, onClose }: AccountBalanceModalProps) {
  const { editAccount } = useFinance();
  const { success, error } = useToast();
  const [balance, setBalance] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && account.current_balance !== null) {
      setBalance(account.current_balance.toString());
    }
  }, [isOpen, account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericBalance = parseFloat(balance);
    if (isNaN(numericBalance)) {
      error('Please enter a valid number');
      return;
    }

    setIsSubmitting(true);
    try {
      await editAccount(account.id, { current_balance: numericBalance });
      success('Balance updated successfully! 💰');
      onClose();
    } catch (err) {
      console.error('Failed to update balance:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update balance. Please try again.';
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-bg-root rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-primary">
          <h2 className="text-xl font-semibold text-text-primary">
            Update Balance
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {account.name}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Current Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                $
              </span>
              <input
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orb text-text-primary"
                placeholder="0.00"
                autoFocus
                required
              />
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Enter the current balance as shown in your account
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-orb text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Update Balance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

