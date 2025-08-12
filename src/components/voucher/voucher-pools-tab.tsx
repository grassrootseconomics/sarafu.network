import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Icons } from "~/components/icons";
import { VoucherPoolListItem } from "./voucher-pool-list-item";
import { useContractIndex } from "~/components/pools/hooks";
import { env } from "~/env";

interface VoucherPoolsTabProps {
  voucherAddress: `0x${string}`;
}

export function VoucherPoolsTab({ voucherAddress }: VoucherPoolsTabProps) {
  const { data: poolsRegistry } = useContractIndex(
    env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS
  );
  return (
    <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-purple-50/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
          Pool Memberships
        </CardTitle>
        <p className="text-gray-600 text-sm mt-2">
          This voucher participates in the following liquidity pools
        </p>
      </CardHeader>
      <CardContent>
        {poolsRegistry?.contractAddresses?.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-gray-500 py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <Icons.pools className="w-10 h-10 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-600">
                No Pool Memberships
              </p>
              <p className="text-sm text-gray-400 mt-1 max-w-md">
                This voucher isn&apos;t part of any liquidity pools
                yet. Pool memberships enable token swapping and
                provide liquidity for trading.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {poolsRegistry?.contractAddresses?.map((address) => (
              <VoucherPoolListItem
                key={address}
                poolAddress={address}
                voucherAddress={voucherAddress}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}