import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { translateAuthError } from "@/utils/auth";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local"
    );
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from Server Component; ignore.
        }
      },
    },
  });
}

export type GetAuthenticatedUserSuccess = {
  success: true;
  user: User;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

export type GetAuthenticatedUserFailure = {
  success: false;
  error: string;
};

export type GetAuthenticatedUserResult =
  | GetAuthenticatedUserSuccess
  | GetAuthenticatedUserFailure;

export async function getAuthenticatedUser(): Promise<GetAuthenticatedUserResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return { success: false, error: translateAuthError(authError) };
  }
  if (!user) {
    return { success: false, error: "Faça login para continuar." };
  }
  return { success: true, user, supabase };
}
