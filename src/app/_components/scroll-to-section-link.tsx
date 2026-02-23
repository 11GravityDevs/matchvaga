"use client";

import Link from "next/link";

interface ScrollToSectionLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  element?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ScrollToSectionLink({
  href,
  children,
  className,
}: ScrollToSectionLinkProps) {
  const isSectionAnchor = href.startsWith("#") && href.length > 1;
  const sectionId = isSectionAnchor ? href.replace("#", "") : "";

  if (isSectionAnchor) {
    return (
      <button
        type="button"
        onClick={() => scrollToSection(sectionId)}
        className={className}
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
