import { NextResponse } from "next/server";

import {
  ROUTE_HOME_DASHBOARD,
  ROUTE_LOGIN,
  ROUTE_ONBOARDING_UPLOAD,
} from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? ROUTE_ONBOARDING_UPLOAD;

  if (!next.startsWith("/")) {
    next = ROUTE_ONBOARDING_UPLOAD;
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: resumeRows } = await supabase
          .from("resumes")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if ((resumeRows?.length ?? 0) > 0) {
          next = ROUTE_HOME_DASHBOARD;
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}${ROUTE_LOGIN}?error=auth`);
}
