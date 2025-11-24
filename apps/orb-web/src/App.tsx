import { Route, Routes, Link, useLocation } from 'react-router-dom';

import OrbDashboard from './components/OrbDashboard';
import ContactDetail from './pages/contacts/ContactDetail';
import ContactsHome from './pages/contacts/ContactsHome';
import EmailsHome from './pages/emails/EmailsHome';
import EmailDetail from './pages/emails/EmailDetail';
import MessagesHome from './pages/messages/MessagesHome';
import CalendarHome from './pages/calendar/CalendarHome';
import TasksHome from './pages/tasks/TasksHome';
import FilesHome from './pages/files/FilesHome';
import SettingsHome from './pages/settings/SettingsHome';

const App = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', exact: true },
    { path: '/emails', label: 'Emails' },
    { path: '/messages', label: 'Messages' },
    { path: '/contacts', label: 'Contacts' },
    { path: '/calendar', label: 'Calendar' },
    { path: '/tasks', label: 'Tasks' },
    { path: '/files', label: 'Files' },
    { path: '/settings', label: 'Settings' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <main className="min-h-screen bg-bg-root text-text-primary">
      {/* Navigation */}
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
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<OrbDashboard />} />
        
        {/* Emails */}
        <Route path="/emails" element={<EmailsHome />} />
        <Route path="/emails/:id" element={<EmailDetail />} />
        
        {/* Messages */}
        <Route path="/messages" element={<MessagesHome />} />
        
        {/* Contacts */}
        <Route path="/contacts" element={<ContactsHome />} />
        <Route path="/contacts/:id" element={<ContactDetail />} />
        
        {/* Calendar */}
        <Route path="/calendar" element={<CalendarHome />} />
        
        {/* Tasks */}
        <Route path="/tasks" element={<TasksHome />} />
        
        {/* Files */}
        <Route path="/files" element={<FilesHome />} />
        
        {/* Settings */}
        <Route path="/settings" element={<SettingsHome />} />
      </Routes>
    </main>
  );
};

export default App;
