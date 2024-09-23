import { env } from "~/env";
import { Skeleton } from "../ui/skeleton";
import { useContractIndex } from "./hooks";
import { PoolListItem } from "./pool-list-item";

interface PoolListProps {
  searchTerm: string;
  searchTags: string[];
}

export const PoolList: React.FC<PoolListProps> = ({ searchTerm, searchTags }) => {
  const { data: pools, isLoading } = useContractIndex(
    env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-[400px] w-full" />
        ))}
      </div>
    );
  }

  if (!pools?.contractAddresses || pools.contractAddresses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">
          No pools available at the moment.
        </p>
      </div>
    );
  }

  // Remove address-based filtering
  const filteredPools = pools.contractAddresses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredPools.map((pool, idx) => (
        // Pass searchTerm to PoolListItem
        <PoolListItem key={idx} address={pool} searchTerm={searchTerm} searchTags={searchTags} />
      ))}
    </div>
  );
};
