import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import type {
  AppearancePreferences,
  CornerRadiusPreference,
  DensityPreference,
  NotificationPreferences,
  ThemePreference,
} from '../../hooks/useUserPreferences';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { emailClient } from '../../lib/email';
import { initGmailAuth } from '../../lib/email/gmail';
import { connectICloudAccount } from '../../lib/email/icloud';

type SettingsTab = 'accounts' | 'integrations' | 'customization' | 'system' | 'privacy';

export default function SettingsHome() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('accounts');

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-text-muted">
          Configure your Orb experience and manage integrations
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`border-b-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'accounts'
              ? 'border-accent-orb text-accent-orb'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Account Connections
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`border-b-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'integrations'
              ? 'border-accent-orb text-accent-orb'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Integrations
        </button>
        <button
          onClick={() => setActiveTab('customization')}
          className={`border-b-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'customization'
              ? 'border-accent-luna text-accent-luna'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Customization
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`border-b-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'system'
              ? 'border-accent-orb text-accent-orb'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          System
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`border-b-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'privacy'
              ? 'border-accent-orb text-accent-orb'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Privacy & Security
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'accounts' && <AccountConnectionsTab />}
        {activeTab === 'integrations' && <IntegrationsTab />}
        {activeTab === 'customization' && <CustomizationTab />}
        {activeTab === 'system' && <SystemTab />}
        {activeTab === 'privacy' && <PrivacyTab />}
      </div>
    </div>
  );
}

function AccountConnectionsTab() {
  const [showICloudModal, setShowICloudModal] = useState(false);
  const [icloudEmail, setIcloudEmail] = useState('');
  const [icloudPassword, setIcloudPassword] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState(emailClient.getAllAccounts());

  const handleConnectGmail = async () => {
    try {
      setError(null);
      const authUrl = await initGmailAuth();
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate Gmail connection');
      console.error('Gmail auth error:', err);
    }
  };

  const handleConnectICloud = async () => {
    if (!icloudEmail || !icloudPassword) {
      setError('Please enter both email and app-specific password');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const account = await connectICloudAccount(icloudEmail, icloudPassword);
      emailClient.addAccount(account);
      setConnectedAccounts(emailClient.getAllAccounts());
      setShowICloudModal(false);
      setIcloudEmail('');
      setIcloudPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to iCloud');
      console.error('iCloud connect error:', err);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Email Accounts */}
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <h2 className="text-xl font-semibold">Email Accounts</h2>
        <p className="mt-2 text-sm text-text-muted">
          Connect your email accounts to manage communications in Orb
        </p>
        
        <div className="mt-6 space-y-3">
          {/* Gmail */}
          <div className="rounded-lg border border-white/10 bg-bg-root p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-sol/20 text-xl">
                  📧
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Gmail</h3>
                  <p className="text-sm text-text-muted">Google Workspace compatible</p>
                </div>
              </div>
              <button 
                onClick={handleConnectGmail}
                className="rounded-lg bg-accent-sol/20 px-4 py-2 text-sm font-medium text-accent-sol hover:bg-accent-sol/30"
              >
                Connect Gmail
              </button>
            </div>
            {connectedAccounts.some(a => a.provider === 'gmail') && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-green-400">
                  Connected: {connectedAccounts.find(a => a.provider === 'gmail')?.email}
                </span>
              </div>
            )}
          </div>

          {/* iCloud */}
          <div className="rounded-lg border border-white/10 bg-bg-root p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-te/20 text-xl">
                  ☁️
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">iCloud Mail</h3>
                  <p className="text-sm text-text-muted">Requires app-specific password</p>
                </div>
              </div>
              <button 
                onClick={() => setShowICloudModal(true)}
                className="rounded-lg bg-accent-te/20 px-4 py-2 text-sm font-medium text-accent-te hover:bg-accent-te/30"
              >
                Connect iCloud
              </button>
            </div>
            {connectedAccounts.some(a => a.provider === 'icloud') && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-green-400">
                  Connected: {connectedAccounts.find(a => a.provider === 'icloud')?.email}
                </span>
              </div>
            )}
          </div>

          {/* Outlook (Coming Soon) */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-bg-root p-4 opacity-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-xl">
                📮
              </div>
              <div>
                <h3 className="font-medium text-text-primary">Outlook</h3>
                <p className="text-sm text-text-muted">Coming soon</p>
              </div>
            </div>
            <button 
              disabled
              className="cursor-not-allowed rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-text-muted"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-text-muted">Connected Accounts</h3>
          {connectedAccounts.length === 0 ? (
            <div className="mt-3 text-sm text-text-muted">
              No accounts connected yet. Connect an account above to get started.
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {connectedAccounts.map(account => (
                <div 
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-bg-root p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${account.connected ? 'bg-green-400' : 'bg-red-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{account.email}</p>
                      <p className="text-xs text-text-muted">{account.provider}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      emailClient.removeAccount(account.id);
                      setConnectedAccounts(emailClient.getAllAccounts());
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* iCloud Modal */}
      {showICloudModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-md rounded-lg border border-white/10 bg-bg-surface p-6">
            <h2 className="text-xl font-semibold">Connect iCloud Mail</h2>
            <p className="mt-2 text-sm text-text-muted">
              You'll need an app-specific password. Generate one at{' '}
              <a 
                href="https://appleid.apple.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent-te hover:underline"
              >
                appleid.apple.com
              </a>
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm text-text-muted">iCloud Email</label>
                <input
                  type="email"
                  value={icloudEmail}
                  onChange={(e) => setIcloudEmail(e.target.value)}
                  placeholder="user@icloud.com"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-bg-root px-3 py-2 text-text-primary outline-none focus:border-accent-te"
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted">App-Specific Password</label>
                <input
                  type="password"
                  value={icloudPassword}
                  onChange={(e) => setIcloudPassword(e.target.value)}
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-bg-root px-3 py-2 text-text-primary outline-none focus:border-accent-te"
                />
                <p className="mt-1 text-xs text-text-muted">
                  NOT your regular iCloud password
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowICloudModal(false);
                  setError(null);
                  setIcloudEmail('');
                  setIcloudPassword('');
                }}
                className="flex-1 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-text-muted hover:bg-white/10"
                disabled={connecting}
              >
                Cancel
              </button>
              <button
                onClick={handleConnectICloud}
                disabled={connecting}
                className="flex-1 rounded-lg bg-accent-te/20 px-4 py-2 text-sm font-medium text-accent-te hover:bg-accent-te/30 disabled:opacity-50"
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messaging Accounts */}
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <h2 className="text-xl font-semibold">Messaging Accounts</h2>
        <p className="mt-2 text-sm text-text-muted">
          Connect messaging platforms for unified communications
        </p>
        
        <div className="mt-6 space-y-3">
          {/* SMS/iMessage */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-bg-root p-4 opacity-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 text-xl">
                💬
              </div>
              <div>
                <h3 className="font-medium text-text-primary">iMessage / SMS</h3>
                <p className="text-sm text-text-muted">Coming soon</p>
              </div>
            </div>
            <button 
              disabled
              className="cursor-not-allowed rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-text-muted"
            >
              Coming Soon
            </button>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-bg-root p-4 opacity-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-400/20 text-xl">
                📱
              </div>
              <div>
                <h3 className="font-medium text-text-primary">WhatsApp</h3>
                <p className="text-sm text-text-muted">Coming soon</p>
              </div>
            </div>
            <button 
              disabled
              className="cursor-not-allowed rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-text-muted"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <h2 className="text-xl font-semibold">Authentication</h2>
        <p className="mt-2 text-sm text-text-muted">
          Manage your Orb account and sign-in settings
        </p>
        
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-white/10 bg-bg-root p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary">Supabase Database</h3>
                <p className="text-sm text-text-muted">Backend for data storage</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                import.meta.env.VITE_SUPABASE_URL ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className={`text-sm ${
                import.meta.env.VITE_SUPABASE_URL ? 'text-green-400' : 'text-red-400'
              }`}>
                {import.meta.env.VITE_SUPABASE_URL ? 'Connected' : 'Not Configured'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationsTab() {
  return (
    <div className="space-y-6">
      {/* AI Services */}
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <h2 className="text-xl font-semibold">AI Services</h2>
        <p className="mt-2 text-sm text-text-muted">
          Configure AI integrations for Orb agents
        </p>
        
        <div className="mt-6 space-y-3">
          <div className="rounded-lg border border-white/10 bg-bg-root p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-xl">
                  🤖
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">OpenAI API</h3>
                  <p className="text-sm text-text-muted">GPT-4, embeddings, and more</p>
                </div>
              </div>
              <button className="rounded-lg bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-400 hover:bg-purple-500/30">
                Configure
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                import.meta.env.VITE_OPENAI_API_KEY ? 'bg-green-400' : 'bg-gray-400'
              }`} />
              <span className={`text-sm ${
                import.meta.env.VITE_OPENAI_API_KEY ? 'text-green-400' : 'text-text-muted'
              }`}>
                {import.meta.env.VITE_OPENAI_API_KEY ? 'API Key Configured' : 'Not configured'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <h2 className="text-xl font-semibold">Calendar Services</h2>
        <p className="mt-2 text-sm text-text-muted">
          Connect calendars for scheduling and event management
        </p>
        
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-bg-root p-4 opacity-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-xl">
                📅
              </div>
              <div>
                <h3 className="font-medium text-text-primary">Google Calendar</h3>
                <p className="text-sm text-text-muted">Coming soon</p>
              </div>
            </div>
            <button 
              disabled
              className="cursor-not-allowed rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-text-muted"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* File Storage */}
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <h2 className="text-xl font-semibold">File Storage</h2>
        <p className="mt-2 text-sm text-text-muted">
          Connect cloud storage for file management
        </p>
        
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-bg-root p-4 opacity-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20 text-xl">
                📁
              </div>
              <div>
                <h3 className="font-medium text-text-primary">Google Drive</h3>
                <p className="text-sm text-text-muted">Coming soon</p>
              </div>
            </div>
            <button 
              disabled
              className="cursor-not-allowed rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-text-muted"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemTab() {
  const systemTools = [
    {
      title: 'Database Viewer',
      description: 'View and browse Orb database tables',
      icon: '🗄️',
      path: '/settings/database',
      color: 'accent-orb',
    },
    {
      title: 'System Logs',
      description: 'View system activity and error logs',
      icon: '📋',
      path: '/settings/logs',
      color: 'accent-te',
      disabled: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* System Tools */}
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <h2 className="text-xl font-semibold">System Tools</h2>
        <p className="mt-2 text-sm text-text-muted">
          Administration and debugging tools
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {systemTools.map((tool) => (
            <Link
              key={tool.path}
              to={tool.disabled ? '#' : tool.path}
              className={`group rounded-lg border border-white/10 bg-bg-root p-4 transition-all ${
                tool.disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:border-white/20 hover:bg-bg-root/70'
              }`}
              onClick={(e) => tool.disabled && e.preventDefault()}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${tool.color}/20 text-xl`}
                >
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-text-primary">
                    {tool.title}
                    {tool.disabled && (
                      <span className="ml-2 text-xs font-normal text-text-muted">
                        (Coming Soon)
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">{tool.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* System Information */}
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <h2 className="text-xl font-semibold">System Information</h2>
        <p className="mt-2 text-sm text-text-muted">
          Current system status and configuration
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm text-text-muted">Version</p>
            <p className="mt-1 font-medium text-text-primary">0.1.0</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Environment</p>
            <p className="mt-1 font-medium text-text-primary">
              {import.meta.env.MODE}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Database</p>
            <p className="mt-1 font-medium text-text-primary">
              {import.meta.env.VITE_SUPABASE_URL ? 'Supabase Connected' : 'Not Configured'}
            </p>
          </div>
        </div>
      </div>

      {/* Modes & Personas */}
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <h2 className="text-xl font-semibold">Modes & Personas</h2>
        <p className="mt-2 text-sm text-text-muted">
          Configure operational modes and agent persona preferences
        </p>
        <div className="mt-4 text-sm text-text-muted">
          Coming soon: Configure how Orb agents behave and respond
        </div>
      </div>

      {/* Constraints */}
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <h2 className="text-xl font-semibold">Constraints & Guardrails</h2>
        <p className="mt-2 text-sm text-text-muted">
          Safety rules and boundaries managed by Luna
        </p>
        <div className="mt-4 text-sm text-text-muted">
          Coming soon: Configure safety constraints and operational boundaries
        </div>
      </div>
    </div>
  );
}

function PrivacyTab() {
  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <h2 className="text-xl font-semibold">Privacy Settings</h2>
        <p className="mt-2 text-sm text-text-muted">
          Control how your data is used and stored
        </p>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-text-primary">AI Data Processing</h3>
              <p className="text-sm text-text-muted">Allow AI agents to process your data</p>
            </div>
            <button className="rounded-lg bg-accent-orb/20 px-4 py-2 text-sm font-medium text-accent-orb">
              Enabled
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-text-primary">Analytics</h3>
              <p className="text-sm text-text-muted">Help improve Orb with anonymous usage data</p>
            </div>
            <button className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-text-muted">
              Disabled
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <h2 className="text-xl font-semibold">Data Management</h2>
        <p className="mt-2 text-sm text-text-muted">
          Export, backup, or delete your data
        </p>
        
        <div className="mt-6 space-y-3">
          <button className="w-full rounded-lg border border-white/10 bg-bg-root p-4 text-left hover:bg-bg-root/70">
            <h3 className="font-medium text-text-primary">Export Your Data</h3>
            <p className="text-sm text-text-muted">Download all your Orb data</p>
          </button>
          
          <button className="w-full rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-left hover:bg-red-500/20">
            <h3 className="font-medium text-red-400">Delete All Data</h3>
            <p className="text-sm text-red-400/70">Permanently remove all your data from Orb</p>
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <h2 className="text-xl font-semibold">Security</h2>
        <p className="mt-2 text-sm text-text-muted">
          Encryption and security settings
        </p>
        
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="font-medium text-text-primary">End-to-End Encryption</h3>
            <p className="text-sm text-text-muted">
              Your data is encrypted at rest using AES-256
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-text-primary">Row-Level Security</h3>
            <p className="text-sm text-text-muted">
              Database policies ensure you only access your own data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomizationTab() {
  const {
    preferences,
    effectiveAppearance,
    effectiveLayout,
    effectiveWidgets,
    notifications,
    deviceOverrideEnabled,
    deviceId,
    deviceLabel,
    availablePresets,
    activePresetId,
    isLoading,
    isSaving,
    error,
    saveError,
    authError,
    updateAppearance,
    updateNotifications,
    updateLayout,
    updateWidgets,
    toggleDeviceOverride,
    applyPreset,
    resetPreferences,
  } = useUserPreferences();

  const [localError, setLocalError] = useState<string | null>(null);
  const [scope, setScope] = useState<'global' | 'device'>(deviceOverrideEnabled ? 'device' : 'global');

  const themeOptions: Array<{ id: ThemePreference; label: string; description: string }> = [
    { id: 'default', label: 'Orb Default', description: 'Space-first palette with soft gradients' },
    { id: 'high-contrast', label: 'High Contrast', description: 'Pure black canvas and punchy neon text' },
    { id: 'neural-glass', label: 'Neural Glass', description: 'Frosted glass with pastel highlights' },
  ];

  const densityOptions: Array<{ id: DensityPreference; label: string; description: string }> = [
    { id: 'comfortable', label: 'Comfortable', description: 'Generous breathing room for deep focus' },
    { id: 'compact', label: 'Compact', description: 'Higher information density for dashboards' },
  ];

  const radiusOptions: Array<{ id: CornerRadiusPreference; label: string; description: string }> = [
    { id: 'large', label: 'Soft Radius', description: 'Rounded panels with pill buttons' },
    { id: 'small', label: 'Tight Radius', description: 'Sharper panels for grid-heavy layouts' },
  ];

  const widgetOptions = [
    { id: 'inbox', label: 'Inbox' },
    { id: 'finance', label: 'Finance' },
    { id: 'missions', label: 'Missions' },
    { id: 'insights', label: 'Insights' },
    { id: 'calendar', label: 'Calendar' },
  ];

  const quickLaunchOptions = [
    { id: 'compose', label: 'Compose Email' },
    { id: 'new-mission', label: 'New Mission' },
    { id: 'log-transaction', label: 'Log Transaction' },
  ];

  const statusError = error || saveError || authError || localError;
  const scopedAppearance = scope === 'device' ? effectiveAppearance : preferences.appearance;
  const scopedLayout = scope === 'device' ? effectiveLayout : preferences.layout;
  const scopedWidgets = scope === 'device' ? effectiveWidgets : preferences.widgets;

  useEffect(() => {
    if (!deviceOverrideEnabled && scope === 'device') {
      setScope('global');
    }
  }, [deviceOverrideEnabled, scope]);

  const handleReset = async () => {
    setLocalError(null);
    try {
      await resetPreferences();
      setScope('global');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to reset preferences');
    }
  };

  const handleOverrideToggle = async () => {
    setLocalError(null);
    try {
      await toggleDeviceOverride(!deviceOverrideEnabled);
      setScope(deviceOverrideEnabled ? 'global' : 'device');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to toggle override');
    }
  };

  const updateNotificationGroup = async (updates: Partial<NotificationPreferences>) => {
    setLocalError(null);
    try {
      await updateNotifications(updates);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to update notifications');
    }
  };

  const handleScopeChange = async (nextScope: 'global' | 'device') => {
    if (nextScope === 'device' && !deviceOverrideEnabled) {
      try {
        await toggleDeviceOverride(true);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Unable to enable device override');
        return;
      }
    }
    setScope(nextScope);
  };

  const handleAppearanceChange = async <T extends keyof AppearancePreferences>(
    field: T,
    value: AppearancePreferences[T],
  ) => {
    if (scopedAppearance[field] === value) {
      return;
    }
    setLocalError(null);
    try {
      await updateAppearance({ [field]: value } as Partial<AppearancePreferences>, { scope });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to update appearance');
    }
  };

  const handleLayoutChange = async <T extends keyof LayoutPreferences>(
    field: T,
    value: LayoutPreferences[T],
  ) => {
    if (scopedLayout[field] === value) {
      return;
    }
    setLocalError(null);
    try {
      await updateLayout({ [field]: value } as Partial<LayoutPreferences>, { scope });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to update layout');
    }
  };

  const togglePinnedWidget = async (widgetId: string) => {
    const pinned = new Set(scopedWidgets.pinned);
    if (pinned.has(widgetId)) {
      pinned.delete(widgetId);
    } else {
      pinned.add(widgetId);
    }
    setLocalError(null);
    try {
      await updateWidgets({ pinned: Array.from(pinned) }, { scope });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to update widgets');
    }
  };

  const toggleQuickLaunch = async (actionId: string) => {
    const quick = new Set(scopedWidgets.quickLaunch);
    if (quick.has(actionId)) {
      quick.delete(actionId);
    } else {
      quick.add(actionId);
    }
    setLocalError(null);
    try {
      await updateWidgets({ quickLaunch: Array.from(quick) }, { scope });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to update quick launch');
    }
  };

  const handlePresetApply = async (presetId: string) => {
    setLocalError(null);
    try {
      await applyPreset(presetId);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to apply preset');
    }
  };

  const toggleWeatherWidget = async () => {
    setLocalError(null);
    try {
      await updateWidgets({ showWeather: !scopedWidgets.showWeather }, { scope });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to update weather widget');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Interface Customization</h2>
            <p className="mt-1 text-sm text-text-muted">
              Personalize theme, notifications, layout, widgets, and per-device overrides.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                preferences.storageProvider === 'supabase'
                  ? 'bg-accent-luna/15 text-accent-luna'
                  : 'bg-yellow-500/10 text-yellow-300'
              }`}
            >
              {preferences.storageProvider === 'supabase' ? 'Synced via Supabase' : 'Stored Locally'}
            </span>
            {preferences.updatedAt && (
              <span className="text-xs text-text-muted">
                Updated {new Date(preferences.updatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-text-muted hover:text-text-primary disabled:opacity-50"
          >
            Reset to defaults
          </button>
          <button
            onClick={() => handleScopeChange(scope === 'global' ? 'device' : 'global')}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-text-muted hover:text-text-primary"
          >
            Scope: {scope === 'device' ? 'This device' : 'All devices'}
          </button>
          <button
            onClick={handleOverrideToggle}
            className={`rounded-lg px-4 py-2 text-sm ${
              deviceOverrideEnabled
                ? 'border border-accent-sol/50 text-accent-sol'
                : 'border border-white/10 text-text-muted hover:text-text-primary'
            }`}
          >
            {deviceOverrideEnabled ? 'Disable device override' : 'Enable device override'}
          </button>
          {isSaving && <span className="text-xs text-accent-orb">Saving…</span>}
        </div>
        {statusError && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {statusError}
          </div>
        )}
      </div>

      <section className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Presets</p>
            <h3 className="mt-2 font-semibold">Apply a bundle</h3>
          </div>
          {activePresetId && (
            <span className="rounded-full bg-accent-orb/15 px-3 py-1 text-xs text-accent-orb">
              Active: {activePresetId}
            </span>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {availablePresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetApply(preset.id)}
              className={`rounded-lg border px-4 py-3 text-left transition ${
                activePresetId === preset.id
                  ? 'border-accent-luna bg-accent-luna/10 text-text-primary'
                  : 'border-white/10 text-text-muted hover:text-text-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">{preset.label}</p>
                <span className="text-[10px] uppercase text-text-muted">{preset.scope}</span>
              </div>
              {preset.description && (
                <p className="mt-1 text-xs text-text-muted">{preset.description}</p>
              )}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Theme</p>
          <h3 className="mt-2 font-semibold">Color language</h3>
          <div className="mt-4 grid gap-3">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAppearanceChange('theme', option.id)}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                  scopedAppearance.theme === option.id
                    ? 'border-accent-luna text-text-primary'
                    : 'border-white/10 text-text-muted hover:text-text-primary'
                }`}
              >
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-xs text-text-muted">{option.description}</p>
                </div>
                {scopedAppearance.theme === option.id && <span className="text-accent-luna">●</span>}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Density</p>
          <h3 className="mt-2 font-semibold">Spacing rhythm</h3>
          <div className="mt-4 grid gap-3">
            {densityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAppearanceChange('density', option.id)}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                  scopedAppearance.density === option.id
                    ? 'border-accent-sol text-text-primary'
                    : 'border-white/10 text-text-muted hover:text-text-primary'
                }`}
              >
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-xs text-text-muted">{option.description}</p>
                </div>
                {scopedAppearance.density === option.id && <span className="text-accent-sol">●</span>}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Card Radius</p>
            <div className="mt-3 grid gap-3">
              {radiusOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAppearanceChange('cornerRadius', option.id)}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                    scopedAppearance.cornerRadius === option.id
                      ? 'border-accent-orb text-text-primary'
                      : 'border-white/10 text-text-muted hover:text-text-primary'
                  }`}
                >
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-text-muted">{option.description}</p>
                  </div>
                  {scopedAppearance.cornerRadius === option.id && <span className="text-accent-orb">●</span>}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Notifications</p>
        <h3 className="mt-2 font-semibold">Signal density</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <NotificationToggle
            label="Priority Inbox only"
            description="Only trigger alerts for critical senders"
            active={notifications.inboxPriorityOnly}
            onToggle={() =>
              updateNotificationGroup({ inboxPriorityOnly: !notifications.inboxPriorityOnly })
            }
          />
          <NotificationToggle
            label="Desktop Alerts"
            description="Show mission popovers on this browser"
            active={notifications.inboxDesktopAlerts}
            onToggle={() =>
              updateNotificationGroup({ inboxDesktopAlerts: !notifications.inboxDesktopAlerts })
            }
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="text-text-muted">Mission escalation</span>
          <div className="flex gap-2">
            {(['all', 'critical'] as const).map((level) => (
              <button
                key={level}
                onClick={() => updateNotificationGroup({ missionEscalations: level })}
                className={`rounded-full px-4 py-1 text-xs ${
                  notifications.missionEscalations === level
                    ? 'bg-accent-mav/20 text-accent-mav'
                    : 'bg-white/5 text-text-muted hover:text-text-primary'
                }`}
              >
                {level === 'all' ? 'All updates' : 'Critical only'}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <NotificationToggle
            label="Weekly Digest"
            description="Receive a summary with insights + finance snapshots"
            active={notifications.weeklyDigest}
            onToggle={() =>
              updateNotificationGroup({ weeklyDigest: !notifications.weeklyDigest })
            }
          />
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Layout</p>
        <h3 className="mt-2 font-semibold">Canvas behavior</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {(['windowed', 'stacked'] as const).map((style) => (
            <button
              key={style}
              onClick={() => handleLayoutChange('panelStyle', style)}
              className={`rounded-lg px-4 py-2 text-sm ${
                scopedLayout.panelStyle === style
                  ? 'bg-accent-forge/20 text-accent-forge'
                  : 'bg-white/5 text-text-muted hover:text-text-primary'
              }`}
            >
              {style === 'windowed' ? 'Windowed Panels' : 'Stacked Columns'}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <NotificationToggle
            label="Show Timeline"
            description="Display processing timeline across agents"
            active={scopedLayout.showTimeline}
            onToggle={() => handleLayoutChange('showTimeline', !scopedLayout.showTimeline)}
          />
          <NotificationToggle
            label="Agent Dock"
            description="Pin agent mini-panels on the right edge"
            active={scopedLayout.showAgentDock}
            onToggle={() => handleLayoutChange('showAgentDock', !scopedLayout.showAgentDock)}
          />
          <NotificationToggle
            label="Focus Mode"
            description="Hide non-essential chrome for deep work"
            active={scopedLayout.focusMode}
            onToggle={() => handleLayoutChange('focusMode', !scopedLayout.focusMode)}
          />
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Widgets & Quick Launch</p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold">Pinned widgets</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {widgetOptions.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => togglePinnedWidget(widget.id)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    scopedWidgets.pinned.includes(widget.id)
                      ? 'border-accent-orb/60 text-accent-orb'
                      : 'border-white/10 text-text-muted hover:text-text-primary'
                  }`}
                >
                  {widget.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Quick actions</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickLaunchOptions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => toggleQuickLaunch(action.id)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    scopedWidgets.quickLaunch.includes(action.id)
                      ? 'border-accent-sol/60 text-accent-sol'
                      : 'border-white/10 text-text-muted hover:text-text-primary'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
            <NotificationToggle
              label="Ambient Weather Widget"
              description="Show subtle weather + calendar cues"
              active={scopedWidgets.showWeather}
            onToggle={toggleWeatherWidget}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Device override</p>
            <h3 className="mt-2 font-semibold">{deviceLabel}</h3>
            <p className="text-xs text-text-muted">Device ID: {deviceId}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs ${
              deviceOverrideEnabled ? 'bg-accent-sol/15 text-accent-sol' : 'bg-white/5 text-text-muted'
            }`}
          >
            {deviceOverrideEnabled ? 'Override Active' : 'Inherits global defaults'}
          </span>
        </div>
      </section>

      <CustomizationPreview appearance={effectiveAppearance} isLoading={isLoading} />
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  active,
  onToggle,
}: {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex w-full items-start justify-between rounded-lg border px-4 py-3 text-left transition ${
        active ? 'border-accent-te/60 bg-accent-te/10 text-text-primary' : 'border-white/10 text-text-muted hover:text-text-primary'
      }`}
    >
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      <span className="text-xs font-semibold">{active ? 'ON' : 'OFF'}</span>
    </button>
  );
}

function CustomizationPreview({ appearance, isLoading }: { appearance: AppearancePreferences; isLoading: boolean }) {
  const spacing = appearance.density === 'compact' ? 'gap-3' : 'gap-5';
  const radius = appearance.cornerRadius === 'small' ? '1rem' : '1.8rem';
  return (
    <section className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Live Preview</p>
          <h3 className="mt-1 font-semibold">How your interface feels</h3>
        </div>
        <span className="text-xs text-text-muted">{isLoading ? 'Loading preferences…' : 'Synced'}</span>
      </div>
      <div className={`mt-6 grid ${spacing} md:grid-cols-2`}>
        <div
          className="border border-white/10 bg-bg-root/70 p-5 shadow-orb"
          style={{ borderRadius: radius }}
        >
          <p className="text-sm uppercase tracking-[0.4em] text-text-muted">Panel</p>
          <p className="mt-3 text-lg font-semibold">Mission Control</p>
          <p className="mt-2 text-sm text-text-muted">
            Theme <span className="font-medium text-text-primary">{appearance.theme}</span>
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-accent-sol transition-all"
              style={{ width: appearance.density === 'compact' ? '70%' : '50%' }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
            <span>Density · {appearance.density}</span>
            <span>Radius · {appearance.cornerRadius}</span>
          </div>
        </div>
        <div
          className="flex flex-col border border-white/10 bg-bg-root/40 p-5 backdrop-blur"
          style={{ borderRadius: radius }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Widgets</p>
          <div className="mt-4 flex flex-1 flex-col gap-3">
            <div className="rounded-lg border border-white/10 bg-bg-surface/80 p-4">
              <p className="text-sm font-semibold">Finance</p>
              <p className="text-xs text-text-muted">Compact transaction feed</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-bg-surface/60 p-4">
              <p className="text-sm font-semibold">Inbox</p>
              <p className="text-xs text-text-muted">Calm focus mode</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
