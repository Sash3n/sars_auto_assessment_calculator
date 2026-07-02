import Link from "next/link";
import { AssessmentWizard } from "@/components/assessment/AssessmentWizard";

export default function AssessPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-base-200">
      <header className="navbar bg-base-100 shadow-sm px-6">
        <div className="flex-1">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            SARS Auto-Assessment Calculator
          </Link>
        </div>
      </header>
      <AssessmentWizard />
      <footer className="footer footer-center bg-base-100 p-4 text-xs text-base-content/60">
        <p>Not tax advice. Not affiliated with or endorsed by SARS.</p>
      </footer>
    </div>
  );
}
