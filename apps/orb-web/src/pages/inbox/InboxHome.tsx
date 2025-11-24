import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useInbox } from '../../contexts/InboxContext';
import type { UnifiedItem } from '../../lib/inbox';
import { filterItems } from '../../lib/inbox';

type ViewFilter = 'all' | 'email' | 'message' | 'contact';
type AccountFilter = 'all' | string;

export default function InboxHome() {
  const { items: allItems, loading, error, stats: contextStats, refresh } = useInbox();
  
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Filter items based on current filters
  const filteredItems = useMemo(() => {
    return filterItems(allItems, {
      type: viewFilter,
      accountId: accountFilter === 'all' ? undefined : accountFilter,
      unread: showUnreadOnly ? true : undefined,
      search: searchQuery || undefined,
    });
  }, [allItems, viewFilter, accountFilter, showUnreadOnly, searchQuery]);

  // Use stats from context
  const stats = {
    all: contextStats.total,
    emails: contextStats.emails,
    messages: contextStats.messages,
    contacts: contextStats.contacts,
    unread: contextStats.unread,
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Unified Inbox</h1>
        <p className="mt-2 text-text-muted">
          All your communications in one place
        </p>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 space-y-4">
        {/* View Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              viewFilter === 'all'
                ? 'bg-accent-orb/20 text-accent-orb'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            All ({stats.all})
          </button>
          <button
            onClick={() => setViewFilter('emails')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              viewFilter === 'emails'
                ? 'bg-accent-sol/20 text-accent-sol'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            📧 Emails ({stats.emails})
          </button>
          <button
            onClick={() => setViewFilter('messages')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              viewFilter === 'messages'
                ? 'bg-accent-mav/20 text-accent-mav'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            💬 Messages ({stats.messages})
          </button>
          <button
            onClick={() => setViewFilter('contacts')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              viewFilter === 'contacts'
                ? 'bg-accent-luna/20 text-accent-luna'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            👥 Contacts ({stats.contacts})
          </button>
        </div>

        {/* Search & Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search communications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[300px] rounded-lg border border-white/10 bg-bg-root px-4 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-orb"
          />
          
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              showUnreadOnly
                ? 'bg-accent-te/20 text-accent-te'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            {showUnreadOnly ? '● ' : '○ '}Unread Only ({stats.unread})
          </button>

          <Link
            to="/settings"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-text-muted hover:bg-white/5"
          >
            ⚙️ Settings
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-white/10 bg-bg-surface/50 p-4">
              <div className="h-4 w-1/3 rounded bg-white/10" />
              <div className="mt-2 h-3 w-3/4 rounded bg-white/10" />
              <div className="mt-2 h-3 w-full rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={refresh}
            className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-12 text-center">
          <div className="mx-auto max-w-md">
            {allItems.length === 0 ? (
              <>
                <h2 className="text-xl font-semibold">Connect Your Accounts</h2>
                <p className="mt-4 text-text-muted">
                  Connect your email and messaging accounts to see all communications here.
                </p>
                <div className="mt-6">
                  <Link
                    to="/settings"
                    className="block w-full rounded-lg bg-accent-orb/20 px-4 py-3 text-sm font-medium text-accent-orb hover:bg-accent-orb/30"
                  >
                    Go to Settings → Account Connections
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-text-muted">No items match your filters</p>
                <button
                  onClick={() => {
                    setViewFilter('all');
                    setAccountFilter('all');
                    setShowUnreadOnly(false);
                    setSearchQuery('');
                  }}
                  className="mt-4 text-sm text-accent-orb hover:underline"
                >
                  Clear all filters
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <UnifiedItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function UnifiedItemCard({ item }: { item: UnifiedItem }) {
  const getItemUrl = () => {
    switch (item.type) {
      case 'email':
        return `/emails/${item.id}`;
      case 'message':
        return `/messages/${item.id}`;
      case 'contact':
        return `/contacts/${item.id}`;
      default:
        return '#';
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'email':
        return 'text-accent-sol';
      case 'message':
        return 'text-accent-mav';
      case 'contact':
        return 'text-accent-luna';
      default:
        return 'text-text-muted';
    }
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'email':
        return '📧';
      case 'message':
        return '💬';
      case 'contact':
        return '👤';
      default:
        return '•';
    }
  };

  return (
    <Link
      to={getItemUrl()}
      className="block rounded-lg border border-white/10 bg-bg-surface/50 p-4 transition-colors hover:bg-bg-surface/70"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className={`${getTypeColor()}`} title={item.type}>
              {getTypeIcon()}
            </span>
            <span className={`font-medium ${item.unread ? 'text-text-primary' : 'text-text-muted'}`}>
              {item.from.name || item.from.email}
            </span>
            {item.unread && (
              <span className="h-2 w-2 rounded-full bg-accent-sol" title="Unread" />
            )}
            {item.starred && (
              <span className="text-accent-orb" title="Starred">★</span>
            )}
            {item.hasAttachments && (
              <span className="text-text-muted" title="Has attachments">📎</span>
            )}
            {item.provider && (
              <span className="text-xs text-text-muted">
                {item.provider}
              </span>
            )}
          </div>
          
          {/* Subject (for emails) */}
          {item.subject && (
            <div className={`mt-1 truncate ${item.unread ? 'font-semibold text-text-primary' : 'text-text-muted'}`}>
              {item.subject}
            </div>
          )}
          
          {/* Snippet */}
          <div className="mt-1 truncate text-sm text-text-muted">
            {item.snippet}
          </div>
        </div>
        
        {/* Date */}
        <div className="ml-4 flex-shrink-0">
          <span className="whitespace-nowrap text-xs text-text-muted">
            {formatDate(item.date)}
          </span>
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

