"use client";

import { type MouseEvent, useState } from "react";
import { cn } from "~/lib/utils";

export function Copyable(props: {
  text: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = async (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      await navigator.clipboard.writeText(props.text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 1500);
    } catch {}
  };

  return (
    <div
      className={cn(
        "relative",
        props.className,
        props.disabled ? "" : "pointer"
      )}
      onClick={!props.disabled ? handleCopy : undefined}
    >
      {props.children ?? props.text}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-background text-sm font-medium rounded transition-all duration-500",
          showCopied
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        Copied!
      </div>
    </div>
  );
}
