"use client";

import { Info, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  priority?: boolean;
}

const GRID_BANNER_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

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
  priority,
}: {
  pool: Pool;
  priority?: boolean;
}) {
  if (pool.banner_url) {
    return (
      <Image
        src={pool.banner_url}
        alt={pool.pool_name}
        fill
        sizes={GRID_BANNER_SIZES}
        priority={priority}
        className="object-cover transition-transform duration-200 group-hover:scale-105"
      />
    );
  }

  const initials = initialsFromPool(pool.pool_name, pool.pool_symbol);
  return (
    <div
      role="img"
      aria-label={pool.pool_name}
      className="absolute inset-0 flex items-center justify-center font-bold text-white/95 select-none text-3xl sm:text-5xl tracking-wider"
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
}: {
  swap_count: number;
  voucher_count: number;
  className?: string;
}) {
  const stats = [
    { label: "Swaps", value: swap_count },
    { label: "Vouchers", value: voucher_count },
  ];

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
  priority = false,
}: PoolListItemProps) {
  return (
    <Link href={`/pools/${pool.contract_address}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-[380px] flex flex-col group">
        <div className="relative h-44 w-full flex-shrink-0">
          <PoolBanner pool={pool} priority={priority} />
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
          <div className="h-5 mt-1 flex items-center min-w-0">
            {pool.distance_km != null && (
              <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <MapPin className="h-3 w-3" />
                {formatDistanceKm(pool.distance_km)} away
              </span>
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
