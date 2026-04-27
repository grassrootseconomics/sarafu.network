"use client";

import { Info, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { formatDistanceKm } from "~/utils/units/geo";
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
  distance_km?: number | null;
}

interface PoolListItemProps {
  pool: Pool;
  viewMode: "grid" | "list";
  priority?: boolean;
}

const GRID_BANNER_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";
const LIST_THUMB_SIZES = "48px";

// Deterministic 32-bit hash so the same address always renders the same colour pair.
function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function gradientFromSeed(seed: string): string {
  const hue1 = hashString(seed) % 360;
  const hue2 = (hue1 + 47) % 360;
  return `linear-gradient(135deg, hsl(${hue1} 55% 48%), hsl(${hue2} 60% 38%))`;
}

function initialsFromPool(name: string, symbol: string): string {
  const cleanedName = name.trim();
  const words = cleanedName.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0]!.charAt(0) + words[1]!.charAt(0)).toUpperCase();
  }
  const fallback = (cleanedName || symbol || "??").replace(/[^a-z0-9]/gi, "");
  return fallback.slice(0, 2).toUpperCase() || "??";
}

function PoolBanner({
  pool,
  variant,
  priority,
}: {
  pool: Pool;
  variant: "grid" | "thumb";
  priority?: boolean;
}) {
  if (pool.banner_url) {
    return (
      <Image
        src={pool.banner_url}
        alt={pool.pool_name}
        fill
        sizes={variant === "grid" ? GRID_BANNER_SIZES : LIST_THUMB_SIZES}
        priority={priority}
        className={cn(
          "object-cover transition-transform duration-200",
          variant === "grid"
            ? "group-hover:scale-105"
            : "group-hover:scale-110",
        )}
      />
    );
  }

  const initials = initialsFromPool(pool.pool_name, pool.pool_symbol);
  return (
    <div
      role="img"
      aria-label={pool.pool_name}
      className={cn(
        "absolute inset-0 flex items-center justify-center font-bold text-white/95 select-none",
        variant === "grid"
          ? "text-3xl sm:text-5xl tracking-wider"
          : "text-xs tracking-wide",
      )}
      style={{ backgroundImage: gradientFromSeed(pool.contract_address) }}
    >
      {initials}
    </div>
  );
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
              index === 0 && "xs:border-r xs:border-border/50 xs:pr-3",
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
          className="bg-black/60 text-white text-xs sm:text-sm whitespace-nowrap backdrop-blur-md ring-1 ring-white/10 transition-colors duration-200 hover:bg-black/75"
        >
          {value.toLocaleString()} {label}
        </Badge>
      ))}
    </div>
  );
}

export function PoolListItem({
  pool,
  viewMode,
  priority = false,
}: PoolListItemProps) {
  if (viewMode === "list") {
    return (
      <Link href={`/pools/${pool.contract_address}`}>
        <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 py-4 px-4 xs:px-6 hover:bg-muted/50 rounded-lg transition-all duration-200 group relative before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-border/50 first:before:hidden">
          <div className="flex gap-3 items-start xs:items-center">
            <div className="relative h-10 w-10 xs:h-12 xs:w-12 flex-shrink-0 rounded-lg overflow-hidden shadow-xs">
              <PoolBanner pool={pool} variant="thumb" priority={priority} />
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
              {pool.distance_km != null && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {formatDistanceKm(pool.distance_km)} away
                </p>
              )}
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
            <div className="hidden xs:flex sm:flex-wrap gap-1 w-32 min-w-0">
              {pool.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 max-w-full truncate transition-colors duration-200 hover:bg-secondary/70"
                  title={tag}
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

  // Grid card uses fixed-height sections so cards align uniformly across the grid.
  return (
    <Link href={`/pools/${pool.contract_address}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-[380px] flex flex-col group">
        <div className="relative h-44 w-full flex-shrink-0">
          <PoolBanner pool={pool} variant="grid" priority={priority} />
          <PoolStats
            swap_count={pool.swap_count}
            voucher_count={pool.voucher_count}
            className="absolute bottom-2 right-2"
          />
        </div>
        <CardHeader className="flex-shrink-0 pb-2">
          <div className="flex items-start gap-2">
            <h3
              className="text-base sm:text-lg font-bold line-clamp-2 leading-tight flex-1 h-[2.6rem] sm:h-[3.5rem]"
              title={pool.pool_name}
            >
              {pool.pool_name}
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Contract: {pool.contract_address}</p>
                  <p>Symbol: {pool.pool_symbol}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="h-5 mt-1">
            {pool.distance_km != null ? (
              <p className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground line-clamp-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {formatDistanceKm(pool.distance_km)} away
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                {pool.pool_symbol}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3 pt-0">
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 h-10 leading-5">
            {pool.description}
          </p>
          <div className="flex flex-nowrap items-center gap-1 sm:gap-2 mt-auto h-6 min-w-0 overflow-hidden">
            {pool.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs sm:text-sm min-w-0 truncate"
                title={tag}
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
                      className="text-xs sm:text-sm cursor-help shrink-0"
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
