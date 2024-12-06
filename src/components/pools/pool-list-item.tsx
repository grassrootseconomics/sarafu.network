"use client";

import { TagIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "~/lib/trpc";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { useSwapPool } from "./hooks";
interface PoolListItemProps {
  address: `0x${string}`;
  searchTerm: string;
  searchTags: string[];
}

export const PoolListItem: React.FC<PoolListItemProps> = ({
  address,
  searchTerm,
  searchTags,
}) => {
  const { data: pool } = useSwapPool(address);
  const { data: poolData } = trpc.pool.get.useQuery(address, {
    staleTime: 60 * 1000,
  });

  // Conditionally render based on searchTerm matching name or description
  if (
    (searchTerm &&
      !(
        (pool?.name &&
          pool.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (poolData?.swap_pool_description &&
          poolData.swap_pool_description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
      )) ||
    (searchTags &&
      searchTags.length > 0 &&
      !poolData?.tags.some((tag) => searchTags.includes(tag)))
  ) {
    return null;
  }

  return (
    <Link
      href={`/pools/${address}`}
      className="flex flex-col bg-white p-6 rounded-lg border border-gray-200 w-full hover:bg-gray-50 transition-colors duration-200 h-[350px]"
    >
      <div className="flex-grow">
        <div className="relative w-full h-40 rounded-lg overflow-hidden shadow-inner-lg mb-4">
          <Image
            src={poolData?.banner_url ?? "/pools/pool-default.webp"}
            alt="banner"
            fill={true}
            className="object-cover"
          />
          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
            {pool?.tokenIndex.entryCount.toString() ?? 0} tokens
          </Badge>
        </div>

        <h1 className="font-bold text-xl mb-2 line-clamp-1" title={pool?.name}>
          {pool?.name ?? <Skeleton className="w-32 h-6" />}
        </h1>
        {poolData?.tags && poolData.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <TagIcon className="h-4 w-4 text-secondary flex-shrink-0" />
            <div className="flex gap-1 items-center">
              {poolData.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {poolData.tags.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{poolData.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
        <p className="text-sm font-normal text-gray-700 mb-4 line-clamp-3">
          {poolData?.swap_pool_description
            ? poolData.swap_pool_description
            : "No description available"}
        </p>
      </div>
    </Link>
  );
};
