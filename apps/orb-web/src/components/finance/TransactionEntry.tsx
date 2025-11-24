/**
 * Transaction Entry Form
 * 
 * Manual transaction entry with validation
 * Author: Orb System - Luna Agent (UI/UX)
 */

import React, { useState } from 'react';

import { useFinance } from '../../contexts/FinanceContext';
import { useToast } from '../../contexts/ToastContext';
import type { TransactionCreateInput } from '../../lib/finance/types';

export function TransactionEntry() {
  const { accounts, categories, addTransaction } = useFinance();
  const { success, error, warning } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<TransactionCreateInput>({
    account_id: '',
    date_posted: new Date().toISOString().split('T')[0],
    amount: 0,
    description_raw: '',
    category_id: '',
    tags: [],
  });

  const [amountInput, setAmountInput] = useState('');
  const [isInflow, setIsInflow] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.account_id) {
      warning('Please select an account');
      return;
    }
    if (!amountInput || parseFloat(amountInput) === 0) {
      warning('Please enter an amount');
      return;
    }
    if (!formData.description_raw.trim()) {
      warning('Please enter a description');
      return;
    }

    // Convert amount to positive/negative
    const amount = parseFloat(amountInput);
    const signedAmount = isInflow ? Math.abs(amount) : -Math.abs(amount);

    setIsSubmitting(true);
    try {
      const result = await addTransaction({
        ...formData,
        amount: signedAmount,
        description_raw: formData.description_raw.trim(),
      });

      if (result) {
        // Reset form
        setFormData({
          account_id: formData.account_id, // Keep account selected
          date_posted: new Date().toISOString().split('T')[0],
          amount: 0,
          description_raw: '',
          category_id: '',
          tags: [],
        });
        setAmountInput('');
        setIsInflow(false);
        
        // Success feedback
        success('Transaction added successfully! ✨');
      } else {
        error('Failed to add transaction');
      }
    } catch (err) {
      console.error('Failed to add transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-bg-secondary rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Add Transaction
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account Selector */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Account *
          </label>
          <select
            value={formData.account_id}
            onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
            className="w-full px-4 py-2 bg-bg-root border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orb text-text-primary"
            required
          >
            <option value="">Select account...</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Date *
          </label>
          <input
            type="date"
            value={formData.date_posted}
            onChange={(e) => setFormData({ ...formData, date_posted: e.target.value })}
            className="w-full px-4 py-2 bg-bg-root border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orb text-text-primary"
            required
          />
        </div>

        {/* Amount with Inflow/Outflow Toggle */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Amount *
          </label>
          <div className="flex space-x-2">
            {/* Inflow/Outflow Buttons */}
            <div className="flex border border-border-primary rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setIsInflow(false)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  !isInflow
                    ? 'bg-red-500 text-white'
                    : 'bg-bg-root text-text-secondary hover:bg-bg-secondary'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setIsInflow(true)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isInflow
                    ? 'bg-green-500 text-white'
                    : 'bg-bg-root text-text-secondary hover:bg-bg-secondary'
                }`}
              >
                Income
              </button>
            </div>

            {/* Amount Input */}
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                $
              </span>
              <input
                type="number"
                step="0.01"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-bg-root border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orb text-text-primary"
                placeholder="0.00"
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Description *
          </label>
          <input
            type="text"
            value={formData.description_raw}
            onChange={(e) => setFormData({ ...formData, description_raw: e.target.value })}
            className="w-full px-4 py-2 bg-bg-root border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orb text-text-primary"
            placeholder="e.g., Grocery shopping at Loblaws"
            required
          />
        </div>

        {/* Category (Optional) */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Category
          </label>
          <select
            value={formData.category_id || ''}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value || undefined })}
            className="w-full px-4 py-2 bg-bg-root border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orb text-text-primary"
          >
            <option value="">Uncategorized</option>
            {categories
              .filter(cat => isInflow ? cat.type === 'income' : cat.type === 'expense')
              .map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-accent-orb text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isSubmitting ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
}

