export default function TasksHome() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Tasks</h1>
        <p className="mt-2 text-text-muted">
          Action items and workflow management
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-12 text-center">
        <div className="mx-auto max-w-md">
          <h2 className="text-xl font-semibold">Task Management</h2>
          <p className="mt-4 text-text-muted">
            Orb's intelligent task system powered by Mav.
          </p>
          <div className="mt-6">
            <p className="text-sm text-text-muted">
              <strong>Features:</strong>
            </p>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li>• AI-generated action plans</li>
              <li>• Context-aware prioritization</li>
              <li>• Mode-specific task filtering</li>
              <li>• Automated task breakdown</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

