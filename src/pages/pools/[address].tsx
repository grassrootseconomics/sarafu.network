import { SymbolIcon } from "@radix-ui/react-icons";
import Head from "next/head";
import { useRouter } from "next/router";
import { Icons } from "~/components/icons";
import { DonateToPoolButton } from "~/components/swap/forms/donate-form";
import { SwapForm } from "~/components/swap/forms/swap-form";
import { WithdrawFromPoolButton } from "~/components/swap/forms/withdraw-form";
import { useSwapPool } from "~/components/swap/hooks";
import { SwapPoolDetails } from "~/components/swap/swap-pool-details";
import { SwapPoolVoucherTable } from "~/components/swap/swap-pool-voucher-table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useUser } from "~/hooks/useAuth";

export default function PoolPage() {
  const router = useRouter();
  const pool_address = router.query.address as `0x${string}`;
  const pool = useSwapPool(pool_address);
  const user = useUser();
  const isOwner =
    user?.account &&
    pool.owner &&
    pool.owner === user?.account.blockchain_address;
  return (
    <div className="mx-1 sm:mx-2">
      <Head>
        <title>{`${pool.name}`}</title>
        <meta name="description" content={""} key="desc" />
        <meta property="og:title" content={`${pool.name}`} />
        <meta property="og:description" content={""} />
      </Head>
      <div className="flex justify-center items-center gap-x-4 m-4">
        <Icons.pools className="h-10 w-10" />
        <h1 className="text-center text-3xl font-extrabold">{pool.name}</h1>
      </div>
      <div className="grid gap-2 lg:grid-cols-2">
        <div>
          <SwapPoolDetails address={pool_address} />
          <div className="grid grid-cols-1 p-5 mt-2 gap-2">
            <DonateToPoolButton pool={pool} />
            {isOwner && <WithdrawFromPoolButton pool={pool} />}
          </div>
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <SymbolIcon height={20} width={20} />
                Exchange
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SwapForm swapPool={pool} />
            </CardContent>
          </Card>
        </div>
        <SwapPoolVoucherTable pool={pool} />
      </div>
    </div>
  );
}
