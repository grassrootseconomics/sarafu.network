"use client";

import { TagIcon } from "lucide-react";
import Image from "next/image";
// import { Icons } from "~/components/icons";
import { useParams } from "next/navigation";
import { getAddress } from "viem";
import Address from "~/components/address";
import { ContentContainer } from "~/components/layout/content-container";
import { useSwapPool } from "~/components/pools/hooks";
import { Badge } from "~/components/ui/badge";
import { useIsContractOwner } from "~/hooks/useIsOwner";
import { trpc } from "~/lib/trpc";
import { celoscanUrl } from "~/utils/celo";
import { PoolButtons } from "./pool-buttons-client";
import { PoolTabs } from "./pool-tabs";

export function PoolClientPage() {
  const { address } = useParams<{ address: string }>();
  const pool_address = getAddress(address) as `0x${string}`;
  const { data: pool } = useSwapPool(pool_address);
  const { data: metadata } = trpc.pool.get.useQuery(pool_address);

  const isOwner = useIsContractOwner(pool_address);
  return (
    <ContentContainer title={pool?.name ?? ""} className="bg-transparent">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        {/* Banner Background */}
        {metadata?.banner_url ? (
          <div className="absolute inset-0">
            <Image
              src={metadata.banner_url}
              alt="Pool banner"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent">
            {/* Animated Background Circles */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Large floating circles */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-2xl animate-pulse" />
              <div
                className="absolute top-1/3 -right-32 w-80 h-80 bg-indigo-300/10 rounded-full blur-3xl animate-bounce"
                style={{ animationDuration: "6s" }}
              />
              <div
                className="absolute -bottom-16 left-1/4 w-64 h-64 bg-blue-300/8 rounded-full blur-xl animate-pulse"
                style={{ animationDelay: "2s" }}
              />

              {/* Medium floating circles */}
              <div
                className="absolute top-1/4 left-1/3 w-32 h-32 bg-white/6 rounded-full blur-lg animate-bounce"
                style={{ animationDuration: "8s", animationDelay: "1s" }}
              />
              <div
                className="absolute top-2/3 right-1/4 w-24 h-24 bg-indigo-200/12 rounded-full blur-md animate-pulse"
                style={{ animationDelay: "3s" }}
              />
              <div
                className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-blue-200/8 rounded-full blur-sm animate-bounce"
                style={{ animationDuration: "7s", animationDelay: "4s" }}
              />

              {/* Small accent circles */}
              <div
                className="absolute top-1/2 left-1/6 w-16 h-16 bg-white/4 rounded-full blur-sm animate-pulse"
                style={{ animationDelay: "5s" }}
              />
              <div
                className="absolute top-3/4 right-1/3 w-12 h-12 bg-indigo-100/10 rounded-full blur-xs animate-bounce"
                style={{ animationDuration: "9s" }}
              />
              <div
                className="absolute top-1/6 right-1/2 w-8 h-8 bg-blue-100/6 rounded-full animate-pulse"
                style={{ animationDelay: "6s" }}
              />
            </div>
          </div>
        )}

        {/* Content Overlay */}
        <div className="relative z-10 px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-16">
          <div className="max-w-4xl">
            <div className="space-y-6">
              {/* Pool Name */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  {pool?.name}
                </h1>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 w-fit border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-white/80 uppercase tracking-wide">
                      Pool Address
                    </span>
                  </div>
                  <div className="h-4 w-px bg-white/30"></div>
                  <Address
                    address={pool_address}
                    truncate={true}
                    href={`${celoscanUrl.address(pool_address)}#asset-tokens`}
                    className="text-white font-mono text-sm hover:text-green-200 transition-colors underline-offset-4 hover:underline"
                  />
                </div>
              </div>
              {/* Tags */}
              {metadata?.tags && metadata.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <TagIcon className="h-5 w-5 text-white/80" />
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-white/20 text-white border-white/20 hover:bg-white/30 transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {metadata?.swap_pool_description && (
                <p className="text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">
                  {metadata.swap_pool_description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 ">{pool && <PoolButtons pool={pool} />}</div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Modern Tabs Section */}
      <div className="mt-12">
        {metadata && pool && (
          <PoolTabs pool={pool} isOwner={isOwner} metadata={metadata} />
        )}
      </div>
    </ContentContainer>
  );
}
