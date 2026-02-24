"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/utils/style";

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  rootMargin?: string;
  intensity?: "subtle" | "default";
}

export function AnimateOnScroll({
  children,
  className,
  delay = 0,
  rootMargin = "0px 0px -60px 0px",
  intensity = "default",
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out",
        !isVisible &&
          (intensity === "subtle"
            ? "translate-y-3 opacity-0"
            : "translate-y-6 opacity-0"),
        isVisible && "translate-y-0 opacity-100",
        className
      )}
      style={
        delay > 0 && isVisible ? { transitionDelay: `${delay}ms` } : undefined
      }
    >
      {children}
    </div>
  );
}
