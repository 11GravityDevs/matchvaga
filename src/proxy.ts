import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  ROUTE_AUTH_CALLBACK,
  ROUTE_HOME,
  ROUTE_HOME_RESUME,
  ROUTE_LOGIN,
  ROUTE_ONBOARDING,
  ROUTE_ONBOARDING_PREVIEW,
  ROUTE_ONBOARDING_UPLOAD,
} from "@/constants/routes";

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

  // TODO(lancamento): remover bloqueio de login/home/onboarding usado apenas na fase de divulgação da landing
  const isLocalhost =
    request.nextUrl.hostname === "localhost" ||
    request.nextUrl.hostname === "127.0.0.1";

  if (!isLocalhost && isLandingOnlyPhasePath(request.nextUrl.pathname)) {
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
    const url = request.nextUrl.clone();
    url.pathname = ROUTE_ONBOARDING_PREVIEW;
    return NextResponse.redirect(url);
  }

  if (user && isProtectedPath(request.nextUrl.pathname)) {
    const userId = user.sub as string;
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    const userHasResume = !error && (resumes?.length ?? 0) > 0;
    const pathname = request.nextUrl.pathname;

    if (pathname === ROUTE_ONBOARDING_UPLOAD && userHasResume) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTE_HOME_RESUME;
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith(ROUTE_HOME) && !userHasResume) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTE_ONBOARDING_UPLOAD;
      return NextResponse.redirect(url);
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
