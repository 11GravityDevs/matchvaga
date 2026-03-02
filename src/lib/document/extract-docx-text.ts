"use server";

import mammoth from "mammoth";

export async function extractTextFromDocx(
  buffer: Buffer | ArrayBuffer
): Promise<string> {
  const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  try {
    const result = await mammoth.extractRawText({ buffer: nodeBuffer });
    return result.value ?? "";
  } catch {
    throw new Error(
      "Arquivo DOCX inválido ou corrompido. Tente outro arquivo."
    );
  }
}
