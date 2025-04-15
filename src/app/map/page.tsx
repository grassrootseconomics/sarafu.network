import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { DataMap, type MapDataItem } from "~/components/map/data-map";
import { caller } from "~/server/api/routers/_app";

// Define expected shapes (adjust based on actual tRPC output types)
interface Geo {
  x: number;
  y: number;
}
interface VoucherItem {
  voucher_address: string;
  voucher_name?: string;
  geo?: Geo | null;
}
interface PoolItem {
  id: string;
  name?: string;
  geo?: Geo | null;
}
interface ReportItem {
  id: string;
  title?: string;
  geo?: Geo | null;
}

async function MapPage() {
  // Fetch data in parallel
  const [vouchers, pools, reports] = await Promise.all([
    caller.voucher.list(),
    caller.pool.list({}), // Assuming api.pool.list exists
    caller.report.list(), // Assuming api.report.list exists
  ]);

  // Transform data for the map component
  const mapData: MapDataItem[] = [
    ...vouchers
      .filter((v: VoucherItem) => v.geo?.x && v.geo?.y)
      .map(
        (v: VoucherItem) =>
          ({
            type: "voucher",
            id: v.voucher_address,
            latitude: v.geo!.x,
            longitude: v.geo!.y,
            data: v,
          } as const) // Assert as const for type safety
      ),
    ...pools
      .filter((p) => p.geo?.x && p.geo?.y) // Assuming Pool type has geo {x, y}
      .map(
        (p) =>
          ({
            type: "pool",
            id: p.contract_address, // Assuming Pool type has id
            latitude: p.geo!.x,
            longitude: p.geo!.y,
            data: p,
          } as const)
      ),
    ...reports?.items
      .filter((r) => r.location?.x && r.location?.y) // Assuming Report type has geo {x, y}
      .map(
        (r) =>
          ({
            type: "report",
            id: r.id.toString(), // Assuming Report type has id
            latitude: r.location!.x,
            longitude: r.location!.y,
            data: r,
          } as const)
      ),
  ];

  return (
    <div className="h-[calc(100vh-64px)] w-full ">
      {/* Adjust height as needed */}
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <DataMap items={mapData} />
      </Suspense>
    </div>
  );
}

export default MapPage;
