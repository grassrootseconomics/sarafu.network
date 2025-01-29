"use client";

import { format } from "date-fns";
import { PencilIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Authorization, useAuth } from "~/hooks/useAuth";
import { type RouterOutputs } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { ReportStatus } from "~/server/enums";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { VoucherChip } from "../voucher/voucher-chip";

interface ReportListItemProps {
  report: RouterOutputs["report"]["list"]["items"][number];
}

export function ReportListItem({ report }: ReportListItemProps) {
  function handleEditClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }
  const auth = useAuth();
  const isOwner = auth?.session?.user?.id === report.created_by;
  return (
    <Link
      href={`/reports/${report.id}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
    >
      <Card className="group relative transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]">
        <Authorization resource="Reports" action="UPDATE" isOwner={isOwner}>
          <div className="flex items-center gap-2 absolute right-3 top-3 z-10">
            <Badge
              className={cn(
                "bg-white/95 backdrop-blur-sm transition-colors",
                report.status === ReportStatus.DRAFT &&
                  "border-amber-500 text-amber-700",
                report.status === ReportStatus.APPROVED &&
                  "border-green-500 text-green-700"
              )}
              variant="outline"
            >
              {report.status}
            </Badge>
            <Link
              href={`/reports/${report.id}/edit`}
              onClick={handleEditClick}
              className={buttonVariants({
                size: "xs",
                variant: "secondary",
                className:
                  "bg-white/95 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
              })}
            >
              <PencilIcon className="w-3.5 h-3.5" />
              <span className="sr-only">Edit report</span>
            </Link>
          </div>
        </Authorization>

        <div
          className={cn(
            "flex flex-col md:flex-row",
            report.image_url ? "md:space-x-6 p-0 md:h-56" : "p-6"
          )}
        >
          {report.image_url ? (
            <div className="relative w-full h-48 md:w-72 md:h-56  md:flex-shrink-0">
              <Image
                src={report.image_url}
                alt=""
                fill
                className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                sizes="(max-width: 768px) 100vw, 288px"
                priority={false}
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 opacity-50 rounded-lg" />
          )}

          <div
            className={cn(
              "flex-1",
              report.image_url ? "p-4 md:py-6 md:pr-6 md:pl-0" : "relative z-10"
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold transition-colors duration-200 group-hover:text-primary line-clamp-1">
                {report.title}
              </h3>
            </div>
            <div>
              {report.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {report.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <span>
                  Created {format(new Date(report.created_at), "MMM d, yyyy")}
                </span>
                <span>·</span>
                <span>By {report.creator_name ?? "Anon"}</span>
              </div>
              <span className="hidden md:inline">·</span>
              <span>
                Updated {format(new Date(report.updated_at), "MMM d, yyyy")}
              </span>
            </div>

            {report.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2 min-h-[3em]">
                {report.description}
              </p>
            )}

            <div className="mt-4 space-y-3">
              {report.vouchers?.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-end items-center">
                  {report.vouchers.slice(0, 3).map((voucher) => (
                    <VoucherChip
                      truncate={true}
                      key={voucher}
                      clickable={true}
                      voucher_address={voucher as `0x${string}`}
                    />
                  ))}
                  {report.vouchers.length > 3 && (
                    <span className="text-sm text-muted-foreground">
                      +{report.vouchers.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function ReportListItemSkeleton() {
  return (
    <Card className="relative">
      <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
        <Skeleton className="w-full h-48 md:w-56 md:h-40 rounded-t-lg md:rounded-lg" />
        <div className="flex-1 p-4 md:pt-4 md:pr-4 md:pb-4 md:pl-0">
          <Skeleton className="h-7 w-3/4" />
          <div className="mt-2 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
    </Card>
  );
}
