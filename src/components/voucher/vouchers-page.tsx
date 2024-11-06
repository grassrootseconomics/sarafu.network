"use client";
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { type LatLngBounds } from "leaflet";
import { debounce } from "lodash";
import { Loader2, PlusIcon, Search } from "lucide-react";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { ContentContainer } from "~/components/layout/content-container";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";
import { type RouterOutput } from "~/server/api/root";
import { type MapProps } from "../../components/map";
import { VoucherList } from "../../components/voucher/voucher-list";

type VoucherItem = RouterOutput["voucher"]["list"][number];

const Map = dynamic<MapProps<VoucherItem>>(
  () => import("../../components/map"),
  { ssr: false }
);

const VouchersPage = () => {
  const { data: vouchers, isLoading } = trpc.voucher.list.useQuery(undefined);
  const [search, setSearch] = useState("");
  const [mapZoom, setMapZoom] = useState(2);
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  const router = useRouter();
  const user = useAuth();

  const debouncedSearch = useCallback(
    debounce((value: string) => setSearch(value), 300),
    []
  );

  const filteredVouchers = React.useMemo(
    () =>
      vouchers?.filter(
        (voucher) =>
          (voucher.voucher_name?.toLowerCase().includes(search.toLowerCase()) ||
            voucher.location_name
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            voucher.symbol?.toLowerCase().includes(search.toLowerCase())) &&
          (!mapBounds ||
            (voucher.geo && mapBounds.contains([voucher.geo.x, voucher.geo.y])))
      ),
    [vouchers, search, mapBounds]
  );

  return (
    <ContentContainer title="Vouchers">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 grow max-h-[calc(100vh-220px)]">
        <Head>
          <title>Vouchers - Sarafu Network</title>
          <meta
            name="description"
            content="Explore Sarafu Network Vouchers"
            key="desc"
          />
          <meta property="og:title" content="Sarafu Network Vouchers" />
          <meta
            property="og:description"
            content="Explore community asset vouchers on Sarafu Network"
          />
        </Head>
        <div className="lg:col-span-12 flex justify-between items-center">
          <h1 className="text-3xl text-primary font-poppins font-semibold">
            Explore
          </h1>
        </div>
        <div className="lg:col-span-6 max-h-full">
          <div className="flex flex-col sm:flex-row justify-between items-stretch mb-6 gap-4">
            <div className="relative flex-grow max-w-md">
              <Input
                type="search"
                placeholder="Search vouchers..."
                className="pl-10 pr-4 py-2 w-full"
                onChange={(e) => debouncedSearch(e.target.value)}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
            {user && (
              <Button
                asChild
                size="sm"
                className="bg-primary hover:bg-primary-dark text-white font-semibold"
              >
                <Link href="/vouchers/create" className="flex items-center">
                  <PlusIcon className="mr-2" size={20} />
                  Create Voucher
                </Link>
              </Button>
            )}
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="max-h-[580px] overflow-y-auto pr-4">
              <VoucherList
                vouchers={filteredVouchers ?? []}
                showDescription={true}
                showLocation={true}
              />
            </div>
          )}
        </div>
        <Tabs defaultValue="map" className="lg:col-span-6">
          <TabsList className="mb-6">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="stats" disabled>
              Stats
            </TabsTrigger>
            <TabsTrigger value="graphs" disabled>
              Graphs
            </TabsTrigger>
          </TabsList>
          <Card className="overflow-hidden">
            <TabsContent value="map">
              <Map
                style={{ height: "590px", width: "100%", zIndex: 1 }}
                items={filteredVouchers}
                getTooltip={(item) => item.voucher_name || ""}
                onItemClicked={(item) =>
                  void router.push(`/vouchers/${item.voucher_address}`)
                }
                zoom={mapZoom}
                onZoomChange={setMapZoom}
                onBoundsChange={setMapBounds}
                getLatLng={(item) =>
                  item.geo ? [item.geo.x, item.geo.y] : undefined
                }
              />
            </TabsContent>
            <TabsContent value="stats"></TabsContent>
            <TabsContent value="graphs"></TabsContent>
          </Card>
        </Tabs>
      </div>
    </ContentContainer>
  );
};

export default VouchersPage;
