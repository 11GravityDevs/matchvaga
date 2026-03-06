import { Suspense } from "react";

import { ResumeContent } from "./_components/resume-content";
import { Loading } from "@/components/ui/loading";

export default function ResumePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResumeContent />
    </Suspense>
  );
}
