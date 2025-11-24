export default function CalendarHome() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Calendar</h1>
        <p className="mt-2 text-text-muted">
          Your schedule across all calendars
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-12 text-center">
        <div className="mx-auto max-w-md">
          <h2 className="text-xl font-semibold">Calendar Integration</h2>
          <p className="mt-4 text-text-muted">
            Connect your calendars to manage events and schedules.
          </p>
          <div className="mt-6">
            <p className="text-sm text-text-muted">
              <strong>Planned integrations:</strong>
            </p>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li>• Google Calendar</li>
              <li>• iCloud Calendar</li>
              <li>• Outlook Calendar</li>
              <li>• CalDAV</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

