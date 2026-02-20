import { Suspense } from "react";

import { LoginContent } from "@/components/auth/login-content";
import { Loading } from "@/components/ui/loading";

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginContent />
    </Suspense>
  );
}
