import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  ROUTE_AUTH_CALLBACK,
  ROUTE_HOME,
  ROUTE_HOME_DASHBOARD,
  ROUTE_HOME_RESUME,
  ROUTE_LOGIN,
  ROUTE_ONBOARDING,
  ROUTE_ONBOARDING_UPLOAD,
  ROUTE_ONBOARDING_VERIFY,
} from "@/constants/routes";
import {
  RESUME_STATUS_COOKIE_NAME,
  RESUME_STATUS_COOKIE_OPTIONS,
  computeResumeStatusFromRow,
  isResumeStatus,
  type ResumeStatus,
} from "@/utils/resume-status-cookie";

const PROTECTED_PATH_PREFIXES = [ROUTE_HOME, ROUTE_ONBOARDING];
const GUEST_ONLY_PATH_PREFIXES = [ROUTE_LOGIN];
// TODO(lancamento): remover LANDING_ONLY_PREFIXES e voltar a permitir acesso às rotas autenticadas
const LANDING_ONLY_PREFIXES = [ROUTE_HOME, ROUTE_ONBOARDING, ROUTE_LOGIN];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isGuestOnlyPath(pathname: string): boolean {
  if (pathname.startsWith(ROUTE_AUTH_CALLBACK)) {
    return false;
  }

  return GUEST_ONLY_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isLandingOnlyPhasePath(pathname: string): boolean {
  return LANDING_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (isLandingOnlyPhasePath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTE_LOGIN;
    return NextResponse.redirect(url);
  }

  if (user && isGuestOnlyPath(request.nextUrl.pathname)) {
    const userId = user.sub as string;
    const cookieValue = request.cookies.get(RESUME_STATUS_COOKIE_NAME)?.value;
    let status: ResumeStatus;

    if (isResumeStatus(cookieValue)) {
      status = cookieValue;
    } else {
      const { data: resumeRow, error } = await supabase
        .from("resumes")
        .select("id, parsed_data")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      status = computeResumeStatusFromRow(error ? null : (resumeRow ?? null));
    }

    const url = request.nextUrl.clone();

    if (status === "none") {
      url.pathname = ROUTE_ONBOARDING_UPLOAD;
    } else if (status === "incomplete") {
      url.pathname = ROUTE_ONBOARDING_VERIFY;
    } else {
      url.pathname = ROUTE_HOME_DASHBOARD;
    }

    return NextResponse.redirect(url);
  }

  if (user && isProtectedPath(request.nextUrl.pathname)) {
    const userId = user.sub as string;
    const pathname = request.nextUrl.pathname;

    const cookieValue = request.cookies.get(RESUME_STATUS_COOKIE_NAME)?.value;
    let status: ResumeStatus;

    if (isResumeStatus(cookieValue)) {
      status = cookieValue;
    } else {
      const { data: resumeRow, error } = await supabase
        .from("resumes")
        .select("id, parsed_data")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      status = computeResumeStatusFromRow(error ? null : (resumeRow ?? null));
    }

    function setResumeStatusCookieOnResponse(response: NextResponse): void {
      response.cookies.set(
        RESUME_STATUS_COOKIE_NAME,
        status,
        RESUME_STATUS_COOKIE_OPTIONS
      );
    }

    if (pathname === ROUTE_ONBOARDING_UPLOAD && status !== "none") {
      const url = request.nextUrl.clone();
      url.pathname = ROUTE_HOME_RESUME;
      const response = NextResponse.redirect(url);

      if (!isResumeStatus(cookieValue)) {
        setResumeStatusCookieOnResponse(response);
      }

      return response;
    }

    if (pathname.startsWith(ROUTE_HOME) && status === "none") {
      const url = request.nextUrl.clone();
      url.pathname = ROUTE_ONBOARDING_UPLOAD;
      const response = NextResponse.redirect(url);

      if (!isResumeStatus(cookieValue)) {
        setResumeStatusCookieOnResponse(response);
      }

      return response;
    }

    if (pathname.startsWith(ROUTE_HOME) && status === "incomplete") {
      const url = request.nextUrl.clone();
      url.pathname = ROUTE_ONBOARDING_VERIFY;
      const response = NextResponse.redirect(url);

      if (!isResumeStatus(cookieValue)) {
        setResumeStatusCookieOnResponse(response);
      }

      return response;
    }

    if (!isResumeStatus(cookieValue)) {
      setResumeStatusCookieOnResponse(supabaseResponse);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - static assets (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
