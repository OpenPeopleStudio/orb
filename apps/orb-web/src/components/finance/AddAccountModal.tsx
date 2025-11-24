/**
 * Add Account Modal
 * 
 * Modal for creating new financial accounts
 * Author: Orb System - Luna Agent (UI/UX)
 */

import React, { useState } from 'react';

import { useFinance } from '../../contexts/FinanceContext';
import { useToast } from '../../contexts/ToastContext';
import type { AccountType } from '../../lib/finance/types';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAccountModal({ isOpen, onClose }: AddAccountModalProps) {
  const { addAccount } = useFinance();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: AccountType.CHECKING,
    current_balance: '',
    currency: 'CAD',
    institution: '',
    account_number_last4: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }

    if (formData.current_balance && isNaN(parseFloat(formData.current_balance))) {
      newErrors.current_balance = 'Please enter a valid number';
    }

    if (formData.account_number_last4 && !/^\d{0,4}$/.test(formData.account_number_last4)) {
      newErrors.account_number_last4 = 'Last 4 digits must be numeric';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addAccount({
        name: formData.name.trim(),
        type: formData.type,
        current_balance: formData.current_balance ? parseFloat(formData.current_balance) : undefined,
        currency: formData.currency,
        institution: formData.institution.trim() || undefined,
        account_number_last4: formData.account_number_last4.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });

      if (result) {
        // Reset form
        setFormData({
          name: '',
          type: AccountType.CHECKING,
          current_balance: '',
          currency: 'CAD',
          institution: '',
          account_number_last4: '',
          notes: '',
        });
        setErrors({});
        success('Account created successfully! 🎉');
        onClose();
      } else {
        error('Failed to create account. Please try again.');
      }
    } catch (err) {
      console.error('Failed to create account:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      type: AccountType.CHECKING,
      current_balance: '',
      currency: 'CAD',
      institution: '',
      account_number_last4: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-bg-root rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-primary sticky top-0 bg-bg-root">
          <h2 className="text-xl font-semibold text-text-primary">
            Add Account
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Add a new financial account to track
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Account Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 bg-bg-secondary border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orb text-text-primary ${
                errors.name ? 'border-red-500' : 'border-border-primary'
              }`}
              placeholder="e.g., RBC Chequing"
              autoFocus
              required
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Account Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountType })}
              className="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orb text-text-primary"
              required
            >
              <option value={AccountType.CHECKING}>🏦 Checking</option>
              <option value={AccountType.SAVINGS}>💰 Savings</option>
              <option value={AccountType.CREDIT_CARD}>💳 Credit Card</option>
              <option value={AccountType.LOAN}>📄 Loan</option>
              <option value={AccountType.INVESTMENT}>📈 Investment</option>
              <option value={AccountType.CASH}>💵 Cash</option>
              <option value={AccountType.OTHER}>🔷 Other</option>
            </select>
          </div>

          {/* Initial Balance */}
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
                value={formData.current_balance}
                onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                className={`w-full pl-8 pr-4 py-2 bg-bg-secondary border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orb text-text-primary ${
                  errors.current_balance ? 'border-red-500' : 'border-border-primary'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.current_balance && (
              <p className="text-xs text-red-500 mt-1">{errors.current_balance}</p>
            )}
            <p className="text-xs text-text-secondary mt-1">
              Optional - you can update this later
            </p>
          </div>

          {/* Institution */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Institution
            </label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              className="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orb text-text-primary"
              placeholder="e.g., Royal Bank of Canada"
            />
          </div>

          {/* Last 4 Digits */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Last 4 Digits
            </label>
            <input
              type="text"
              maxLength={4}
              value={formData.account_number_last4}
              onChange={(e) => setFormData({ ...formData, account_number_last4: e.target.value.replace(/\D/g, '') })}
              className={`w-full px-4 py-2 bg-bg-secondary border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orb text-text-primary ${
                errors.account_number_last4 ? 'border-red-500' : 'border-border-primary'
              }`}
              placeholder="1234"
            />
            {errors.account_number_last4 && (
              <p className="text-xs text-red-500 mt-1">{errors.account_number_last4}</p>
            )}
            <p className="text-xs text-text-secondary mt-1">
              Last 4 digits of your account number (optional)
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orb text-text-primary resize-none"
              rows={3}
              placeholder="Any additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border-primary">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-accent-orb text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

