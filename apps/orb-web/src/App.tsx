import { useEffect } from 'react';
import { Route, Routes, Link, Outlet, useLocation } from 'react-router-dom';

import OrbDashboard from './components/OrbDashboard';
import { FinanceProvider } from './contexts/FinanceContext';
import { InboxProvider } from './contexts/InboxContext';
import { ToastProvider } from './contexts/ToastContext';
import FrontDoorPage from './frontdoor/FrontDoorPage';
import { useUserPreferences, applyAppearanceToDocument } from './hooks/useUserPreferences';
import DatabaseViewer from './pages/admin/DatabaseViewer';
import GmailCallback from './pages/auth/GmailCallback';
import CalendarHome from './pages/calendar/CalendarHome';
import ContactDetail from './pages/contacts/ContactDetail';
import ContactsHome from './pages/contacts/ContactsHome';
import EmailDetail from './pages/emails/EmailDetail';
import EmailsHome from './pages/emails/EmailsHome';
import FilesHome from './pages/files/FilesHome';
import AccountsPage from './pages/finance/AccountsPage';
import FinanceHome from './pages/finance/FinanceHome';
import InboxHome from './pages/inbox/InboxHome';
import MessagesHome from './pages/messages/MessagesHome';
import SettingsHome from './pages/settings/SettingsHome';
import TasksHome from './pages/tasks/TasksHome';

const navItems: Array<{ path: string; label: string; exact?: boolean; highlight?: boolean }> = [
  { path: '/', label: 'Dashboard', exact: true },
  { path: '/inbox', label: '📥 Inbox', highlight: true },
  { path: '/finance', label: '💰 Finance' },
  { path: '/emails', label: 'Emails' },
  { path: '/messages', label: 'Messages' },
  { path: '/contacts', label: 'Contacts' },
  { path: '/calendar', label: 'Calendar' },
  { path: '/tasks', label: 'Tasks' },
  { path: '/files', label: 'Files' },
  { path: '/settings', label: '⚙️ Settings' },
];

const AppChrome = () => {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <main className="min-h-screen bg-bg-root text-text-primary transition-[font-size] duration-200">
      <nav className="border-b border-white/10 bg-bg-surface/50">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
          <Link to="/" className="text-xl font-semibold">
            Orb
          </Link>
          <div className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm ${
                  isActive(item.path, item.exact)
                    ? 'text-text-primary font-medium'
                    : item.highlight
                    ? 'text-accent-orb hover:text-accent-orb/80 font-medium'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <Outlet />
    </main>
  );
};

const App = () => {
  const { effectiveAppearance } = useUserPreferences();

  useEffect(() => {
    applyAppearanceToDocument(effectiveAppearance);
  }, [effectiveAppearance]);

  return (
    <ToastProvider>
      <FinanceProvider>
        <InboxProvider>
          <Routes>
            <Route path="/frontdoor" element={<FrontDoorPage />} />
            <Route element={<AppChrome />}>
              <Route index element={<OrbDashboard />} />
              <Route path="auth/gmail/callback" element={<GmailCallback />} />
              <Route path="inbox" element={<InboxHome />} />
              <Route path="emails" element={<EmailsHome />} />
              <Route path="emails/:id" element={<EmailDetail />} />
              <Route path="messages" element={<MessagesHome />} />
              <Route path="contacts" element={<ContactsHome />} />
              <Route path="contacts/:id" element={<ContactDetail />} />
              <Route path="calendar" element={<CalendarHome />} />
              <Route path="tasks" element={<TasksHome />} />
              <Route path="files" element={<FilesHome />} />
              <Route path="finance" element={<FinanceHome />} />
              <Route path="finance/accounts" element={<AccountsPage />} />
              <Route path="settings" element={<SettingsHome />} />
              <Route path="settings/database" element={<DatabaseViewer />} />
            </Route>
          </Routes>
        </InboxProvider>
      </FinanceProvider>
    </ToastProvider>
  );
};

export default App;
