import { Check, MousePointer } from "lucide-react";

import { cn } from "@/utils/style";

function SkillTagChecked({
  label,
  variant,
}: {
  label: string;
  variant: "blue" | "green";
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-full px-2.5 py-1",
        variant === "blue"
          ? "bg-blue-100 text-blue-600"
          : "bg-green-100 text-emerald-600"
      )}
    >
      <Check
        className={cn(
          "h-2.5 w-2.5",
          variant === "blue" ? "text-blue-600" : "text-emerald-600"
        )}
      />
      <span className="text-[10px] font-medium">{label}</span>
    </span>
  );
}

function SkillTagUnchecked({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500">
      {label}
    </span>
  );
}

export function StepThreeIllustration() {
  return (
    <div className="relative h-65 w-85">
      {/* Background */}
      <div className="absolute inset-0 rounded-3xl bg-orange-50" />

      {/* Skills card */}
      <div className="absolute top-7.5 left-12.5 flex h-45 w-60 flex-col gap-2.5 rounded-xl bg-white p-4 shadow-md">
        <span className="text-[11px] font-semibold text-slate-500">
          Habilidades Sugeridas
        </span>

        {/* Row 1 */}
        <div className="flex flex-wrap gap-1.5">
          <SkillTagChecked label="React" variant="blue" />
          <SkillTagChecked label="TypeScript" variant="blue" />
        </div>

        {/* Row 2 */}
        <div className="flex flex-wrap gap-1.5">
          <SkillTagChecked label="Node.js" variant="green" />
          <SkillTagUnchecked label="Python" />
          <SkillTagUnchecked label="AWS" />
        </div>

        {/* Row 3 */}
        <div className="flex flex-wrap gap-1.5">
          <SkillTagChecked label="SQL" variant="blue" />
          <SkillTagUnchecked label="Docker" />
          <SkillTagChecked label="Git" variant="green" />
        </div>
      </div>

      {/* Cursor badge */}
      <div className="absolute top-42.5 left-65 flex h-12 w-12 items-center justify-center rounded-3xl bg-orange-500">
        <MousePointer className="h-5 w-5 text-white" />
      </div>
    </div>
  );
}
