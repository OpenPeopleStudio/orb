/**
 * CRM Client
 * 
 * Client library for contact relationship management with Supabase backend
 */

import { getSupabaseClient } from '../supabase/client';
import type {
  Contact,
  ContactFilter,
  ContactWithEmails,
  CreateContactRequest,
  UpdateContactRequest,
  CrmEmail,
  LinkEmailRequest,
  ClientContext,
  CrmStats,
} from './types';

/**
 * Get all contacts for the current user
 */
export async function getContacts(filter: ContactFilter = {}): Promise<Contact[]> {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('crm_contacts')
    .select('*')
    .order('last_interaction_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  
  // Apply filters
  if (filter.search) {
    // Use full-text search
    query = query.textSearch('search_vector', filter.search);
  }
  
  if (filter.tags && filter.tags.length > 0) {
    query = query.contains('tags', filter.tags);
  }
  
  if (filter.relationship_status) {
    query = query.eq('relationship_status', filter.relationship_status);
  }
  
  if (filter.has_email !== undefined) {
    if (filter.has_email) {
      query = query.not('primary_email', 'is', null);
    } else {
      query = query.is('primary_email', null);
    }
  }
  
  if (filter.limit) {
    query = query.limit(filter.limit);
  }
  
  if (filter.offset) {
    query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching contacts:', error);
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get contacts with their email counts
 */
export async function getContactsWithEmails(filter: ContactFilter = {}): Promise<ContactWithEmails[]> {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('crm_contacts')
    .select(`
      *,
      emails_count:crm_emails(count)
    `)
    .order('last_interaction_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  
  if (filter.search) {
    query = query.textSearch('search_vector', filter.search);
  }
  
  if (filter.tags && filter.tags.length > 0) {
    query = query.contains('tags', filter.tags);
  }
  
  if (filter.relationship_status) {
    query = query.eq('relationship_status', filter.relationship_status);
  }
  
  if (filter.limit) {
    query = query.limit(filter.limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching contacts with emails:', error);
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }
  
  return (data || []).map(contact => ({
    ...contact,
    emails_count: contact.emails_count?.[0]?.count || 0,
  }));
}

/**
 * Get a single contact by ID
 */
export async function getContact(id: string): Promise<Contact | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('crm_contacts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching contact:', error);
    throw new Error(`Failed to fetch contact: ${error.message}`);
  }
  
  return data;
}

/**
 * Create a new contact
 */
export async function createContact(request: CreateContactRequest): Promise<Contact> {
  const supabase = getSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('crm_contacts')
    .insert({
      user_id: user.id,
      full_name: request.full_name,
      first_name: request.first_name,
      last_name: request.last_name,
      nickname: request.nickname,
      type: request.type || 'person',
      primary_email: request.primary_email,
      emails: request.emails || [],
      phones: request.phones || [],
      company: request.company,
      title: request.title,
      tags: request.tags || [],
      notes: request.notes,
      avatar_url: request.avatar_url,
      origin: request.origin || 'manual',
      relationship_status: request.relationship_status || 'cold',
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating contact:', error);
    throw new Error(`Failed to create contact: ${error.message}`);
  }
  
  return data;
}

/**
 * Update an existing contact
 */
export async function updateContact(request: UpdateContactRequest): Promise<Contact> {
  const supabase = getSupabaseClient();
  
  const { id, ...updates } = request;
  
  const { data, error } = await supabase
    .from('crm_contacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating contact:', error);
    throw new Error(`Failed to update contact: ${error.message}`);
  }
  
  return data;
}

/**
 * Delete a contact
 */
export async function deleteContact(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('crm_contacts')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting contact:', error);
    throw new Error(`Failed to delete contact: ${error.message}`);
  }
}

/**
 * Get emails for a contact
 */
export async function getContactEmails(contactId: string, limit = 50): Promise<CrmEmail[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('crm_emails')
    .select('*')
    .eq('contact_id', contactId)
    .order('received_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching contact emails:', error);
    throw new Error(`Failed to fetch contact emails: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Link an email to a contact (creates contact if needed)
 */
export async function linkEmailToContact(request: LinkEmailRequest): Promise<string> {
  const supabase = getSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Call the Postgres function that handles the linking logic
  const { data, error } = await supabase.rpc('link_email_to_contact', {
    p_user_id: user.id,
    p_external_id: request.external_id,
    p_provider: request.provider,
    p_account_id: request.account_id,
    p_direction: request.direction,
    p_from_email: request.from_email,
    p_from_name: request.from_name || null,
    p_to_emails: request.to_emails,
    p_subject: request.subject || null,
    p_snippet: request.snippet || null,
    p_received_at: request.received_at.toISOString(),
    p_unread: request.unread ?? true,
    p_starred: request.starred ?? false,
    p_has_attachments: request.has_attachments ?? false,
    p_thread_id: request.thread_id || null,
  });
  
  if (error) {
    console.error('Error linking email to contact:', error);
    throw new Error(`Failed to link email to contact: ${error.message}`);
  }
  
  return data; // Returns the email ID
}

/**
 * Find or create a contact by email
 */
export async function findOrCreateContactByEmail(
  email: string,
  name?: string
): Promise<string> {
  const supabase = getSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase.rpc('find_or_create_contact_by_email', {
    p_user_id: user.id,
    p_email: email,
    p_name: name || null,
  });
  
  if (error) {
    console.error('Error finding/creating contact:', error);
    throw new Error(`Failed to find/create contact: ${error.message}`);
  }
  
  return data; // Returns contact ID
}

/**
 * Get client context for a contact
 */
export async function getClientContext(contactId: string): Promise<ClientContext | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('crm_client_context')
    .select('*')
    .eq('contact_id', contactId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching client context:', error);
    throw new Error(`Failed to fetch client context: ${error.message}`);
  }
  
  return data;
}

/**
 * Update client context for a contact
 */
export async function updateClientContext(
  contactId: string,
  contextData: Record<string, unknown>
): Promise<ClientContext> {
  const supabase = getSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('crm_client_context')
    .upsert({
      contact_id: contactId,
      user_id: user.id,
      context_json: contextData,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error updating client context:', error);
    throw new Error(`Failed to update client context: ${error.message}`);
  }
  
  return data;
}

/**
 * Get CRM statistics
 */
export async function getCrmStats(): Promise<CrmStats> {
  const supabase = getSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Get total contacts
  const { count: total_contacts } = await supabase
    .from('crm_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  
  // Get contacts by status
  const { data: statusData } = await supabase
    .from('crm_contacts')
    .select('relationship_status')
    .eq('user_id', user.id);
  
  const contacts_by_status = (statusData || []).reduce((acc, row) => {
    const status = row.relationship_status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get total emails
  const { count: emails_count } = await supabase
    .from('crm_emails')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  
  // Get recent interactions (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { count: recent_interactions } = await supabase
    .from('crm_emails')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('received_at', sevenDaysAgo.toISOString());
  
  return {
    total_contacts: total_contacts || 0,
    contacts_by_status: contacts_by_status as Record<string, number>,
    emails_count: emails_count || 0,
    recent_interactions: recent_interactions || 0,
  };
}

/**
 * Search contacts by email address
 */
export async function searchContactsByEmail(email: string): Promise<Contact[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('crm_contacts')
    .select('*')
    .or(`primary_email.eq.${email},emails.cs.{${email}}`);
  
  if (error) {
    console.error('Error searching contacts by email:', error);
    throw new Error(`Failed to search contacts: ${error.message}`);
  }
  
  return data || [];
}

