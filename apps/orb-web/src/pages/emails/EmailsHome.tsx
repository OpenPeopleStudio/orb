import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function EmailsHome() {
  const [selectedAccount, setSelectedAccount] = useState<'gmail' | 'icloud' | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Emails</h1>
        <p className="mt-2 text-text-muted">
          Unified inbox across all connected accounts
        </p>
      </div>

      {/* Account Selector */}
      <div className="mb-6 flex gap-4">
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
        <button
          onClick={() => setSelectedAccount('gmail')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            selectedAccount === 'gmail'
              ? 'bg-accent-sol/20 text-accent-sol'
              : 'bg-white/5 text-text-muted hover:bg-white/10'
          }`}
        >
          Gmail
        </button>
        <button
          onClick={() => setSelectedAccount('icloud')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            selectedAccount === 'icloud'
              ? 'bg-accent-te/20 text-accent-te'
              : 'bg-white/5 text-text-muted hover:bg-white/10'
          }`}
        >
          iCloud
        </button>
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

