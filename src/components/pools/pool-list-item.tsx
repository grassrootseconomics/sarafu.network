"use client";

import { Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface Pool {
  contract_address: string;
  pool_name: string;
  pool_symbol: string;
  description: string;
  banner_url: string | null;
  tags: string[];
  swap_count: number;
  voucher_count: number;
}

interface PoolListItemProps {
  pool: Pool;
  viewMode: "grid" | "list";
}

function PoolStats({
  swap_count,
  voucher_count,
  className = "",
  variant = "default",
}: {
  swap_count: number;
  voucher_count: number;
  className?: string;
  variant?: "default" | "compact";
}) {
  const stats = [
    { label: "Swaps", value: swap_count },
    { label: "Vouchers", value: voucher_count },
  ];

  if (variant === "compact") {
    return (
      <div className={`flex flex-col xs:flex-row gap-1 xs:gap-3 ${className}`}>
        {stats.map(({ label, value }, index) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/50 hover:bg-muted transition-colors duration-200",
              index === 0 && "xs:border-r xs:border-border/50 xs:pr-3"
            )}
          >
            <span className="font-medium text-xs xs:text-sm">
              {value.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col xs:flex-row gap-1 xs:gap-2 ${className}`}>
      {stats.map(({ label, value }) => (
        <Badge
          key={label}
          variant="secondary"
          className="bg-black/70 text-white text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 hover:bg-black/80"
        >
          {value.toLocaleString()} {label}
        </Badge>
      ))}
    </div>
  );
}

export function PoolListItem({ pool, viewMode }: PoolListItemProps) {
  if (viewMode === "list") {
    return (
      <Link href={`/pools/${pool.contract_address}`}>
        <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 py-4 px-4 xs:px-6 hover:bg-muted/50 rounded-lg transition-all duration-200 group relative before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-border/50 first:before:hidden">
          <div className="flex gap-3 items-start xs:items-center">
            <div className="relative h-10 w-10 xs:h-12 xs:w-12 flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
              <Image
                src={pool.banner_url ?? "/pools/pool-default.webp"}
                alt={pool.pool_name}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className="font-medium text-sm xs:text-base line-clamp-1 group-hover:text-primary transition-colors duration-200"
                  title={pool.pool_name}
                >
                  {pool.pool_name}
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground flex-shrink-0 transition-colors duration-200 hover:text-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Contract: {pool.contract_address}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs xs:text-sm text-muted-foreground">
                {pool.pool_symbol}
              </p>
            </div>
          </div>
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 flex-1 items-start">
            <div className="hidden md:block flex-1 min-w-0">
              <p className="text-xs xs:text-sm text-muted-foreground line-clamp-2">
                {pool.description}
              </p>
            </div>
            <div className="flex xs:hidden gap-3 items-center justify-between w-full border-t pt-2">
              <div className="flex flex-wrap gap-1 flex-1">
                {pool.tags.slice(0, 1).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs px-2 py-0 transition-colors duration-200 hover:bg-secondary/70"
                  >
                    {tag}
                  </Badge>
                ))}
                {pool.tags.length > 1 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0 cursor-help transition-colors duration-200 hover:bg-muted"
                        >
                          +{pool.tags.length - 1}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent align="end">
                        <div className="flex flex-col gap-1">
                          {pool.tags.slice(1).map((tag) => (
                            <span
                              key={tag}
                              className="text-sm whitespace-nowrap"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <PoolStats
                swap_count={pool.swap_count}
                voucher_count={pool.voucher_count}
                variant="compact"
                className="text-muted-foreground"
              />
            </div>
            <div className="hidden xs:flex sm:flex-wrap gap-1 w-32">
              {pool.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 transition-colors duration-200 hover:bg-secondary/70"
                >
                  {tag}
                </Badge>
              ))}
              {pool.tags.length > 2 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0.5 cursor-help transition-colors duration-200 hover:bg-muted"
                      >
                        +{pool.tags.length - 2}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent align="end">
                      <div className="flex flex-col gap-1">
                        {pool.tags.slice(2).map((tag) => (
                          <span key={tag} className="text-sm whitespace-nowrap">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="hidden xs:block text-right">
              <PoolStats
                swap_count={pool.swap_count}
                voucher_count={pool.voucher_count}
                variant="compact"
                className="text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/pools/${pool.contract_address}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-[400px] flex flex-col group">
        <div className="relative h-48 w-full flex-shrink-0">
          <Image
            src={pool.banner_url ?? "/pools/pool-default.webp"}
            alt={pool.pool_name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <PoolStats
            swap_count={pool.swap_count}
            voucher_count={pool.voucher_count}
            className="absolute bottom-2 right-2"
          />
        </div>
        <CardHeader className="flex-shrink-0 space-y-1">
          <div className="flex items-start gap-2">
            <h3
              className="text-lg sm:text-2xl font-bold line-clamp-1 flex-1"
              title={pool.pool_name}
            >
              {pool.pool_name}
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Contract: {pool.contract_address}</p>
                  <p>Symbol: {pool.pool_symbol}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {pool.pool_symbol}
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
            {pool.description}
          </p>
          <div className="flex flex-wrap gap-1 sm:gap-2 mt-4">
            {pool.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs sm:text-sm"
              >
                {tag}
              </Badge>
            ))}
            {pool.tags.length > 2 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="text-xs sm:text-sm cursor-help"
                    >
                      +{pool.tags.length - 2}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col gap-1">
                      {pool.tags.slice(2).map((tag) => (
                        <span key={tag} className="text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
