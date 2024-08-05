import Head from "next/head";
import Link from "next/link";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { Icons } from "~/components/icons";
import { ContentContainer } from "~/components/layout/content-container";
import { PoolList } from "~/components/pools/pool-list";
import { buttonVariants } from "~/components/ui/button";

export default function PoolsPage() {
  return (
    <ContentContainer title={"Pools"} Icon={Icons.pools}>
      <BreadcrumbResponsive
        items={[
          {
            label: "Home",
            href: "/",
          },
          { label: "Pools" },
        ]}
      />
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
        <div className="grid gap-2 mt-4">
          <div className="flex justify-end">
            <Link className={buttonVariants()} href="/pools/create">
              Create Pool
            </Link>
          </div>
          <PoolList />
        </div>
      </div>
    </ContentContainer>
  );
}
