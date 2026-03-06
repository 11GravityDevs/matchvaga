import { Suspense } from "react";
import { headers } from "next/headers";

import { LoginContent } from "./_components/login-content";
import { Loading } from "@/components/ui/loading";
import { isMobileUserAgent } from "./_utils/is-mobile-user-agent";
import { LoginMobileInfo } from "./_components/login-mobile-info";

export default async function LoginPage() {
  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent");
  const isMobile = isMobileUserAgent(userAgent);

  return (
    <Suspense fallback={<Loading />}>
      {isMobile ? <LoginMobileInfo /> : <LoginContent />}
    </Suspense>
  );
}
