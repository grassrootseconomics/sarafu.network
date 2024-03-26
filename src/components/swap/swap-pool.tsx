import { Avatar } from "@radix-ui/react-avatar";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import Address from "../address";
import { Icons } from "../icons";
import { BasicTable } from "../tables/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Row } from "../voucher/voucher-info";
import { useContractIndex, useSwapPool } from "./hooks";
import { type SwapPoolVoucher } from "./types";

export const SwapPools = () => {
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
export const SwapPoolListItem = ({ address }: { address: `0x${string}` }) => {
  const pool = useSwapPool(address);
  return (
    <Link href={`/pools/${address}`} className="mr-6 items-center space-x-2">
      <div className="flex justify-start items-center hover:scale-[1.005] transition-all rounded-sm gap-x-4">
        <Avatar className="relative outline outline-1 rounded-full w-10 h-10 min-w-10 min-h-10 flex items-center justify-center">
          <div
            className="absolute bg-black text-white rounded-full w-5 h-5 text-center bottom-[-6%] right-[-6%]"
            style={{ fontSize: "16px", lineHeight: "20px" }}
          >
            {pool.tokenIndex.entryCount.toString() ?? 0}
          </div>
          <Icons.pools className="" />
        </Avatar>
        <div className="flex flex-col">
          <h1>{pool.name ?? <Skeleton className="w-24 h-5" />}</h1>
          <Address
            className="text-gray-400"
            address={address}
            truncate={true}
          />
        </div>
      </div>
    </Link>
  );
};

export const SwapPoolDetails = ({ address }: { address: `0x${string}` }) => {
  const pool = useSwapPool(address);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <InfoCircledIcon height={25} width={25} />
          Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Row label="Name" value={pool.name ?? ""} />
        <Row label="Address" value={address ?? ""} />
        <Row label="Owner" value={pool.owner ?? ""} />
        <Row label="Quoter" value={pool.quoter ?? ""} />
        <Row label="Fee Address" value={pool.feeAddress ?? ""} />
        <Row
          label="Fee"
          value={
            pool.feePpm ? (pool.feePpm / BigInt(1000)).toString() + " %" : ""
          }
        />
        <Row label="Limiter" value={pool.tokenLimiter ?? ""} />
      </CardContent>
    </Card>
  );
};

export const SwapPoolTokens = ({
  pool,
}: {
  pool: ReturnType<typeof useSwapPool>;
}) => {
  return (
    <Card className="overflow-x-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <Icons.vouchers />
          Vouchers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <BasicTable
            data={pool?.voucherDetails.data ?? []}
            columns={
              [
                { header: "Symbol", accessorKey: "symbol" },
                { header: "Name", accessorKey: "name" },
                { header: "Decimals", accessorKey: "decimals" },
                {
                  header: "Limit Of",
                  accessorFn: (row: SwapPoolVoucher) => row.limitOf?.formatted,
                },
                { header: "Exchange Rate", accessorKey: "priceIndex" },
                {
                  header: "Pool Balance",
                  accessorFn: (row: SwapPoolVoucher) =>
                    row.poolBalance?.formatted,
                },
              ] as const
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};
