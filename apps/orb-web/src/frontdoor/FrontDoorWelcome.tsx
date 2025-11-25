import type { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase/client';

interface FrontDoorWelcomeProps {
  user: User | null;
  onSignOut?: () => void;
}

const FrontDoorWelcome = ({ user, onSignOut }: FrontDoorWelcomeProps) => {
  const [signingOut, setSigningOut] = useState(false);
  const supabaseEnabled = isSupabaseConfigured();

  const handleSignOut = async () => {
    if (!supabaseEnabled) {
      onSignOut?.();
      return;
    }
    try {
      setSigningOut(true);
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      onSignOut?.();
    } finally {
      setSigningOut(false);
    }
  };

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'traveler';

  return (
    <div className="space-y-8 text-white/80">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">Welcome back</p>
        <h2 className="text-2xl font-semibold text-white md:text-3xl">Greetings, {displayName}.</h2>
        <p className="text-white/65">
          The dimensional window is open. Step through to continue where you left off, or pause and
          review outgoing missions.
        </p>
      </div>

      <div className="flex flex-col gap-3 text-base font-medium md:flex-row">
        <Link
          to="/"
          className="flex-1 rounded-2xl bg-white px-4 py-3 text-center text-black transition hover:bg-white/90"
        >
          Enter Orb
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex-1 rounded-2xl border border-white/20 px-4 py-3 text-center text-white transition hover:border-white/50"
          disabled={signingOut}
        >
          {signingOut ? 'Closing session…' : 'Sign out'}
        </button>
      </div>
    </div>
  );
};

export default FrontDoorWelcome;

