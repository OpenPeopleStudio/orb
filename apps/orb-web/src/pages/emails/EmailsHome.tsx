import { useState } from 'react';

export default function EmailsHome() {
  const [selectedAccount, setSelectedAccount] = useState<'gmail' | 'icloud' | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Emails</h1>
        <p className="mt-2 text-text-muted">
          Unified inbox across Gmail and iCloud
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
          <h2 className="text-xl font-semibold">Email Integration</h2>
          <p className="mt-4 text-text-muted">
            Connect your Gmail and iCloud accounts to see your emails here.
          </p>
          <div className="mt-6 space-y-3">
            <button className="w-full rounded-lg bg-accent-sol/20 px-4 py-3 text-sm font-medium text-accent-sol hover:bg-accent-sol/30">
              Connect Gmail Account
            </button>
            <button className="w-full rounded-lg bg-accent-te/20 px-4 py-3 text-sm font-medium text-accent-te hover:bg-accent-te/30">
              Connect iCloud Account
            </button>
          </div>
          <p className="mt-6 text-xs text-text-muted">
            Authentication flow will use OAuth 2.0 for secure access
          </p>
        </div>
      </div>
    </div>
  );
}

