"use client";

import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { buttonVariants } from "../ui/button";

interface EditReportButtonProps {
  reportId: number;
  variant?: "default" | "ghost" | "outline";
  className?: string;
}

export function EditReportButton({
  reportId,
  variant = "default",
  className,
}: EditReportButtonProps) {
  return (
    <Link
      href={`/reports/${reportId}/edit`}
      className={cn(
        buttonVariants({
          variant,
          size: "sm",
        }),
        className
      )}
    >
      <PencilIcon className="w-4 h-4 mr-2" />
      Edit Report
    </Link>
  );
}


