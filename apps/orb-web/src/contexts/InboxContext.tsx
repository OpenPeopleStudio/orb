import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { syncEmailsWithCrm, getContacts as getCrmContacts } from '../lib/crm';
import { emailClient } from '../lib/email';
import type { Email } from '../lib/email';
import type { UnifiedItem, Message, Contact, InboxStats } from '../lib/inbox';
import { mergeAndSort } from '../lib/inbox';
import { isSupabaseConfigured } from '../lib/supabase/client';

interface InboxContextValue {
  items: UnifiedItem[];
  loading: boolean;
  error: string | null;
  stats: InboxStats;
  refresh: () => Promise<void>;
}

const InboxContext = createContext<InboxContextValue | null>(null);

export function InboxProvider({ children }: { children: ReactNode }) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [messages] = useState<Message[]>([]); // TODO: Implement message fetching
  const [contacts] = useState<Contact[]>([]); // TODO: Implement contact fetching
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const items = mergeAndSort(emails, messages, contacts);

  const stats: InboxStats = {
    total: items.length,
    emails: emails.length,
    messages: messages.length,
    contacts: contacts.length,
    unread: items.filter(i => i.unread).length,
    starred: items.filter(i => i.starred).length,
    important: items.filter(i => i.important).length,
  };

  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch emails from all connected accounts
      const emailAccounts = emailClient.getAllAccounts();
      
      if (emailAccounts.length > 0) {
        const emailResult = await emailClient.fetchEmails({ limit: 100 });
        setEmails(emailResult.emails);
        
        // Sync emails with CRM (creates contacts automatically)
        if (isSupabaseConfigured()) {
          try {
            await syncEmailsWithCrm(emailResult.emails);
            console.log(`Synced ${emailResult.emails.length} emails with CRM`);
          } catch (syncError) {
            console.warn('Failed to sync some emails with CRM:', syncError);
            // Don't throw - email fetching succeeded even if CRM sync failed
          }
        }
      }

      // Fetch contacts from CRM
      if (isSupabaseConfigured()) {
        try {
          const crmContacts = await getCrmContacts({ limit: 100 });
          // Convert CRM contacts to inbox Contact format
          const inboxContacts: Contact[] = crmContacts.map(contact => ({
            id: contact.id,
            name: contact.full_name,
            emails: contact.emails,
            phones: contact.phones,
            avatar: contact.avatar_url,
            company: contact.company,
            title: contact.title,
            notes: contact.notes,
            lastContact: contact.last_interaction_at ? new Date(contact.last_interaction_at) : undefined,
            tags: contact.tags,
          }));
          setContacts(inboxContacts);
        } catch (contactError) {
          console.warn('Failed to fetch contacts from CRM:', contactError);
          // Don't throw - email fetching succeeded
        }
      }

      // TODO: Fetch messages from message providers
      // const messageResult = await messageClient.fetchMessages({ limit: 100 });
      // setMessages(messageResult.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load communications');
      console.error('Failed to refresh inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <InboxContext.Provider value={{ items, loading, error, stats, refresh }}>
      {children}
    </InboxContext.Provider>
  );
}

export function useInbox() {
  const context = useContext(InboxContext);
  if (!context) {
    throw new Error('useInbox must be used within InboxProvider');
  }
  return context;
}

