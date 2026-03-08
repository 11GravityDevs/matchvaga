"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

import { useUnsavedChanges } from "@/contexts/unsaved-changes-context";

type ConfirmLeaveLinkProps = ComponentProps<typeof Link>;

export function ConfirmLeaveLink({
  href,
  onClick,
  ...rest
}: ConfirmLeaveLinkProps) {
  const router = useRouter();
  const { isDirty, requestLeave } = useUnsavedChanges();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isDirty) {
      e.preventDefault();
      const url = typeof href === "string" ? href : (href.pathname ?? "");
      requestLeave(() => router.push(url));
      return;
    }
    onClick?.(e);
  }

  return <Link href={href} onClick={handleClick} {...rest} />;
}
