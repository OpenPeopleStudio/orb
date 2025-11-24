/**
 * Accounts Page
 * 
 * Full page for managing financial accounts
 * Author: Orb System - Luna Agent (UI/UX)
 */

import React from 'react';
import { Link } from 'react-router-dom';

import { AccountsList } from '../../components/finance/AccountsList';

export default function AccountsPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/finance"
            className="text-accent-orb hover:underline text-sm mb-2 inline-block"
          >
            ← Back to Finance
          </Link>
          <h1 className="text-3xl font-bold text-text-primary">Accounts</h1>
          <p className="text-text-secondary mt-1">
            Manage your financial accounts and balances
          </p>
        </div>
      </div>

      {/* Accounts List */}
      <AccountsList />
    </div>
  );
}

