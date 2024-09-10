import { TagIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/utils/api";
import { truncateString } from "~/utils/string";
import { AspectRatio } from "../ui/aspect-ratio";
import { Skeleton } from "../ui/skeleton";
import { useSwapPool } from "./hooks";

export const PoolListItem = ({ address }: { address: `0x${string}` }) => {
  const { data: pool } = useSwapPool(address);
  const { data: poolData } = api.pool.get.useQuery(address);

  return (
    <Link
      href={`/pools/${address}`}
      className="flex flex-col md:flex-row items-center md:items-start bg-white p-4 rounded-lg shadow-md w-full max-w-full md:max-w-2xl mx-auto hover:bg-gray-100"
    >
      {poolData?.banner_url ? (
        <div className="relative w-full md:w-1/2 rounded-lg overflow-hidden shadow-inner-lg">
          <AspectRatio ratio={16 / 9}>
            <Image
              src={poolData?.banner_url}
              alt="banner"
              fill={true}
              className="object-cover"
            />
          </AspectRatio>
          <div className="absolute bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm bottom-2 right-2">
            {pool?.tokenIndex.entryCount.toString() ?? 0}
          </div>
        </div>
      ) : null}
      <div className="flex flex-col md:mt-0 md:ml-4 w-full md:w-1/2">
        <h1 className="font-bold text-xl">
          {pool?.name ?? <Skeleton className="w-24 h-5" />}
        </h1>
        {poolData?.tags && poolData?.tags.length > 0 && (
          <h2 className="flex items-center font-extrabold text-secondary mt-1 mb-2">
            <TagIcon className="h-4 w-4 mr-2" />
            {poolData?.tags?.map((tag) => tag).join(", ")}
          </h2>
        )}
        <p className="text-sm font-normal text-gray-700">
          {poolData?.swap_pool_description
            ? truncateString(poolData?.swap_pool_description, 200)
            : "No description available"}
        </p>
      </div>
    </Link>
  );
};
