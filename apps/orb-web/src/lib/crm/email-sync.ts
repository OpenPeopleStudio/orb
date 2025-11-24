/**
 * CRM Email Sync
 * 
 * Automatically sync emails with CRM contacts
 */

import type { Email } from '../email/types';
import { linkEmailToContact } from './client';
import type { LinkEmailRequest, EmailProvider as CrmEmailProvider } from './types';
import { isSupabaseConfigured } from '../supabase/client';

/**
 * Sync a batch of emails with the CRM
 * Creates or links contacts automatically
 */
export async function syncEmailsWithCrm(emails: Email[]): Promise<void> {
  // Skip if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return;
  }
  
  const errors: Error[] = [];
  
  for (const email of emails) {
    try {
      await syncEmailWithCrm(email);
    } catch (error) {
      console.error(`Failed to sync email ${email.id} with CRM:`, error);
      errors.push(error instanceof Error ? error : new Error(String(error)));
      // Continue with other emails even if one fails
    }
  }
  
  if (errors.length > 0 && errors.length === emails.length) {
    // All emails failed - throw error
    throw new Error(`Failed to sync ${errors.length} emails with CRM`);
  }
}

/**
 * Sync a single email with the CRM
 */
export async function syncEmailWithCrm(email: Email): Promise<string> {
  // Skip if Supabase is not configured
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  
  // Determine direction: if the account owner is in 'from', it's outbound
  const isOutbound = email.accountId === email.from.email;
  
  const request: LinkEmailRequest = {
    external_id: email.id,
    provider: mapEmailProvider(email.provider),
    account_id: email.accountId,
    direction: isOutbound ? 'outbound' : 'inbound',
    from_email: email.from.email,
    from_name: email.from.name,
    to_emails: email.to.map(addr => addr.email),
    cc_emails: email.cc?.map(addr => addr.email),
    bcc_emails: email.bcc?.map(addr => addr.email),
    subject: email.subject,
    snippet: email.snippet,
    body_text: email.body.text,
    body_html: email.body.html,
    thread_id: email.threadId,
    unread: email.unread,
    starred: email.starred,
    has_attachments: email.hasAttachments,
    labels: email.labels || [],
    received_at: email.date,
  };
  
  return await linkEmailToContact(request);
}

/**
 * Map email provider from email lib to CRM provider type
 */
function mapEmailProvider(provider: string): CrmEmailProvider {
  switch (provider.toLowerCase()) {
    case 'gmail':
      return 'gmail';
    case 'icloud':
      return 'icloud';
    case 'outlook':
      return 'outlook';
    default:
      return 'other';
  }
}

/**
 * Check if an email has already been synced with CRM
 * This is useful to avoid re-syncing emails
 */
export async function isEmailSynced(externalId: string, accountId: string): Promise<boolean> {
  // Skip if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return false;
  }
  
  const { getSupabaseClient } = await import('../supabase/client');
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('crm_emails')
    .select('id')
    .eq('external_id', externalId)
    .eq('account_id', accountId)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking if email is synced:', error);
    return false;
  }
  
  return !!data;
}

