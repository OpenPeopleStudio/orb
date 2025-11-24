import { useState } from 'react';
import type { EmailSendRequest, EmailAccount } from '../lib/email';

interface Props {
  accounts: EmailAccount[];
  onSend: (request: EmailSendRequest) => Promise<void>;
  onCancel: () => void;
  replyTo?: {
    emailId: string;
    subject: string;
    to: string;
  };
}

export default function EmailComposer({ accounts, onSend, onCancel, replyTo }: Props) {
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [to, setTo] = useState(replyTo?.to || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!to || !subject || !selectedAccountId) {
      return;
    }
    
    setSending(true);
    
    try {
      await onSend({
        accountId: selectedAccountId,
        to: to.split(',').map(email => ({ email: email.trim() })),
        cc: cc ? cc.split(',').map(email => ({ email: email.trim() })) : undefined,
        bcc: bcc ? bcc.split(',').map(email => ({ email: email.trim() })) : undefined,
        subject,
        body: { text: body },
        inReplyTo: replyTo?.emailId,
      });
      
      onCancel();
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-white/20 bg-bg-surface p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {replyTo ? 'Reply' : 'New Email'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-text-muted hover:text-text-primary"
            >
              ✕
            </button>
          </div>

          {/* From Account */}
          <div>
            <label className="block text-sm text-text-muted">From</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-bg-root px-3 py-2 text-text-primary outline-none focus:border-accent-orb"
            >
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.email} ({account.provider})
                </option>
              ))}
            </select>
          </div>

          {/* To */}
          <div>
            <label className="block text-sm text-text-muted">To</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="mt-1 w-full rounded-lg border border-white/10 bg-bg-root px-3 py-2 text-text-primary outline-none focus:border-accent-orb"
              required
            />
          </div>

          {/* CC/BCC Toggle */}
          {!showCc && !showBcc && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCc(true)}
                className="text-sm text-text-muted hover:text-text-primary"
              >
                + Cc
              </button>
              <button
                type="button"
                onClick={() => setShowBcc(true)}
                className="text-sm text-text-muted hover:text-text-primary"
              >
                + Bcc
              </button>
            </div>
          )}

          {/* Cc */}
          {showCc && (
            <div>
              <label className="block text-sm text-text-muted">Cc</label>
              <input
                type="text"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="cc@example.com"
                className="mt-1 w-full rounded-lg border border-white/10 bg-bg-root px-3 py-2 text-text-primary outline-none focus:border-accent-orb"
              />
            </div>
          )}

          {/* Bcc */}
          {showBcc && (
            <div>
              <label className="block text-sm text-text-muted">Bcc</label>
              <input
                type="text"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="bcc@example.com"
                className="mt-1 w-full rounded-lg border border-white/10 bg-bg-root px-3 py-2 text-text-primary outline-none focus:border-accent-orb"
              />
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm text-text-muted">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="mt-1 w-full rounded-lg border border-white/10 bg-bg-root px-3 py-2 text-text-primary outline-none focus:border-accent-orb"
              required
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm text-text-muted">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={12}
              className="mt-1 w-full rounded-lg border border-white/10 bg-bg-root px-3 py-2 text-text-primary outline-none focus:border-accent-orb"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-text-muted hover:bg-white/5"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent-sol/20 px-4 py-2 text-sm font-medium text-accent-sol hover:bg-accent-sol/30 disabled:opacity-50"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

