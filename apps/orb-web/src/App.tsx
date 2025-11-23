import { Route, Routes, Link, useLocation } from 'react-router-dom';

import OrbDashboard from './components/OrbDashboard';
import ContactsHome from './pages/contacts/ContactsHome';
import ContactDetail from './pages/contacts/ContactDetail';

const App = () => {
  const location = useLocation();
  const isContactsRoute = location.pathname.startsWith('/contacts');

  return (
    <main className="min-h-screen bg-bg-root text-text-primary">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-bg-surface/50">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
          <Link to="/" className="text-xl font-semibold">
            Orb
          </Link>
          <div className="flex gap-4">
            <Link
              to="/"
              className={`text-sm ${
                !isContactsRoute ? 'text-text-primary font-medium' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/contacts"
              className={`text-sm ${
                isContactsRoute ? 'text-text-primary font-medium' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Contacts
            </Link>
          </div>
        </div>
      </nav>

      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<OrbDashboard />} />
        
        {/* Contacts Routes */}
        <Route path="/contacts" element={<ContactsHome />} />
        <Route path="/contacts/:id" element={<ContactDetail />} />
      </Routes>
    </main>
  );
};

export default App;
