"use client";

import React from "react";
import { BreadcrumbResponsive } from "~/components/breadcrumbs";
import { ContentContainer } from "~/components/layout/content-container";
import { Loading } from "~/components/loading";
import { PoolListContainer } from "~/components/pools/pools-page";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { VoucherList } from "~/components/voucher/voucher-list";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";
export const ExplorePage = () => {
  const auth = useAuth();

  const { data: vouchers } = trpc.voucher.list.useQuery();
  const [search, setSearch] = React.useState("");
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
  if (!auth?.user) {
    return <Loading />;
  }
  return (
    <ContentContainer title="Explore">
      <BreadcrumbResponsive
        items={[
          {
            label: "Wallet",
            href: "/wallet",
          },
          { label: "Explore" },
        ]}
      />
      <div className="max-w-7xl w-full flex flex-col flex-grow mx-auto px-1 sm:px-2">
        <div className="text-3xl font-semibold pt-4 pb-2 text-center">
          Explore
        </div>
        <div>
          <Tabs defaultValue="vouchers" className="max-h-full ">
            <TabsList className="grid w-fit mx-auto my-2 mb-4 grid-cols-2">
              <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
              <TabsTrigger value="pools">Pools</TabsTrigger>
            </TabsList>
            <TabsContent className="relative" value="vouchers">
              <Input
                type="search"
                placeholder="Search..."
                className="flex grow mb-4"
                value={search}
                onChange={(v) => setSearch(v.target.value)}
              />
              <VoucherList vouchers={filteredVouchers || []} />
            </TabsContent>
            <TabsContent className="" value="pools">
              <PoolListContainer />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ContentContainer>
  );
};
