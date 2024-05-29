import { SymbolIcon } from "@radix-ui/react-icons";
import Head from "next/head";
import { useRouter } from "next/router";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { Icons } from "~/components/icons";
import { ContentLayout } from "~/components/layout/content-layout";
import { DonateToPoolButton } from "~/components/pools/forms/donate-form";
import { SwapForm } from "~/components/pools/forms/swap-form";
import { WithdrawFromPoolButton } from "~/components/pools/forms/withdraw-form";
import { useSwapPool } from "~/components/pools/hooks";
import { SwapPoolDetails } from "~/components/pools/swap-pool-details";
import { SwapPoolVoucherTable } from "~/components/pools/swap-pool-voucher-table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useAuth } from "~/hooks/useAuth";

export default function PoolPage() {
  const router = useRouter();
  const pool_address = router.query.address as `0x${string}`;
  const {data: pool} = useSwapPool(pool_address);
  const auth = useAuth();
  const isOwner =
    auth?.user?.account &&
    pool?.owner &&
    pool?.owner === auth?.user?.account.blockchain_address;
  return (
    <ContentLayout title={pool?.name ?? ""} Icon={Icons.pools}>
      <BreadcrumbResponsive
        items={[
          {
            label: "Home",
            href: "/",
          },
          { label: "Pools", href: "/pools" },
          { label: pool?.name ?? "" },
        ]}
      />
      <div className="mx-1 sm:mx-2">
        <Head>
          <title>{`${pool?.name}`}</title>
          <meta name="description" content={""} key="desc" />
          <meta property="og:title" content={`${pool?.name}`} />
          <meta property="og:description" content={""} />
        </Head>
        <div className="flex justify-center items-center gap-x-4 m-4">
          <Icons.pools className="h-10 w-10" />
          <h1 className="text-center text-3xl font-extrabold">{pool?.name}</h1>
        </div>
        <div className="grid gap-2 lg:grid-cols-2">
          <div>
            <SwapPoolDetails address={pool_address} />
            <div className="grid grid-cols-1 p-5 mt-2 gap-2">
              {pool && <DonateToPoolButton pool={pool} />}
              {isOwner && pool && <WithdrawFromPoolButton pool={pool} />}
            </div>
            <Card>
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
    </ContentLayout>
  );
}
