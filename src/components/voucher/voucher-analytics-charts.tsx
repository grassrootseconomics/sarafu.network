import { type UTCTimestamp } from "lightweight-charts";
import dynamic from "next/dynamic";
import { LineChart } from "~/components/charts/line-chart";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { trpc, type RouterOutputs } from "~/lib/trpc";
import { toUserUnitsString } from "~/utils/units/token";
import { VoucherChip } from "./voucher-chip";

const LocationMap = dynamic(() => import("~/components/map/location-map"), {
  ssr: false,
});

const VoucherForceGraph = dynamic(
  () =>
    import("~/components/force-graph/voucher-force-graph").then(
      (mod) => mod.VoucherForceGraph
    ),
  {
    ssr: false,
  }
);

interface VoucherAnalyticsChartsProps {
  voucherAddress: `0x${string}`;
  voucher: RouterOutputs["voucher"]["byAddress"] | undefined;
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function VoucherAnalyticsCharts({
  dateRange,
  voucherAddress,
  voucher,
}: VoucherAnalyticsChartsProps) {
  const { data: txsPerDay } = trpc.stats.txsPerDay.useQuery({
    dateRange,
    voucherAddress,
  });

  const { data: volumePerDay } = trpc.stats.voucherVolumePerDay.useQuery({
    dateRange,
    voucherAddress,
  });

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Tabs defaultValue="network" className="col-span-2">
        <TabsList>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>
        <Card className="overflow-hidden mt-4">
          <CardContent className="p-0">
            <TabsContent value="transactions" className="mt-0">
              <LineChart
                data={
                  txsPerDay?.map((v) => ({
                    time: (new Date(v.x).getTime() / 1000) as UTCTimestamp,
                    value: parseInt(v.y.toString()),
                  })) || []
                }
              />
            </TabsContent>
            <TabsContent value="volume" className="mt-0">
              <LineChart
                data={
                  volumePerDay?.map((v) => ({
                    time: (v.x.getTime() / 1000) as UTCTimestamp,
                    value: parseInt(toUserUnitsString(BigInt(v.y))),
                  })) || []
                }
              />
            </TabsContent>
            <TabsContent value="map" className="mt-0">
              <LocationMap
                style={{
                  height: "350px",
                  width: "100%",
                  zIndex: 1,
                }}
                marker={<VoucherChip voucher_address={voucherAddress} />}
                value={
                  voucher?.geo
                    ? {
                        latitude: voucher.geo?.x,
                        longitude: voucher.geo?.y,
                      }
                    : undefined
                }
              />
            </TabsContent>
            <TabsContent value="network" className="mt-0">
              <div style={{ height: "350px", width: "100%" }}>
                <VoucherForceGraph dateRange={dateRange} voucherAddress={voucherAddress} />
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
