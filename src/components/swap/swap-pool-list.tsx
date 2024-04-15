import { Card, CardContent, CardHeader } from "../ui/card";
import { SwapPoolListItem } from "./swap-pool-list-item";
import { useContractIndex } from "./hooks";

export const SwapPoolList = () => {
  const pools = useContractIndex("0x01eD8Fe01a2Ca44Cb26D00b1309d7D777471D00C");
  return (
    <Card>
      <CardHeader></CardHeader>
      <CardContent>
        <div className="flex flex-col gap-y-4">
          {pools.contracts.data?.map((pool, idx) => (
            <SwapPoolListItem
              key={idx}
              address={pool.result as `0x${string}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
