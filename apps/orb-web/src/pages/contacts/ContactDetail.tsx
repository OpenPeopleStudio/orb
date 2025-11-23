import { useParams, Link } from 'react-router-dom';

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <Link
          to="/contacts"
          className="text-sm text-text-muted hover:text-text-primary"
        >
          ← Back to Contacts
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Contact {id}</h1>
      </div>

      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-12 text-center">
        <p className="text-text-muted">
          Contact details will appear here when connected to your backend
        </p>
      </div>
    </div>
  );
}

