export default function ContactsHome() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Contacts</h1>
        <p className="mt-2 text-text-muted">
          Your contact network and communication history
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-12 text-center">
        <p className="text-text-muted">
          Connect your Supabase backend to see your contacts
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Configure <code className="rounded bg-white/5 px-2 py-1">VITE_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-white/5 px-2 py-1">VITE_SUPABASE_ANON_KEY</code>
        </p>
      </div>
    </div>
  );
}

