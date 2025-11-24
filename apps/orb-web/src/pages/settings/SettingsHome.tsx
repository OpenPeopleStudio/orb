import { useState } from 'react';
import { Link } from 'react-router-dom';

type SettingsTab = 'accounts' | 'integrations' | 'system' | 'privacy';

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
        {activeTab === 'system' && <SystemTab />}
        {activeTab === 'privacy' && <PrivacyTab />}
      </div>
    </div>
  );
}

function AccountConnectionsTab() {
  return (
    <div className="space-y-6">
      {/* Email Accounts */}
      <div className="rounded-lg border border-white/10 bg-bg-surface/50 p-6">
        <h2 className="text-xl font-semibold">Email Accounts</h2>
        <p className="mt-2 text-sm text-text-muted">
          Connect your email accounts to manage communications in Orb
        </p>
        
        <div className="mt-6 space-y-3">
          {/* Gmail */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-bg-root p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-sol/20 text-xl">
                📧
              </div>
              <div>
                <h3 className="font-medium text-text-primary">Gmail</h3>
                <p className="text-sm text-text-muted">Google Workspace compatible</p>
              </div>
            </div>
            <button className="rounded-lg bg-accent-sol/20 px-4 py-2 text-sm font-medium text-accent-sol hover:bg-accent-sol/30">
              Connect Gmail
            </button>
          </div>

          {/* iCloud */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-bg-root p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-te/20 text-xl">
                ☁️
              </div>
              <div>
                <h3 className="font-medium text-text-primary">iCloud Mail</h3>
                <p className="text-sm text-text-muted">Requires app-specific password</p>
              </div>
            </div>
            <button className="rounded-lg bg-accent-te/20 px-4 py-2 text-sm font-medium text-accent-te hover:bg-accent-te/30">
              Connect iCloud
            </button>
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
          <div className="mt-3 text-sm text-text-muted">
            No accounts connected yet. Connect an account above to get started.
          </div>
        </div>
      </div>

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
          <div>
            <label className="text-sm text-text-muted">Supabase Connection</label>
            <div className="mt-2 flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                import.meta.env.VITE_SUPABASE_URL ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className="text-sm text-text-primary">
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
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-bg-root p-4">
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
