/**
 * Supabase client with secret key. Bypasses RLS.
 * Use only in server-side code that must act without a user session (e.g. webhooks).
 * Never expose or use in client code.
 */
import { createClient } from "@supabase/supabase-js";

export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl?.trim()) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not set. Required for secret-key client."
    );
  }

  if (!secretKey?.trim()) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not set. Required for webhook and other server-only operations that bypass RLS."
    );
  }

  return createClient(supabaseUrl, secretKey);
}
