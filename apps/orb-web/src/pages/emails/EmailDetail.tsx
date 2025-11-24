import { useParams } from 'react-router-dom';

export default function EmailDetail() {
  const { id } = useParams();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Email Detail</h1>
        <p className="mt-2 text-text-muted">Email ID: {id}</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-8">
        <p className="text-text-muted">
          Email detail view will show full email content, attachments, and reply options.
        </p>
      </div>
    </div>
  );
}

