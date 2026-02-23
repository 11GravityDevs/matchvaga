"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import { cn } from "@/utils/style";

interface BackLinkProps {
  fallbackHref?: string;
  children?: React.ReactNode;
  className?: string;
}

export function BackLink({
  fallbackHref = "/",
  children = "Voltar",
  className,
}: BackLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(className, "cursor-pointer")}
      aria-label="Voltar à página anterior"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {children}
    </button>
  );
}
