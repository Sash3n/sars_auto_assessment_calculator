import { Dashboard } from "@/components/assessment/Dashboard";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-base-200">
      <header className="navbar bg-base-100 shadow-sm px-6">
        <div className="flex-1">
          <span className="text-lg font-semibold tracking-tight">
            SARS Auto-Assessment Calculator
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-semibold text-base-content">
          Check your assessment before SARS does
        </h1>

        <Dashboard />
      </main>

      <footer className="footer footer-center bg-base-100 p-4 text-xs text-base-content/60">
        <p>Not tax advice. Not affiliated with or endorsed by SARS.</p>
      </footer>
    </div>
  );
}
