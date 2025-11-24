export default function MessagesHome() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Messages</h1>
        <p className="mt-2 text-text-muted">
          SMS, iMessage, and messaging conversations
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-12 text-center">
        <div className="mx-auto max-w-md">
          <h2 className="text-xl font-semibold">Messaging Integration</h2>
          <p className="mt-4 text-text-muted">
            Connect your messaging accounts to see conversations here.
          </p>
          <div className="mt-6">
            <p className="text-sm text-text-muted">
              <strong>Planned integrations:</strong>
            </p>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li>• iMessage (via Mac sync)</li>
              <li>• SMS (via phone sync)</li>
              <li>• WhatsApp</li>
              <li>• Telegram</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

