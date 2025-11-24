export default function FilesHome() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Files</h1>
        <p className="mt-2 text-text-muted">
          Documents, attachments, and file management
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-12 text-center">
        <div className="mx-auto max-w-md">
          <h2 className="text-xl font-semibold">File System</h2>
          <p className="mt-4 text-text-muted">
            Unified view of files from all connected sources.
          </p>
          <div className="mt-6">
            <p className="text-sm text-text-muted">
              <strong>Planned integrations:</strong>
            </p>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li>• Local file system</li>
              <li>• Google Drive</li>
              <li>• iCloud Drive</li>
              <li>• Dropbox</li>
              <li>• Email attachments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

