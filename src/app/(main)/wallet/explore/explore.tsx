"use client";

import { ContentContainer } from "~/components/layout/content-container";
import { Loading } from "~/components/loading";
import { PoolListContainer } from "~/components/pools/pools-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { VoucherListContainer } from "~/components/voucher/voucher-list-container";
import { useAuth } from "~/hooks/useAuth";

export const ExplorePage = () => {
  const auth = useAuth();

  if (!auth?.user) {
    return <Loading />;
  }

  return (
    <ContentContainer title="Explore">
      <div className="w-full flex flex-col flex-grow mx-auto px-1 sm:px-2">
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
              <VoucherListContainer />
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
