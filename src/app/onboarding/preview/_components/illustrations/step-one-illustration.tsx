import { Upload, Pencil } from "lucide-react";

export function StepOneIllustration() {
  return (
    <div className="relative h-65 w-80">
      {/* Background */}
      <div className="absolute inset-0 rounded-3xl bg-blue-50" />

      {/* Document icon */}
      <div className="absolute top-7.5 left-25 flex h-37.5 w-30 flex-col gap-2 rounded-xl bg-white p-4 shadow-md">
        <div className="h-2 w-full rounded bg-slate-300" />
        <div className="h-2 w-full rounded bg-slate-300" />
        <div className="h-2 w-15 rounded bg-slate-300" />
        <div className="h-2 w-full rounded bg-slate-200" />
        <div className="h-2 w-full rounded bg-slate-200" />
        <div className="h-2 w-10 rounded bg-slate-200" />
      </div>

      {/* Upload badge */}
      <div className="absolute top-20 left-15 flex h-14 w-14 items-center justify-center rounded-full bg-accent-brand">
        <Upload className="h-6 w-6 text-white" />
      </div>

      {/* Edit badge */}
      <div className="absolute top-39 left-49 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500">
        <Pencil className="h-5 w-5 text-white" />
      </div>
    </div>
  );
}
