"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import Map, {
  Marker,
  Popup,
  type MapProps as ReactMapGLProps,
} from "react-map-gl";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox"; // Assuming Checkbox component exists
import { Label } from "~/components/ui/label"; // Assuming Label component exists

// TODO: Replace with your Mapbox access token
const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "YOUR_MAPBOX_ACCESS_TOKEN";

// Define the structure for map items
export interface MapDataItem {
  type: "voucher" | "pool" | "report"; // Add other types as needed
  id: string;
  latitude: number;
  longitude: number;
  data: unknown; // Store the original data object
}

interface DataMapProps extends Omit<ReactMapGLProps, "children"> {
  items: Readonly<MapDataItem[]>;
}

// Helper to get popup content based on type
function getPopupContent(item: MapDataItem) {
  switch (item.type) {
    case "voucher":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const voucher = item.data as any; // Type assertion, improve if possible
      return (
        <div>
          <h4 className="font-semibold mb-1">Voucher</h4>
          <p>{voucher.voucher_name}</p>
          <Link
            href={`/vouchers/${voucher.voucher_address}`}
            className="text-blue-600 hover:underline text-sm mt-1 block"
          >
            View Details
          </Link>
        </div>
      );
    case "pool":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pool = item.data as any; // Type assertion, improve if possible
      return (
        <div>
          <h4 className="font-semibold mb-1">Pool</h4>
          <p>{pool.name ?? `Pool ${pool.id}`}</p> {/* Adjust property names */}
          {/* Add link if pool details page exists */}
        </div>
      );
    case "report":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const report = item.data as any; // Type assertion, improve if possible
      return (
        <div>
          <h4 className="font-semibold mb-1">Report</h4>
          <p>{report.title ?? `Report ${report.id}`}</p>{" "}
          {/* Adjust property names */}
          {/* Add link if report details page exists */}
        </div>
      );
    default:
      return <p>Details unavailable</p>;
  }
}

// Helper to get marker style based on type
function getMarkerSvg(type: MapDataItem["type"]) {
  const color = {
    voucher: "#d00", // Red
    pool: "#00d", // Blue
    report: "#0d0", // Green
  }[type];

  return (
    <svg
      height="30"
      viewBox="0 0 24 24"
      style={{
        cursor: "pointer",
        fill: color,
        stroke: "#fff",
        strokeWidth: 1,
        transform: "translate(0, 15px)",
      }}
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

export function DataMap({
  items,
  style,
  initialViewState: initialViewStateProp,
  ...props
}: DataMapProps) {
  const [popupInfo, setPopupInfo] = useState<MapDataItem | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<{
    [key in MapDataItem["type"]]: boolean;
  }>({
    voucher: true,
    pool: true,
    report: true,
  });

  const initialViewState = {
    longitude: 38,
    latitude: 0,
    zoom: 1.5,
    ...initialViewStateProp,
  };

  const mapStyle = "mapbox://styles/mapbox/streets-v12";

  const handleMarkerClick = useCallback((item: MapDataItem) => {
    setPopupInfo(item);
  }, []);

  const handleLayerToggle = (layer: MapDataItem["type"]) => {
    setVisibleLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
    setPopupInfo(null); // Close popup when layers change
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => visibleLayers[item.type]);
  }, [items, visibleLayers]);

  const markers = useMemo(() => {
    return filteredItems.map((item) => (
      <Marker
        key={`${item.type}-${item.id}`}
        longitude={item.longitude}
        latitude={item.latitude}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          handleMarkerClick(item);
        }}
      >
        {getMarkerSvg(item.type)}
      </Marker>
    ));
  }, [filteredItems, handleMarkerClick]);

  return (
    <div className="relative h-full w-full">
      <Map
        {...props}
        initialViewState={initialViewState}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={mapStyle}
        style={{ height: "100%", width: "100%", ...style }}
        projection={{ name: "globe" }}
        logoPosition="bottom-left"
        terrain={{
          source: "mapbox-terrain-v2",
          exaggeration: 1.5,
        }}
      >
        {markers}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            offset={30} // Offset popup slightly above marker tip
          >
            {getPopupContent(popupInfo)}
          </Popup>
        )}
      </Map>

      {/* Layer Toggle Control */}
      <Card className="absolute top-4 right-4 z-10 w-48 bg-background/80 backdrop-blur-sm">
        <CardHeader className="p-3">
          <CardTitle className="text-sm">Layers</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {(
            Object.keys(visibleLayers) as Array<keyof typeof visibleLayers>
          ).map((layer) => (
            <div key={layer} className="flex items-center space-x-2">
              <Checkbox
                id={`layer-${layer}`}
                checked={visibleLayers[layer]}
                onCheckedChange={() => handleLayerToggle(layer)}
              />
              <Label htmlFor={`layer-${layer}`} className="capitalize text-xs">
                {layer}s {/* Simple pluralization */}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
