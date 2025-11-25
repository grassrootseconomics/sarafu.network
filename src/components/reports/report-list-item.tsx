"use client";

import { format } from "date-fns";
import { CalendarIcon, ClockIcon, PencilIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Authorization, useAuth } from "~/hooks/useAuth";
import { type RouterOutputs } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { VoucherChip } from "../voucher/voucher-chip";
import { ReportTag } from "./report-tag";
import { ReportStatusBadge } from "./report-status-badge";

interface ReportListItemProps {
  report: RouterOutputs["report"]["list"]["items"][number];
  priority?: boolean;
}

export function ReportListItem({
  report,
  priority = false,
}: ReportListItemProps) {
  const router = useRouter();

  function navigateToEdit(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/reports/${report.id}/edit`);
  }

  const auth = useAuth();
  const isOwner = auth?.session?.user?.id === report.created_by;
  const hasImage = Boolean(report.image_url);
  const hasTags = report.tags?.length > 0;
  const hasVouchers = report.vouchers?.length > 0;
  const displayTags = hasTags ? report.tags.slice(0, 5) : [];
  const hasMoreTags = hasTags && report.tags.length > 5;

  function filterByUser(e: React.MouseEvent, userAddress: string) {
    e.preventDefault();
    e.stopPropagation();
    const params = new URLSearchParams();
    params.set("creator_address", userAddress);
    router.push(`/reports?${params.toString()}`);
  }

  return (
    <Link
      href={`/reports/${report.id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
    >
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]">
        <div className="flex flex-col md:flex-row">
          {hasImage ? (
            <div className="w-full h-48 md:w-72 md:h-56 md:flex-shrink-0">
              <div className="relative w-full h-full">
                <Image
                  src={report.image_url!}
                  alt={`Image for ${report.title}`}
                  fill
                  className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                  sizes="(max-width: 768px) 100vw, 288px"
                  priority={priority}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ) : (
            <div className="hidden md:block relative md:w-16 md:flex-shrink-0 bg-muted/30" />
          )}

          <CardContent
            className={cn(
              "flex-1 flex flex-col",
              hasImage ? "p-4 md:py-4 md:px-5" : "p-5",
              !hasImage && "md:pl-5"
            )}
          >
            <div className="flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-semibold transition-colors duration-200 group-hover:text-primary line-clamp-1">
                  {report.title}
                </h3>

                <Authorization
                  resource="Reports"
                  action="UPDATE"
                  isOwner={isOwner}
                >
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <ReportStatusBadge status={report.status}/>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={navigateToEdit}
                            className={buttonVariants({
                              size: "icon",
                              variant: "ghost",
                              className:
                                "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                            })}
                          >
                            <PencilIcon className="w-4 h-4" />
                            <span className="sr-only">Edit report</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit report</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </Authorization>
              </div>

              {hasTags && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {displayTags.map((tag) => (
                    <ReportTag key={tag} tag={tag} />
                  ))}
                  {hasMoreTags && (
                    <Badge variant="outline" className="text-xs">
                      +{report.tags.length - 5} more
                    </Badge>
                  )}
                </div>
              )}

              {report.description && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {report.description}
                </p>
              )}
            </div>

            <CardFooter className="px-0 pt-3 pb-0 mt-3 border-t">
              <div className="flex flex-1 items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                <div
                  className="flex items-center cursor-pointer hover:underline"
                  onClick={(e) => filterByUser(e, report.creator_address)}
                >
                  <UserIcon className="w-3.5 h-3.5 mr-1.5" />
                  <span>{report.creator_name ?? "Anonymous"}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                  <span>
                    Created {format(new Date(report.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
                  <span>
                    Updated {format(new Date(report.updated_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
              {hasVouchers && (
                <div className="flex flex-wrap gap-2 items-center justify-end">
                  {report.vouchers.slice(0, 3).map((voucher) => (
                    <VoucherChip
                      truncate={true}
                      key={voucher}
                      clickable={true}
                      voucher_address={voucher as `0x${string}`}
                    />
                  ))}
                  {report.vouchers.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{report.vouchers.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </CardFooter>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

export function ReportListItemSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row md:h-56">
        <Skeleton className="w-full h-48 md:w-72 md:h-56 rounded-t-lg md:rounded-l-lg md:rounded-tr-none" />

        <div className="flex-1 p-4 md:p-5 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-2">
            <Skeleton className="h-7 w-2/3" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-14" />
          </div>

          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-4/5 mb-3" />

          <div className="flex flex-wrap gap-2 mb-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>

          <div className="mt-auto pt-3 border-t">
            <div className="flex flex-wrap gap-2 justify-end">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
