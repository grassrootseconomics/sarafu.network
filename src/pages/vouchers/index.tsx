/* eslint-disable @typescript-eslint/ban-ts-comment */
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React from "react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/utils/api";
import { VoucherListItem } from "../../components/voucher/voucher-list-item";
const Map = dynamic(() => import("../../components/map"), {
  ssr: false,
});

const VouchersPage = () => {
  const { data: vouchers } = api.voucher.all.useQuery(undefined, {
    initialData: [],
  });
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const [filteredVouchers, setFilteredVouchers] = React.useState(vouchers);
  React.useEffect(() => {
    setFilteredVouchers(
      vouchers?.filter((voucher) =>
        voucher.voucher_name?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [vouchers, search]);
  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-12 md:col-span-6 lg:col-span-4 w-[95%] mx-auto mt-6">
        <h1 className="text-3xl mb-4 text-center font-semibold text-neutral-400">
          Vouchers
        </h1>

        <Input
          type="search"
          placeholder="Search..."
          className="flex grow mb-4"
          value={search}
          onChange={(v) => setSearch(v.target.value)}
        />
        <div style={{ height: "calc(100vh - 210px)", overflowY: "auto" }}>
          {filteredVouchers.map((voucher, idx) => (
            <VoucherListItem key={idx} voucher={voucher} />
          ))}
        </div>
      </div>
      <Tabs
        defaultValue="map"
        className="m-2 hidden md:block col-span-12 md:col-span-6 lg:col-span-8"
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
              style={{ height: "calc(100vh - 140px)", width: "100%" }}
              items={filteredVouchers ?? []}
              // This seems to be a bug with nextjs dynamic import and typescript
              // @ts-ignore
              getTooltip={(item: (typeof filteredVouchers)[0]) => {
                return item.voucher_name || "";
              }}
              // @ts-ignore
              onItemClicked={(item: (typeof filteredVouchers)[0]) => {
                console.log(item);
                void router.push(`/vouchers/${item.voucher_address}`);
              }}
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
      <Card className=""></Card>
    </div>
  );
};

export default VouchersPage;
