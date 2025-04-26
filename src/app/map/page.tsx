import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { getAddress } from "viem";
import {
  DataMap,
  type MapDataItemPoint,
  type MapDataPoolPolygon,
} from "~/components/map/data-map";
import { getSwapPool } from "~/components/pools/contract-functions";
import { publicClient } from "~/config/viem.config.server";
import { caller } from "~/server/api/routers/_app";

interface ApiReport {
  id: number;
  title?: string;
  location?: { x: number; y: number };
}

async function MapPage() {
  const [pools, vouchersWithGeo, reportsResult] = await Promise.all([
    caller.pool.list({}),
    caller.voucher.list(),
    caller.report.list(),
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

  const poolVoucherDetailsPromises = pools.map(async (pool) => {
    try {
      const poolDetails = await getSwapPool(
        publicClient,
        pool.contract_address as `0x${string}`
      );
      return {
        poolId: pool.contract_address,
        poolName: pool.pool_name,
        poolAddress: pool.contract_address,
        voucherAddresses: poolDetails.voucherDetails.map((vd) => vd.address),
      };
    } catch (error) {
      console.error(
        `Failed to fetch details for pool ${pool.pool_name} (${pool.contract_address}):`,
        error
      );
      return null;
    }
  });

  const poolVoucherDetails = (
    await Promise.all(poolVoucherDetailsPromises)
  ).filter((p): p is NonNullable<typeof p> => p !== null);

  const mapPointsData: MapDataItemPoint[] = [];
  const mapPolygonsData: MapDataPoolPolygon[] = [];
  const vouchersInPolygons = new Set<`0x${string}`>();

  poolVoucherDetails.forEach((poolInfo) => {
    const polygonCoords: number[][] = [];
    const voucherAddressesInPolygon: `0x${string}`[] = [];

    poolInfo.voucherAddresses.forEach((voucherAddress) => {
      const geo = voucherGeoMap.get(voucherAddress);
      if (geo) {
        polygonCoords.push([geo.lon, geo.lat]);
        voucherAddressesInPolygon.push(voucherAddress);
      }
    });

    if (polygonCoords.length >= 3) {
      mapPolygonsData.push({
        type: "pool_polygon",
        id: `pool-${poolInfo.poolId}`,
        name: poolInfo.poolName ?? `Pool ${poolInfo.poolId}`,
        coordinates: polygonCoords,
      });
      voucherAddressesInPolygon.forEach((addr) => vouchersInPolygons.add(addr));
    } else {
      console.warn(
        `Pool ${poolInfo.poolId} (${poolInfo.poolAddress}) has ${polygonCoords.length} geolocated vouchers. Needs 3+ for a polygon.`
      );
    }
  });

  vouchersWithGeo.forEach((v) => {
    const address = getAddress(v.voucher_address);
    if (v.geo?.x && v.geo?.y && !vouchersInPolygons.has(address)) {
      mapPointsData.push({
        type: "voucher",
        id: `voucher-${address}`,
        href: `/vouchers/${address}`,
        latitude: v.geo.x,
        longitude: v.geo.y,
        data: {
          voucher_address: address,
          voucher_name: v.voucher_name ?? "Unnamed Voucher",
        },
      });
    }
  });

  const reports = reportsResult?.items as ApiReport[] | undefined;
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
              },
            } as const)
        )
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] w-full ">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <DataMap items={mapPointsData} polygons={mapPolygonsData} />
      </Suspense>
    </div>
  );
}

export default MapPage;
