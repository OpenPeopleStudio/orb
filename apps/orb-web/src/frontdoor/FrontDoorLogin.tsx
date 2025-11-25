import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase/client';

interface FrontDoorLoginProps {
  onSuccess?: () => void;
}

const FrontDoorLogin = ({ onSuccess }: FrontDoorLoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const supabaseEnabled = isSupabaseConfigured();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!supabaseEnabled) {
      setError('Supabase auth is not configured. Use demo mode to explore Orb.');
      return;
    }

    if (!email || !password) {
      setError('Enter both email and password.');
      return;
    }

    try {
      setStatus('loading');
      const supabase = getSupabaseClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        throw authError;
      }
      setStatus('success');
      onSuccess?.();
    } catch (authErr) {
      const message = authErr instanceof Error ? authErr.message : 'Unknown error';
      setError(message);
      setStatus('idle');
    }
  };

  return (
    <div className="space-y-6 text-white/80">
      <p className="text-base text-white/65">
        Authenticate to enter Orb. The gate is calm — the cosmos waits for you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-white/60" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-accent-orb focus:outline-none focus:ring-2 focus:ring-accent-orb/40"
            placeholder="you@orb.studio"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-white/60" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-accent-orb focus:outline-none focus:ring-2 focus:ring-accent-orb/40"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <button
          type="submit"
          className="w-full rounded-2xl bg-white/90 px-4 py-3 text-center text-base font-medium text-black transition hover:bg-white disabled:opacity-50 disabled:hover:bg-white/90"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Opening airlock…' : 'Enter Orb'}
        </button>
      </form>

      <div className="flex flex-col gap-3 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
        <span>
          {supabaseEnabled
            ? 'Use your Orb credentials to continue.'
            : 'Supabase not configured — use demo mode to explore.'}
        </span>
        <Link
          to="/"
          className="rounded-full border border-white/15 px-4 py-2 text-center text-white/80 transition hover:border-white/40 hover:text-white"
        >
          Continue in demo mode
        </Link>
      </div>
    </div>
  );
};

export default FrontDoorLogin;

