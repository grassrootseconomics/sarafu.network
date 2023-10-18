import React from "react";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/utils/api";
import { VoucherList } from "../voucher-list";

export const ExploreScreen = () => {
  const { data: vouchers } = api.voucher.all.useQuery();
  const [search, setSearch] = React.useState("");
  const filteredVouchers = React.useMemo(
    () =>
      vouchers?.filter(
        (voucher) =>
          voucher.voucher_name?.toLowerCase().includes(search.toLowerCase()) ||
          voucher.location_name?.toLowerCase().includes(search.toLowerCase())
      ),
    [vouchers, search]
  );
  return (
    <div>
      <div className="text-3xl font-semibold pt-4 pb-2 text-center">Explore</div>
      <div>
        <Tabs defaultValue="vouchers" className="mx-2">
          <TabsList className="grid w-fit mx-auto my-2 mb-4 grid-cols-2">
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger disabled value="market">Marketplace</TabsTrigger>
          </TabsList>
          <TabsContent className="shadow-md" value="vouchers">
            <Input
              type="search"
              placeholder="Search..."
              className="flex grow mb-4"
              value={search}
              onChange={(v) => setSearch(v.target.value)}
            />
            <VoucherList vouchers={filteredVouchers || []} />
          </TabsContent>
          <TabsContent className="shadow-md" value="market"></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
