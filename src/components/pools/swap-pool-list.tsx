import { env } from "~/env";
import { Card, CardContent, CardHeader } from "../ui/card";
import { useContractIndex } from "./hooks";
import { SwapPoolListItem } from "./swap-pool-list-item";

export const SwapPoolList = () => {
  const {data: pools} = useContractIndex(env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS);
  return (
    <Card>
      <CardHeader></CardHeader>
      <CardContent>
        <div className="flex flex-col gap-y-4">
          {pools?.contractAddresses?.map((pool, idx) => (
            <SwapPoolListItem key={idx} address={pool} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
