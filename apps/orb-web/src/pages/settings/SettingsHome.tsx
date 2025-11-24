export default function SettingsHome() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-text-muted">
          Configure your Orb experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
          <h2 className="text-xl font-semibold">Account</h2>
          <p className="mt-2 text-sm text-text-muted">
            User profile and authentication settings
          </p>
        </div>

        {/* Integrations */}
        <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
          <h2 className="text-xl font-semibold">Integrations</h2>
          <p className="mt-2 text-sm text-text-muted">
            Connected services and API keys
          </p>
          <ul className="mt-4 space-y-2 text-sm text-text-muted">
            <li>• Gmail / Google Workspace</li>
            <li>• iCloud / Apple</li>
            <li>• Supabase backend</li>
            <li>• OpenAI API</li>
          </ul>
        </div>

        {/* Modes & Personas */}
        <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
          <h2 className="text-xl font-semibold">Modes & Personas</h2>
          <p className="mt-2 text-sm text-text-muted">
            Configure operational modes and persona preferences
          </p>
        </div>

        {/* Constraints */}
        <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
          <h2 className="text-xl font-semibold">Constraints</h2>
          <p className="mt-2 text-sm text-text-muted">
            Safety rules and guardrails managed by Luna
          </p>
        </div>

        {/* Privacy & Data */}
        <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
          <h2 className="text-xl font-semibold">Privacy & Data</h2>
          <p className="mt-2 text-sm text-text-muted">
            Data storage, encryption, and privacy controls
          </p>
        </div>
      </div>
    </div>
  );
}

