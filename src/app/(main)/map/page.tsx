import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { getAddress } from "viem";
import { DataMap, type MapDataItemPoint } from "~/components/map/data-map";
import { caller } from "~/server/api/routers/_app";
import { cacheWithExpiry } from "~/utils/cache/cache";
import { pointToLatLng } from "~/utils/units/geo";

export const revalidate = 3600; // 1 hour

async function MapPage() {
  const [vouchersWithGeo, reportsResult] = await cacheWithExpiry(
    "map-page",
    3600,
    async () => {
      return await Promise.all([
        caller.voucher.list({}),
        caller.report.list({
          limit: 2000,
        }),
      ]);
    },
  );

  const mapPointsData: MapDataItemPoint[] = [];

  for (const v of vouchersWithGeo) {
    const latLng = pointToLatLng(v.geo);
    if (!latLng) continue;
    const address = getAddress(v.voucher_address);
    mapPointsData.push({
      type: "voucher",
      id: `voucher-${address}`,
      href: `/vouchers/${address}`,
      latitude: latLng.latitude,
      longitude: latLng.longitude,
      data: {
        voucher_address: address,
        title: v.voucher_name ?? "Unnamed Voucher",
        image: v.banner_url ?? "",
        description: v.voucher_description,
      },
    });
  }

  const reports = reportsResult?.items;
  if (reports) {
    for (const r of reports) {
      const latLng = pointToLatLng(r.location);
      if (!latLng) continue;
      mapPointsData.push({
        type: "report",
        href: `/reports/${r.id}`,
        id: `report-${r.id}`,
        latitude: latLng.latitude,
        longitude: latLng.longitude,
        data: {
          id: r.id,
          title: r.title ?? "Untitled Report",
          description: r.description ?? "",
          image: r.image_url ?? "",
          tags: r.tags ?? [],
        },
      });
    }
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
