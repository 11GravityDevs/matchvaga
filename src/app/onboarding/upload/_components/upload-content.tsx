"use client";

import { useCallback, useRef } from "react";

import { Check, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useResumeUpload } from "../_hooks/use-resume-upload";
import { formatFileSize } from "../_utils/file";
import { cn } from "@/utils/style";

export function UploadContent() {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    isUploading,
    uploadError,
    selectedFile,
    uploadFile,
    uploadFromPaste,
    analyze,
  } = useResumeUpload();

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile || isUploading) return;
    try {
      await analyze();
    } catch {
      // Error displayed via uploadError from mutation
    }
  }, [selectedFile, isUploading, analyze]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void uploadFile(file);
      }
      e.target.value = "";
    },
    [uploadFile]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const text = e.clipboardData.getData("text");
      if (text) {
        e.preventDefault();
        uploadFromPaste(text);
      }
    },
    [uploadFromPaste]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        void uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleBrowseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    inputRef.current?.click();
  }, []);

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
            "hover:border-accent-brand/50 hover:bg-muted/20"
          )}
          onPaste={handlePaste}
          onDrop={handleDrop}
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
                Suportamos PDF e DOCX
              </p>
              <p className="text-small text-muted-foreground">ou</p>
              <Button variant="secondary" size="lg" onClick={handleBrowseClick}>
                Selecionar arquivo
              </Button>
            </>
          )}
        </div>

        {uploadError && (
          <p className="text-sm text-destructive" role="alert">
            {uploadError}
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
