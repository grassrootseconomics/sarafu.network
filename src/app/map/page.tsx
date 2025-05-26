import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { getAddress } from "viem";
import { DataMap, type MapDataItemPoint } from "~/components/map/data-map";
import { caller } from "~/server/api/routers/_app";

export const revalidate = 21600; // 6 hours

async function MapPage() {
  const [vouchersWithGeo, reportsResult] = await Promise.all([
    caller.voucher.list(),
    caller.report.list({
      limit: 2000,
    }),
  ]);

  const voucherGeoMap = new Map<
    `0x${string}`,
    { lat: number; lon: number; name?: string }
  >();
  vouchersWithGeo.forEach((v) => {
    if (v.geo?.x && v.geo?.y) {
      const address = getAddress(v.voucher_address);
      voucherGeoMap.set(address, {
        lat: v.geo.x,
        lon: v.geo.y,
        name: v.voucher_name,
      });
    }
  });

  const mapPointsData: MapDataItemPoint[] = [];

  vouchersWithGeo.forEach((v) => {
    const address = getAddress(v.voucher_address);
    if (v.geo?.x && v.geo?.y) {
      mapPointsData.push({
        type: "voucher",
        id: `voucher-${address}`,
        href: `/vouchers/${address}`,
        latitude: v.geo.x,
        longitude: v.geo.y,
        data: {
          voucher_address: address,
          title: v.voucher_name ?? "Unnamed Voucher",
          image: v.banner_url ?? "",
          description: v.voucher_description,
        },
      });
    }
  });

  const reports = reportsResult?.items;
  if (reports) {
    mapPointsData.push(
      ...reports
        .filter((r) => r.location?.x && r.location?.y)
        .map(
          (r) =>
            ({
              type: "report",
              href: `/reports/${r.id}`,
              id: `report-${r.id}`,
              latitude: r.location!.x,
              longitude: r.location!.y,
              data: {
                id: r.id,
                title: r.title ?? "Untitled Report",
                description: r.description ?? "",
                image: r.image_url ?? "",
                tags: r.tags ?? [],
              },
            } as const)
        )
    );
  }

  return (
    <div className="h-[calc(100vh-72px)] w-full rounded-xl overflow-hidden">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <DataMap items={mapPointsData} />
      </Suspense>
    </div>
  );
}

export default MapPage;
