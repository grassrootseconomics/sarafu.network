/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createServerSideHelpers } from "@trpc/react-query/server";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React from "react";

import Head from "next/head";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { ContentContainer } from "~/components/layout/content-container";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { appRouter } from "~/server/api/root";
import { graphDB, indexerDB } from "~/server/db";
import { api } from "~/utils/api";
import SuperJson from "~/utils/trpc-transformer";
import { VoucherListItem } from "../../components/voucher/voucher-list-item";

const Map = dynamic(() => import("../../components/map"), {
  ssr: false,
});
export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      graphDB: graphDB,
      indexerDB: indexerDB,
      session: undefined,
    },
    transformer: SuperJson,
  });
  // prefetch `post.byId`
  await helpers.voucher.list.prefetch();
  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 60, // In seconds
  };
}
const VouchersPage = () => {
  const { data: vouchers } = api.voucher.list.useQuery(undefined, {
    initialData: [],
  });
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const filteredVouchers = React.useMemo(
    () =>
      vouchers?.filter(
        (voucher) =>
          voucher.voucher_name?.toLowerCase().includes(search.toLowerCase()) ||
          voucher.location_name?.toLowerCase().includes(search.toLowerCase()) ||
          voucher.symbol?.toLowerCase().includes(search.toLowerCase())
      ),
    [vouchers, search]
  );
  return (
    <ContentContainer title="Vouchers">
      <BreadcrumbResponsive
        items={[
          {
            label: "Home",
            href: "/",
          },
          { label: "Vouchers" },
        ]}
      />
      <div className="grid grid-cols-12 gap-2 grow max-h-[calc(100vh-220px)]">
        <Head>
          <title>Vouchers</title>
          <meta
            name="description"
            content="Sarafu Network Vouchers"
            key="desc"
          />
          <meta property="og:title" content={"Sarafu Network Vouchers"} />
          <meta property="og:description" content="" />
        </Head>
        <h1 className="text-3xl col-span-12 text-primary font-poppins my-4 text-center font-semibold">
          Explore community asset vouchers
        </h1>
        <div className="col-span-12 md:col-span-6 lg:col-span-6 max-h-full">
          <Input
            type="search"
            placeholder="Search..."
            className="flex grow mb-4"
            value={search}
            onChange={(v) => setSearch(v.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2   max-h-[580px] overflow-y-auto">
            {filteredVouchers.map((voucher, idx) => (
              <VoucherListItem key={idx} voucher={voucher} />
            ))}
          </div>
        </div>
        <Tabs
          defaultValue="map"
          className="m-2 mt-0 hidden md:block col-span-12 md:col-span-6 lg:col-span-6"
        >
          <TabsList>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="stats" disabled>
              Stats
            </TabsTrigger>
            <TabsTrigger value="graphs" disabled>
              Graphs
            </TabsTrigger>
          </TabsList>
          <Card className="mt-4">
            <TabsContent value="map" className="mt-0">
              <Map
                style={{
                  height: "590px",
                  width: "100%",
                  zIndex: 1,
                }}
                items={filteredVouchers ?? []}
                // This seems to be a bug with nextjs dynamic import and typescript
                // @ts-ignore
                getTooltip={(item: (typeof filteredVouchers)[0]) => {
                  return item.voucher_name || "";
                }}
                // @ts-ignore
                onItemClicked={(item: (typeof filteredVouchers)[0]) => {
                  void router.push(`/vouchers/${item.voucher_address}`);
                }}
                zoom={2}
                // @ts-ignore
                getLatLng={(item: (typeof filteredVouchers)[0]) => {
                  return item.geo
                    ? [item.geo.x, item.geo.y]
                    : [-3.654593340629959, 39.85153198242188];
                }}
              />
            </TabsContent>
            <TabsContent value="stats" className="mt-0"></TabsContent>
            <TabsContent value="graphs" className="mt-0"></TabsContent>
          </Card>
        </Tabs>
      </div>
    </ContentContainer>
  );
};

export default VouchersPage;
