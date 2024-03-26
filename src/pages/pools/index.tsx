import Head from "next/head";
import { Icons } from "~/components/icons";
import { SwapPools } from "~/components/swap/swap-pool";

export default function PoolsPage() {
  return (
    <div className="mx-1 sm:mx-2">
      <Head>
        <title>Swap Pools</title>
        <meta
          name="description"
          content="A list of all the pools available for swapping on the network."
          key="desc"
        />
        <meta property="og:title" content="Swap Pools" />
        <meta
          property="og:description"
          content="A list of all the pools available for swapping on the network."
        />
      </Head>
      <div className="flex justify-center items-center gap-x-4 m-4">
        <Icons.pools className="h-10 w-10" />
        <h1 className="text-center text-3xl font-extrabold">Pools</h1>
      </div>
      <div className="grid gap-2">
        <SwapPools />
      </div>
    </div>
  );
}
