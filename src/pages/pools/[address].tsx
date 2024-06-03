import { SymbolIcon } from "@radix-ui/react-icons";
import {
  type GetStaticPaths,
  type GetStaticPropsContext,
  type InferGetStaticPropsType,
} from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import SuperJSON from "superjson";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { Icons } from "~/components/icons";
import { ContentLayout } from "~/components/layout/content-layout";
import {
  getContractIndex,
  getSwapPool,
} from "~/components/pools/contract-functions";
import { DonateToPoolButton } from "~/components/pools/forms/donate-form";
import { SwapForm } from "~/components/pools/forms/swap-form";
import { WithdrawFromPoolButton } from "~/components/pools/forms/withdraw-form";
import { useSwapPool } from "~/components/pools/hooks";
import { SwapPoolDetails } from "~/components/pools/swap-pool-details";
import { SwapPoolVoucherTable } from "~/components/pools/swap-pool-voucher-table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { env } from "~/env";
import { useAuth } from "~/hooks/useAuth";
export async function getStaticProps(
  context: GetStaticPropsContext<{ address: string }>
) {
  const address = context.params?.address;
  const pool = await getSwapPool(address as `0x${string}`);
  return {
    props: {
      pool: SuperJSON.stringify(pool),
      address: address,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 60 * 60 * 24, // In seconds
  };
}
export const getStaticPaths: GetStaticPaths = async () => {
  const data = await getContractIndex(env.NEXT_PUBLIC_SWAP_POOL_INDEX_ADDRESS);
  return {
    paths: data.contractAddresses.map((address) => ({
      params: {
        address: address,
      },
    })),
    // https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-blocking
    fallback: "blocking",
  };
};
export default function PoolPage(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const router = useRouter();
  const pool_address = router.query.address as `0x${string}`;
  const { data: pool } = useSwapPool(pool_address, SuperJSON.parse(props.pool));
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
