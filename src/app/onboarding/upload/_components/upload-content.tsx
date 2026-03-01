"use client";

import { useRef, useState } from "react";

import { Check, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useResumeUpload } from "../_hooks/use-resume-upload";
import {
  formatFileSize,
  isFileWithinSizeLimit,
  MAX_FILE_SIZE_BYTES,
} from "../_utils/file";
import { cn } from "@/utils/style";

export function UploadContent() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const {
    isUploading,
    uploadError,
    selectedFile,
    uploadFile,
    uploadFromPaste,
    analyze,
  } = useResumeUpload();

  async function handleAnalyze() {
    if (!selectedFile || isUploading) return;
    try {
      await analyze();
    } catch {
      // Error displayed via uploadError from mutation
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!isFileWithinSizeLimit(file)) {
      setFileSizeError(
        `Arquivo muito grande. Máximo: ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`
      );
      return;
    }
    setFileSizeError(null);
    void uploadFile(file);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const text = e.clipboardData.getData("text");
    if (text) {
      e.preventDefault();
      setFileSizeError(null);
      uploadFromPaste(text);
    }
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const { currentTarget, relatedTarget } = e;
    if (relatedTarget && currentTarget.contains(relatedTarget as Node)) {
      return;
    }
    setIsDraggingOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!isFileWithinSizeLimit(file)) {
      setFileSizeError(
        `Arquivo muito grande. Máximo: ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`
      );
      return;
    }
    setFileSizeError(null);
    void uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleBrowseClick(e: React.MouseEvent) {
    e.stopPropagation();
    inputRef.current?.click();
  }

  return (
    <main className="w-form rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-1 px-7 pt-7">
        <h2 className="text-card-title">Upload do Curriculo</h2>
        <p className="text-card-description">
          Envie seu curriculo para começar
        </p>
      </div>

      <div className="flex flex-col gap-6 p-7">
        <div
          className={cn(
            "flex min-h-80 cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-card transition-colors",
            "hover:border-accent-brand/50 hover:bg-muted/20",
            isDraggingOver && "border-accent-brand bg-muted/20"
          )}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          tabIndex={0}
          role="button"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Selecionar arquivo do curriculo"
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            {isUploading ? (
              <Loader2 className="h-7 w-7 animate-spin text-accent-brand" />
            ) : selectedFile ? (
              <Check className="h-7 w-7 text-accent-success" />
            ) : (
              <Upload className="h-7 w-7 text-muted-foreground" />
            )}
          </div>
          {selectedFile && !isUploading ? (
            <>
              <p className="text-center text-lg font-semibold text-foreground">
                {selectedFile.name}
              </p>
              <p className="text-center text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
              <button
                type="button"
                onClick={handleBrowseClick}
                className="cursor-pointer rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Selecionar outro arquivo
              </button>
            </>
          ) : (
            <>
              <p className="text-center text-lg font-semibold text-foreground">
                Arraste seu curriculo aqui
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Suportamos PDF e DOCX (Máx.{" "}
                {formatFileSize(MAX_FILE_SIZE_BYTES)})
              </p>
              <p className="text-small text-muted-foreground">ou</p>
              <Button variant="secondary" size="lg" onClick={handleBrowseClick}>
                Selecionar arquivo
              </Button>
            </>
          )}
        </div>

        {(fileSizeError || uploadError) && (
          <p className="text-sm text-destructive" role="alert">
            {fileSizeError ?? uploadError}
          </p>
        )}
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={!selectedFile || isUploading}
            variant="brand"
            size="brand"
            className="rounded-lg"
          >
            Continuar
          </Button>
        </div>
      </div>
    </main>
  );
}
