import OrbDashboard from './components/OrbDashboard';

const App = () => {
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
        <OrbDashboard />
      </section>
    </main>
  );
};

export default App;
