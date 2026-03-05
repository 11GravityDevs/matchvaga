"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { extractResumeFromFile } from "@/lib/ai/clients/gemini";
import { logServerError } from "@/lib/logger";
import { resumeDataSchema } from "@/schemas/resume";
import type { ResumeData } from "@/types/resume";
import { translateAuthError } from "@/utils/auth";
import { DEFAULT_PHONE_DDI } from "@/constants/phone";
import { formatPhoneBr } from "@/utils/resume";

const ERROR_ALREADY_HAS_RESUME =
  "Você já possui um currículo cadastrado. Para alterar as informações, acesse a tela Meu currículo.";

const ERROR_INVALID_DATA = "Dados inválidos. Verifique os campos.";

function firstZodErrorMessage(error: {
  issues?: Array<{ message?: string }>;
}): string | undefined {
  const issues = error.issues ?? [];
  const msg = issues[0]?.message;
  return typeof msg === "string" && msg.length > 0 ? msg : undefined;
}

export interface CreateResumeWithDataResult {
  success: boolean;
  resumeId?: string;
  parsedData?: ResumeData;
  error?: string;
}

export async function createResumeWithData(
  data: ResumeData
): Promise<CreateResumeWithDataResult> {
  const parsed = resumeDataSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: firstZodErrorMessage(parsed.error) ?? ERROR_INVALID_DATA,
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

  const alreadyHasResume = await hasResume();
  if (alreadyHasResume) {
    return { success: false, error: ERROR_ALREADY_HAS_RESUME };
  }

  const { data: row, error: insertError } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      parsed_data: parsed.data as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (insertError) {
    logServerError({
      context: "db",
      operation: "createResumeWithData_insert",
      message: insertError.message,
    });
    return {
      success: false,
      error: "Erro ao salvar. Tente novamente.",
    };
  }

  const { error: creditsError } = await supabase
    .from("user_credits")
    .insert({ user_id: user.id, credits: 3 });

  if (creditsError) {
    logServerError({
      context: "db",
      operation: "createResumeWithData_user_credits",
      message: creditsError.message,
    });
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
    parsedData: parsed.data as ResumeData,
  };
}

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

  const alreadyHasResume = await hasResume();
  if (alreadyHasResume) {
    return { success: false, error: ERROR_ALREADY_HAS_RESUME };
  }

  const extraction = await extractResumeFromFile(file);
  if (!extraction.success) {
    logServerError({
      context: "server_action",
      operation: "uploadResume",
      action: "uploadResume",
      message: "Extração de currículo falhou.",
      errorMessage: extraction.error,
    });
    return { success: false, error: extraction.error };
  }

  const { data: parsedData } = extraction;
  const phoneDdi = parsedData.phoneDdi?.trim() || DEFAULT_PHONE_DDI;
  const dataToStore: ResumeData = {
    ...parsedData,
    phoneDdi,
    phone:
      phoneDdi === "+55"
        ? formatPhoneBr(parsedData.phone)
        : (parsedData.phone ?? ""),
  };

  const { data: row, error: insertError } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      parsed_data: dataToStore as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (insertError) {
    logServerError({
      context: "db",
      operation: "uploadResume_insert",
      message: insertError.message,
    });
    return {
      success: false,
      error: "Erro ao salvar. Tente novamente.",
    };
  }

  const { error: creditsError } = await supabase
    .from("user_credits")
    .insert({ user_id: user.id, credits: 3 });

  if (creditsError) {
    logServerError({
      context: "db",
      operation: "uploadResume_user_credits",
      message: creditsError.message,
    });
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
    parsedData: dataToStore,
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
      error: firstZodErrorMessage(parsed.error) ?? ERROR_INVALID_DATA,
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
    logServerError({
      context: "db",
      operation: "saveResumeData_update",
      message: updateError.message,
    });
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
    logServerError({
      context: "db",
      operation: "getResumeForUser_select",
      message: error?.message ?? "No row",
    });
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
