import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { getContactsWithEmails, getCrmStats } from '../../lib/crm';
import type { ContactWithEmails, CrmStats, RelationshipStatus } from '../../lib/crm';

type StatusFilter = 'all' | RelationshipStatus;

export default function ContactsHome() {
  const [contacts, setContacts] = useState<ContactWithEmails[]>([]);
  const [stats, setStats] = useState<CrmStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showNewContactForm, setShowNewContactForm] = useState(false);

  useEffect(() => {
    loadContacts();
    loadStats();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getContactsWithEmails({
        search: searchQuery || undefined,
        relationship_status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 100,
      });
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getCrmStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        contact.full_name.toLowerCase().includes(query) ||
        contact.primary_email?.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query) ||
        contact.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const getStatusColor = (status: RelationshipStatus) => {
    switch (status) {
      case 'hot':
        return 'text-red-400 bg-red-400/10';
      case 'warm':
        return 'text-orange-400 bg-orange-400/10';
      case 'active':
        return 'text-green-400 bg-green-400/10';
      case 'cold':
        return 'text-blue-400 bg-blue-400/10';
      case 'dormant':
        return 'text-gray-400 bg-gray-400/10';
      case 'conflict':
        return 'text-red-600 bg-red-600/10';
      default:
        return 'text-text-muted bg-white/5';
    }
  };

  const getStatusLabel = (status: RelationshipStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Contacts</h1>
          <p className="mt-2 text-text-muted">
            Manage your relationship network
          </p>
        </div>
        
        <button
          onClick={() => setShowNewContactForm(true)}
          className="rounded-lg bg-accent-luna/20 px-4 py-2 font-medium text-accent-luna hover:bg-accent-luna/30"
        >
          + New Contact
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-4">
            <div className="text-2xl font-semibold">{stats.total_contacts}</div>
            <div className="text-sm text-text-muted">Total Contacts</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-4">
            <div className="text-2xl font-semibold">{stats.emails_count}</div>
            <div className="text-sm text-text-muted">Emails Tracked</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-4">
            <div className="text-2xl font-semibold">{stats.recent_interactions}</div>
            <div className="text-sm text-text-muted">Recent (7 days)</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-4">
            <div className="text-2xl font-semibold">
              {stats.contacts_by_status?.active || 0}
            </div>
            <div className="text-sm text-text-muted">Active</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-accent-luna/20 text-accent-luna'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            All
          </button>
          {(['hot', 'warm', 'active', 'cold', 'dormant'] as RelationshipStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-accent-luna/20 text-accent-luna'
                  : 'bg-white/5 text-text-muted hover:bg-white/10'
              }`}
            >
              {getStatusLabel(status)} ({stats?.contacts_by_status?.[status] || 0})
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search contacts by name, email, company, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-bg-root px-4 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-luna"
        />
      </div>

      {/* Loading/Error/Empty States */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-white/10 bg-bg-surface/50 p-4">
              <div className="h-4 w-1/3 rounded bg-white/10" />
              <div className="mt-2 h-3 w-1/2 rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadContacts}
            className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-12 text-center">
          <div className="mx-auto max-w-md">
            {contacts.length === 0 ? (
              <>
                <h2 className="text-xl font-semibold">No Contacts Yet</h2>
                <p className="mt-4 text-text-muted">
                  Contacts are automatically created from your emails, or you can add them manually.
                </p>
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => setShowNewContactForm(true)}
                    className="block w-full rounded-lg bg-accent-luna/20 px-4 py-3 text-sm font-medium text-accent-luna hover:bg-accent-luna/30"
                  >
                    Add First Contact
                  </button>
                  <Link
                    to="/settings"
                    className="block w-full rounded-lg bg-accent-orb/20 px-4 py-3 text-sm font-medium text-accent-orb hover:bg-accent-orb/30"
                  >
                    Connect Email Accounts in Settings
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-text-muted">No contacts match your filters</p>
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 text-sm text-accent-luna hover:underline"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} getStatusColor={getStatusColor} />
          ))}
        </div>
      )}

      {/* New Contact Form (placeholder) */}
      {showNewContactForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-lg rounded-lg border border-white/10 bg-bg-surface p-6">
            <h2 className="text-xl font-semibold">New Contact</h2>
            <p className="mt-2 text-text-muted">Coming soon...</p>
            <button
              onClick={() => setShowNewContactForm(false)}
              className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactCard({ 
  contact, 
  getStatusColor 
}: { 
  contact: ContactWithEmails;
  getStatusColor: (status: RelationshipStatus) => string;
}) {
  const initials = contact.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      to={`/contacts/${contact.id}`}
      className="block rounded-lg border border-white/10 bg-bg-surface/50 p-4 transition-colors hover:bg-bg-surface/70"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {contact.avatar_url ? (
            <img
              src={contact.avatar_url}
              alt={contact.full_name}
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-luna/20 text-accent-luna">
              {initials}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-text-primary">{contact.full_name}</h3>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusColor(contact.relationship_status)}`}>
              {contact.relationship_status}
            </span>
          </div>

          {contact.title && contact.company && (
            <div className="mt-1 text-sm text-text-muted">
              {contact.title} at {contact.company}
            </div>
          )}

          {contact.primary_email && (
            <div className="mt-1 text-sm text-text-muted">
              {contact.primary_email}
            </div>
          )}

          {contact.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {contact.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="rounded bg-white/5 px-2 py-0.5 text-xs text-text-muted"
                >
                  {tag}
                </span>
              ))}
              {contact.tags.length > 3 && (
                <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-text-muted">
                  +{contact.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex-shrink-0 text-right">
          <div className="text-sm font-medium text-text-primary">
            {contact.emails_count} {contact.emails_count === 1 ? 'email' : 'emails'}
          </div>
          {contact.last_interaction_at && (
            <div className="mt-1 text-xs text-text-muted">
              {formatDate(new Date(contact.last_interaction_at))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }
}
