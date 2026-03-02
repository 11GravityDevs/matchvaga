"use client";

import Link from "next/link";

import { ROUTE_HOME_DASHBOARD, ROUTE_LOGIN } from "@/constants/routes";
import { useAuthContext } from "@/contexts/auth-context";

interface AuthAwareLinkProps {
  loggedOutLabel: string;
  loggedInLabel: string;
  loggedInHref?: string;
  loggedOutHref?: string;
  icon?: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

export function AuthAwareLink({
  loggedOutLabel,
  loggedInLabel,
  loggedInHref,
  loggedOutHref,
  icon,
  className,
  labelClassName,
}: AuthAwareLinkProps) {
  const { isLoggedIn } = useAuthContext();

  const href = isLoggedIn
    ? (loggedInHref ?? ROUTE_HOME_DASHBOARD)
    : (loggedOutHref ?? ROUTE_LOGIN);
  const label = isLoggedIn ? loggedInLabel : loggedOutLabel;

  return (
    <Link href={href} className={className}>
      {icon}
      {icon ? <span className={labelClassName}>{label}</span> : label}
    </Link>
  );
}
