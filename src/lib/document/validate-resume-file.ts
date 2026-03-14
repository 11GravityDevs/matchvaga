const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const PDF_MAGIC_SEARCH_LENGTH = 1024;

export const MIME_PDF = "application/pdf";
export const MIME_DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const ALLOWED_MIME_TYPES = [MIME_PDF, MIME_DOCX] as const;
export type ResumeFileMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const ERROR_FILE_TOO_LARGE = "Arquivo muito grande. Máximo 5 MB.";
const ERROR_UNSUPPORTED_TYPE = "Formato não suportado. Use PDF ou DOCX.";
const ERROR_NOT_PDF = "Formato inválido. O arquivo não é um PDF autêntico.";
const ERROR_NOT_DOCX =
  "Formato inválido. O arquivo não é um documento DOCX autêntico.";

const PDF_MAGIC = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
const ZIP_MAGIC = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);

function bufferStartsWithAt(
  buffer: ArrayBuffer,
  prefix: Uint8Array,
  offset: number
): boolean {
  const bytes = new Uint8Array(buffer);
  if (offset + prefix.length > bytes.length) return false;
  return prefix.every((byte, i) => bytes[offset + i] === byte);
}

function findMagicInBuffer(
  buffer: ArrayBuffer,
  magic: Uint8Array,
  maxOffset: number
): boolean {
  const bytes = new Uint8Array(buffer);
  const limit = Math.min(bytes.length - magic.length, maxOffset);
  for (let i = 0; i <= limit; i++) {
    if (bufferStartsWithAt(buffer, magic, i)) return true;
  }
  return false;
}

const MAGIC_CHECKS: Record<
  ResumeFileMimeType,
  { magic: Uint8Array; atStart: boolean; error: string }
> = {
  [MIME_PDF]: {
    magic: PDF_MAGIC,
    atStart: false,
    error: ERROR_NOT_PDF,
  },
  [MIME_DOCX]: {
    magic: ZIP_MAGIC,
    atStart: true,
    error: ERROR_NOT_DOCX,
  },
};

function isAllowedMime(value: string): value is ResumeFileMimeType {
  return ALLOWED_MIME_TYPES.includes(value as ResumeFileMimeType);
}

function validateMagic(
  arrayBuffer: ArrayBuffer,
  mimeType: ResumeFileMimeType
): string | null {
  const { magic, atStart, error } = MAGIC_CHECKS[mimeType];
  const matches = atStart
    ? bufferStartsWithAt(arrayBuffer, magic, 0)
    : findMagicInBuffer(arrayBuffer, magic, PDF_MAGIC_SEARCH_LENGTH);
  return matches ? null : error;
}

export type ValidateResumeFileSuccess = {
  valid: true;
  arrayBuffer: ArrayBuffer;
  mimeType: ResumeFileMimeType;
};

export type ValidateResumeFileFailure = {
  valid: false;
  error: string;
};

export type ValidateResumeFileResult =
  | ValidateResumeFileSuccess
  | ValidateResumeFileFailure;

export async function validateResumeFile(
  file: File
): Promise<ValidateResumeFileResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: ERROR_FILE_TOO_LARGE };
  }

  const mimeType = file.type;
  if (!isAllowedMime(mimeType)) {
    return { valid: false, error: ERROR_UNSUPPORTED_TYPE };
  }

  const arrayBuffer = await file.arrayBuffer();
  const magicError = validateMagic(arrayBuffer, mimeType);

  if (magicError) {
    return { valid: false, error: magicError };
  }

  return {
    valid: true,
    arrayBuffer,
    mimeType,
  };
}
