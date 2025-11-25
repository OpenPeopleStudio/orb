import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { emailClient } from '../../lib/email';
import { exchangeGmailCode } from '../../lib/email/gmail';

export default function GmailCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const storedState = sessionStorage.getItem('gmail_auth_state');

      // Verify state to prevent CSRF
      if (!state || state !== storedState) {
        setStatus('error');
        setError('Invalid state parameter. Please try again.');
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received.');
        return;
      }

      try {
        // Exchange code for tokens
        const account = await exchangeGmailCode(code);
        
        // Add account to email client
        emailClient.addAccount(account);
        
        // Clear stored state
        sessionStorage.removeItem('gmail_auth_state');
        
        setStatus('success');
        
        // Redirect to settings after a short delay
        setTimeout(() => {
          navigate('/settings');
        }, 2000);
      } catch (err) {
        console.error('Gmail auth error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to connect Gmail account');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-root">
      <div className="max-w-md rounded-lg border border-white/10 bg-bg-surface p-8 text-center">
        {status === 'processing' && (
          <>
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent-sol/30 border-t-accent-sol"></div>
            <h2 className="mt-4 text-xl font-semibold">Connecting Gmail...</h2>
            <p className="mt-2 text-sm text-text-muted">
              Please wait while we connect your account
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-2xl">
              ✓
            </div>
            <h2 className="mt-4 text-xl font-semibold text-green-400">
              Gmail Connected!
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Redirecting to settings...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-2xl">
              ✕
            </div>
            <h2 className="mt-4 text-xl font-semibold text-red-400">
              Connection Failed
            </h2>
            <p className="mt-2 text-sm text-text-muted">{error}</p>
            <button
              onClick={() => navigate('/settings')}
              className="mt-6 rounded-lg bg-accent-orb/20 px-4 py-2 text-sm font-medium text-accent-orb hover:bg-accent-orb/30"
            >
              Back to Settings
            </button>
          </>
        )}
      </div>
    </div>
  );
}

