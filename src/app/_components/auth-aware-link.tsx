"use client";

import Link from "next/link";

import { ROUTE_HOME_DASHBOARD, ROUTE_LOGIN } from "@/constants/routes";

import { useIsLoggedIn } from "../_hooks/use-is-logged-in";

interface AuthAwareLinkProps {
  loggedOutLabel: string;
  loggedInLabel: string;
  icon?: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

export function AuthAwareLink({
  loggedOutLabel,
  loggedInLabel,
  icon,
  className,
  labelClassName,
}: AuthAwareLinkProps) {
  const isLoggedIn = useIsLoggedIn();
  const href = isLoggedIn ? ROUTE_HOME_DASHBOARD : ROUTE_LOGIN;
  const label = isLoggedIn ? loggedInLabel : loggedOutLabel;

  return (
    <Link href={href} className={className}>
      {icon}
      {icon ? <span className={labelClassName}>{label}</span> : label}
    </Link>
  );
}
