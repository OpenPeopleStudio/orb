import { useState } from 'react';
import OrbDashboard from './components/OrbDashboard';
import OrbConsole from './components/OrbConsole';
import PreferencesView from './components/PreferencesView';

type ViewMode = 'dashboard' | 'console' | 'preferences';

const App = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('console');

  return (
    <main className="min-h-screen bg-bg-root text-text-primary">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-text-muted">Orb System</p>
          <h1 className="text-4xl font-semibold lg:text-5xl">Mission Interface</h1>
          <p className="max-w-3xl text-lg text-text-muted">
            A minimal runtime that keeps Orb, Sol, Te, Mav, Luna, and Forge aligned around a single
            mission context.
          </p>
        </header>
        
        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('console')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              viewMode === 'console'
                ? 'bg-accent-orb text-white'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            Console
          </button>
          <button
            onClick={() => setViewMode('dashboard')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              viewMode === 'dashboard'
                ? 'bg-accent-orb text-white'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setViewMode('preferences')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              viewMode === 'preferences'
                ? 'bg-accent-orb text-white'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            Preferences
          </button>
        </div>

        {/* View Content */}
        {viewMode === 'console' && <OrbConsole />}
        {viewMode === 'dashboard' && <OrbDashboard />}
        {viewMode === 'preferences' && <PreferencesView />}
      </section>
    </main>
  );
};

export default App;
