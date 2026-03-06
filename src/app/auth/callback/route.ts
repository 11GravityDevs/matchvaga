import { NextResponse } from "next/server";

import {
  ROUTE_HOME_DASHBOARD,
  ROUTE_LOGIN,
  ROUTE_ONBOARDING_UPLOAD,
} from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";
import { RESUME_STATUS_COOKIE_NAME } from "@/utils/resume-status-cookie";

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

      let userHasResume = false;

      if (user) {
        const { data: resumeRows } = await supabase
          .from("resumes")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        userHasResume = (resumeRows?.length ?? 0) > 0;

        if (userHasResume) {
          next = ROUTE_HOME_DASHBOARD;
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      const redirectUrl = isLocalEnv
        ? `${origin}${next}`
        : forwardedHost
          ? `https://${forwardedHost}${next}`
          : `${origin}${next}`;

      const response = NextResponse.redirect(redirectUrl);

      response.cookies.delete(RESUME_STATUS_COOKIE_NAME);

      return response;
    }
  }

  return NextResponse.redirect(`${origin}${ROUTE_LOGIN}?error=auth`);
}
