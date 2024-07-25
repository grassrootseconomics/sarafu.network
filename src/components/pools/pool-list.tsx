import { env } from "~/env";
import { useContractIndex } from "./hooks";
import { PoolListItem } from "./pool-list-item";

export const PoolList = () => {
  const { data: pools } = useContractIndex(
    env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS
  );
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {pools?.contractAddresses?.map((pool, idx) => (
        <PoolListItem key={idx} address={pool} />
      ))}
    </div>
  );
};
