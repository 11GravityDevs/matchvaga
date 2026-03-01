"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/utils/auth";

const displayDataSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().optional(),
});

export interface GetCurrentUserDisplayResult {
  success: boolean;
  fullName?: string;
  email?: string;
  credits?: number;
  error?: string;
}

export async function getCurrentUserDisplay(): Promise<GetCurrentUserDisplayResult> {
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

  const { data: creditsRow } = await supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", user.id)
    .maybeSingle();

  const credits = creditsRow?.credits ?? 0;

  const { data: row, error } = await supabase
    .from("resumes")
    .select("parsed_data")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (error || !row) {
    if (error?.code === "PGRST116") {
      return { success: true, fullName: undefined, email: undefined, credits };
    }

    console.error("[getCurrentUserDisplay] select error:", error?.message);
    return { success: false, error: "Erro ao carregar dados do usuário." };
  }

  const parsed = displayDataSchema.safeParse(row.parsed_data);

  if (!parsed.success) {
    return { success: true, fullName: undefined, email: undefined, credits };
  }

  return {
    success: true,
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    credits,
  };
}
