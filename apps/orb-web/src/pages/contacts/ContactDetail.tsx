import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { getContact, getContactEmails } from '../../lib/crm';
import type { Contact, CrmEmail, RelationshipStatus } from '../../lib/crm';

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [emails, setEmails] = useState<CrmEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'details'>('timeline');

  useEffect(() => {
    if (id) {
      loadContactData(id);
    }
  }, [id]);

  const loadContactData = async (contactId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [contactData, emailsData] = await Promise.all([
        getContact(contactId),
        getContactEmails(contactId),
      ]);
      
      if (!contactData) {
        setError('Contact not found');
      } else {
        setContact(contactData);
        setEmails(emailsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contact');
      console.error('Failed to load contact:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-white/10" />
          <div className="h-4 w-96 rounded bg-white/10" />
          <div className="h-64 rounded-lg bg-white/10" />
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">{error || 'Contact not found'}</p>
          <Link
            to="/contacts"
            className="mt-4 inline-block text-sm text-accent-luna hover:underline"
          >
            ← Back to Contacts
          </Link>
        </div>
      </div>
    );
  }

  const initials = contact.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Back button */}
      <Link
        to="/contacts"
        className="mb-4 inline-flex items-center text-sm text-text-muted hover:text-text-primary"
      >
        ← Back to Contacts
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {contact.avatar_url ? (
            <img
              src={contact.avatar_url}
              alt={contact.full_name}
              className="h-24 w-24 rounded-full"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-luna/20 text-3xl text-accent-luna">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">{contact.full_name}</h1>
            <span className={`rounded px-3 py-1 text-sm font-medium ${getStatusColor(contact.relationship_status)}`}>
              {contact.relationship_status}
            </span>
          </div>

          {(contact.title || contact.company) && (
            <p className="mt-2 text-lg text-text-muted">
              {[contact.title, contact.company].filter(Boolean).join(' at ')}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {contact.primary_email && (
              <a
                href={`mailto:${contact.primary_email}`}
                className="flex items-center gap-2 text-accent-sol hover:underline"
              >
                📧 {contact.primary_email}
              </a>
            )}
            {contact.phones.length > 0 && (
              <a
                href={`tel:${contact.phones[0]}`}
                className="flex items-center gap-2 text-accent-mav hover:underline"
              >
                📞 {contact.phones[0]}
              </a>
            )}
          </div>

          {contact.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {contact.tags.map(tag => (
                <span
                  key={tag}
                  className="rounded bg-white/10 px-3 py-1 text-sm text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          <button className="rounded-lg bg-accent-sol/20 px-4 py-2 font-medium text-accent-sol hover:bg-accent-sol/30">
            ✉️ Compose Email
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`border-b-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'timeline'
              ? 'border-accent-luna text-accent-luna'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Timeline ({emails.length})
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`border-b-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'details'
              ? 'border-accent-luna text-accent-luna'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Details
        </button>
      </div>

      {/* Content */}
      {activeTab === 'timeline' ? (
        <div className="space-y-4">
          {emails.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-12 text-center">
              <p className="text-text-muted">No communication history yet</p>
            </div>
          ) : (
            emails.map(email => (
              <EmailTimelineItem key={email.id} email={email} />
            ))
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="mb-3 font-semibold">Basic Information</h3>
              <dl className="space-y-2">
                <div className="flex gap-4">
                  <dt className="w-32 text-text-muted">Full Name</dt>
                  <dd className="text-text-primary">{contact.full_name}</dd>
                </div>
                {contact.first_name && (
                  <div className="flex gap-4">
                    <dt className="w-32 text-text-muted">First Name</dt>
                    <dd className="text-text-primary">{contact.first_name}</dd>
                  </div>
                )}
                {contact.last_name && (
                  <div className="flex gap-4">
                    <dt className="w-32 text-text-muted">Last Name</dt>
                    <dd className="text-text-primary">{contact.last_name}</dd>
                  </div>
                )}
                <div className="flex gap-4">
                  <dt className="w-32 text-text-muted">Type</dt>
                  <dd className="text-text-primary">{contact.type}</dd>
                </div>
              </dl>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="mb-3 font-semibold">Contact Information</h3>
              <dl className="space-y-2">
                {contact.emails.length > 0 && (
                  <div className="flex gap-4">
                    <dt className="w-32 text-text-muted">Emails</dt>
                    <dd className="text-text-primary">
                      {contact.emails.map(email => (
                        <div key={email}>{email}</div>
                      ))}
                    </dd>
                  </div>
                )}
                {contact.phones.length > 0 && (
                  <div className="flex gap-4">
                    <dt className="w-32 text-text-muted">Phones</dt>
                    <dd className="text-text-primary">
                      {contact.phones.map(phone => (
                        <div key={phone}>{phone}</div>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Notes */}
            {contact.notes && (
              <div>
                <h3 className="mb-3 font-semibold">Notes</h3>
                <p className="text-text-muted">{contact.notes}</p>
              </div>
            )}

            {/* Metadata */}
            <div>
              <h3 className="mb-3 font-semibold">Metadata</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex gap-4">
                  <dt className="w-32 text-text-muted">Origin</dt>
                  <dd className="text-text-primary">{contact.origin}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-32 text-text-muted">Created</dt>
                  <dd className="text-text-primary">
                    {new Date(contact.created_at).toLocaleString()}
                  </dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-32 text-text-muted">Last Updated</dt>
                  <dd className="text-text-primary">
                    {new Date(contact.updated_at).toLocaleString()}
                  </dd>
                </div>
                {contact.last_interaction_at && (
                  <div className="flex gap-4">
                    <dt className="w-32 text-text-muted">Last Interaction</dt>
                    <dd className="text-text-primary">
                      {new Date(contact.last_interaction_at).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmailTimelineItem({ email }: { email: CrmEmail }) {
  const isInbound = email.direction === 'inbound';

  return (
    <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-4">
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${isInbound ? 'text-accent-sol' : 'text-accent-mav'}`}>
          {isInbound ? '📨' : '📤'}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text-primary">
              {isInbound ? 'Received' : 'Sent'}
            </span>
            <span className="text-xs text-text-muted">
              {new Date(email.received_at).toLocaleString()}
            </span>
            {email.unread && (
              <span className="rounded bg-accent-sol/20 px-2 py-0.5 text-xs text-accent-sol">
                Unread
              </span>
            )}
          </div>

          {email.subject && (
            <div className="mt-1 font-medium text-text-primary">
              {email.subject}
            </div>
          )}

          {email.snippet && (
            <div className="mt-1 text-sm text-text-muted">
              {email.snippet}
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-muted">
            <span>From: {email.from_name || email.from_email}</span>
            {email.to_emails.length > 0 && (
              <span>To: {email.to_emails.join(', ')}</span>
            )}
            {email.has_attachments && (
              <span className="text-accent-te">📎 Has attachments</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
