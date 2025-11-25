import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import EmailList from '../../components/EmailList';
import { emailClient } from '../../lib/email';
import type { Email } from '../../lib/email';

export default function EmailsHome() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const connectedAccounts = emailClient.getAllAccounts();

  useEffect(() => {
    loadEmails();
  }, [selectedAccount]);

  const loadEmails = async () => {
    if (connectedAccounts.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await emailClient.fetchEmails({
        accountId: selectedAccount || undefined,
        limit: 50,
      });
      setEmails(result.emails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emails');
      console.error('Failed to load emails:', err);
    } finally {
      setLoading(false);
    }
  };

  if (connectedAccounts.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Emails</h1>
          <p className="mt-2 text-text-muted">
            Unified inbox across all connected accounts
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-12 text-center">
          <div className="mx-auto max-w-md">
            <h2 className="text-xl font-semibold">No Email Accounts Connected</h2>
            <p className="mt-4 text-text-muted">
              Connect your email accounts in Settings to see your emails here.
            </p>
            <div className="mt-6">
              <Link
                to="/settings"
                className="inline-block w-full rounded-lg bg-accent-orb/20 px-4 py-3 text-sm font-medium text-accent-orb hover:bg-accent-orb/30"
              >
                Go to Settings → Account Connections
              </Link>
            </div>
            <p className="mt-6 text-xs text-text-muted">
              Supports Gmail, iCloud, and more
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Emails</h1>
          <p className="mt-2 text-text-muted">
            {connectedAccounts.length} account{connectedAccounts.length !== 1 ? 's' : ''} connected
          </p>
        </div>
        <button
          onClick={loadEmails}
          className="rounded-lg bg-accent-orb/20 px-4 py-2 text-sm font-medium text-accent-orb hover:bg-accent-orb/30"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Account Selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setSelectedAccount(null)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            selectedAccount === null
              ? 'bg-accent-orb/20 text-accent-orb'
              : 'bg-white/5 text-text-muted hover:bg-white/10'
          }`}
        >
          All Accounts
        </button>
        {connectedAccounts.map(account => (
          <button
            key={account.id}
            onClick={() => setSelectedAccount(account.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedAccount === account.id
                ? account.provider === 'gmail' 
                  ? 'bg-accent-sol/20 text-accent-sol'
                  : 'bg-accent-te/20 text-accent-te'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            {account.email}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={loadEmails}
            className="mt-2 text-sm text-red-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      <EmailList emails={emails} loading={loading} />
    </div>
  );
}

