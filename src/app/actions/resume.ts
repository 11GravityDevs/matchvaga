"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { extractResumeFromFile } from "@/lib/ai/clients/gemini";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { translateAuthError } from "@/utils/auth";

export interface UploadResumeResult {
  success: boolean;
  resumeId?: string;
  parsedData?: ResumeData;
  error?: string;
}

export async function uploadResume(
  formData: FormData
): Promise<UploadResumeResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "Nenhum arquivo enviado." };
  }

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

  const extraction = await extractResumeFromFile(file);
  if (!extraction.success) {
    return { success: false, error: extraction.error };
  }

  const { data: parsedData } = extraction;

  const { data: row, error: insertError } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      parsed_data: parsedData as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[uploadResume] insert error:", insertError.message);
    return {
      success: false,
      error: "Erro ao salvar. Tente novamente.",
    };
  }

  revalidatePath("/home");
  revalidatePath("/onboarding");

  return {
    success: true,
    resumeId: row.id,
    parsedData,
  };
}

export interface SaveResumeDataResult {
  success: boolean;
  error?: string;
}

export async function saveResumeData(
  resumeId: string,
  data: ResumeData
): Promise<SaveResumeDataResult> {
  const parsed = resumeDataSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos. Verifique os campos.",
    };
  }

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

  const { error: updateError } = await supabase
    .from("resumes")
    .update({
      parsed_data: parsed.data as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq("id", resumeId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("[saveResumeData] update error:", updateError.message);
    return {
      success: false,
      error: "Erro ao salvar. Tente novamente.",
    };
  }

  revalidatePath("/home");
  revalidatePath("/onboarding");

  return { success: true };
}

export interface GetResumeForUserResult {
  success: boolean;
  resumeId?: string;
  data?: ResumeData;
  error?: string;
}

export async function getResumeForUser(): Promise<GetResumeForUserResult> {
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

  const { data: row, error } = await supabase
    .from("resumes")
    .select("id, parsed_data")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (error || !row) {
    if (error?.code === "PGRST116") {
      return { success: true, resumeId: undefined, data: undefined };
    }

    console.error("[getResumeForUser] select error:", error?.message);
    return { success: false, error: "Erro ao carregar currículo." };
  }

  const parsed = resumeDataSchema.safeParse(row.parsed_data);
  if (!parsed.success) {
    return { success: false, error: "Dados do currículo inválidos." };
  }

  return {
    success: true,
    resumeId: row.id,
    data: parsed.data as ResumeData,
  };
}

export async function hasResume(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return false;
  }

  const { data, error } = await supabase
    .from("resumes")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (error) {
    return false;
  }

  return (data?.length ?? 0) > 0;
}
