/**
 * Email Library
 * 
 * Unified email client for Gmail and iCloud Mail
 */

export * from './types';
export * from './gmail';
export * from './icloud';

import type { Email, EmailAccount, EmailFilter, EmailSearchResult, EmailSendRequest } from './types';
import { fetchGmailEmails, sendGmailEmail } from './gmail';
import { fetchICloudEmails, sendICloudEmail } from './icloud';

/**
 * Unified email client that works across Gmail and iCloud
 */
export class EmailClient {
  private accounts: Map<string, EmailAccount> = new Map();

  addAccount(account: EmailAccount) {
    this.accounts.set(account.id, account);
  }

  removeAccount(accountId: string) {
    this.accounts.delete(accountId);
  }

  getAccount(accountId: string): EmailAccount | undefined {
    return this.accounts.get(accountId);
  }

  getAllAccounts(): EmailAccount[] {
    return Array.from(this.accounts.values());
  }

  async fetchEmails(filter: EmailFilter = {}): Promise<EmailSearchResult> {
    const accountId = filter.accountId;
    
    if (accountId) {
      const account = this.getAccount(accountId);
      if (!account) {
        throw new Error(`Account ${accountId} not found`);
      }
      return this.fetchAccountEmails(account, filter);
    }
    
    // Fetch from all accounts and merge
    const results = await Promise.all(
      this.getAllAccounts().map(account => this.fetchAccountEmails(account, filter))
    );
    
    const allEmails = results.flatMap(r => r.emails);
    const allThreads = results.flatMap(r => r.threads);
    
    // Sort by date descending
    allEmails.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return {
      emails: allEmails.slice(0, filter.limit || 50),
      threads: allThreads,
      total: results.reduce((sum, r) => sum + r.total, 0),
      hasMore: results.some(r => r.hasMore),
    };
  }

  private async fetchAccountEmails(
    account: EmailAccount,
    filter: EmailFilter
  ): Promise<EmailSearchResult> {
    if (account.provider === 'gmail') {
      return fetchGmailEmails(account, filter);
    } else if (account.provider === 'icloud') {
      return fetchICloudEmails(account, filter);
    }
    throw new Error(`Unsupported provider: ${account.provider}`);
  }

  async sendEmail(request: EmailSendRequest): Promise<Email> {
    const account = this.getAccount(request.accountId);
    
    if (!account) {
      throw new Error(`Account ${request.accountId} not found`);
    }
    
    if (account.provider === 'gmail') {
      return sendGmailEmail(account, request);
    } else if (account.provider === 'icloud') {
      return sendICloudEmail(account, request);
    }
    
    throw new Error(`Unsupported provider: ${account.provider}`);
  }
}

// Singleton instance
export const emailClient = new EmailClient();

