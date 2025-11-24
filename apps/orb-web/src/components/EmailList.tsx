import { Link } from 'react-router-dom';
import type { Email } from '../lib/email';

interface Props {
  emails: Email[];
  loading?: boolean;
}

export default function EmailList({ emails, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-white/10 bg-bg-surface/50 p-4">
            <div className="h-4 w-1/3 rounded bg-white/10" />
            <div className="mt-2 h-3 w-3/4 rounded bg-white/10" />
            <div className="mt-2 h-3 w-full rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-12 text-center">
        <p className="text-text-muted">No emails found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {emails.map((email) => (
        <Link
          key={email.id}
          to={`/emails/${email.id}`}
          className="block rounded-lg border border-white/10 bg-bg-surface/50 p-4 transition-colors hover:bg-bg-surface/70"
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              {/* From */}
              <div className="flex items-center gap-2">
                <span className={`font-medium ${email.unread ? 'text-text-primary' : 'text-text-muted'}`}>
                  {email.from.name || email.from.email}
                </span>
                {email.unread && (
                  <span className="h-2 w-2 rounded-full bg-accent-sol" title="Unread" />
                )}
                {email.starred && (
                  <span className="text-accent-orb" title="Starred">★</span>
                )}
                {email.hasAttachments && (
                  <span className="text-text-muted" title="Has attachments">📎</span>
                )}
              </div>
              
              {/* Subject */}
              <div className={`mt-1 truncate ${email.unread ? 'font-semibold text-text-primary' : 'text-text-muted'}`}>
                {email.subject}
              </div>
              
              {/* Snippet */}
              <div className="mt-1 truncate text-sm text-text-muted">
                {email.snippet}
              </div>
            </div>
            
            {/* Date & Provider */}
            <div className="ml-4 flex flex-col items-end gap-1">
              <span className="whitespace-nowrap text-xs text-text-muted">
                {formatEmailDate(email.date)}
              </span>
              <span className={`text-xs ${
                email.provider === 'gmail' ? 'text-accent-sol' : 'text-accent-te'
              }`}>
                {email.provider}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function formatEmailDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    // Today - show time
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else if (days < 365) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }
}

