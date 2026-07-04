import { Suspense } from "react";
import { AssessmentWizard } from "@/components/assessment/AssessmentWizard";

export default function AssessPage() {
  return (
    <Suspense fallback={null}>
      <AssessmentWizard />
    </Suspense>
  );
}
