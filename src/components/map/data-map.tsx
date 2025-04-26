"use client";

import type { FeatureCollection, Point, Polygon } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  Popup,
  Source,
  type LayerProps,
  type MapLayerMouseEvent,
  type MapRef,
  type MapProps as ReactMapGLProps,
} from "react-map-gl";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "YOUR_MAPBOX_ACCESS_TOKEN";

// Define a color palette for pools
const poolColors = [
  "#3366cc", // Blue
  "#dc3912", // Red
  "#ff9900", // Orange
  "#109618", // Green
  "#990099", // Purple
  "#0099c6", // Cyan
  "#dd4477", // Pink
  "#66aa00", // Lime Green
  "#b82e2e", // Dark Red
  "#316395", // Dark Blue
];

export interface MapDataBase {
  id: string;
  latitude: number;
  longitude: number;
  href: string;
}

export interface MapDataVoucher extends MapDataBase {
  type: "voucher";
  data: {
    voucher_address: `0x${string}`;
    voucher_name: string;
  };
}

export interface MapDataPoolPoint extends MapDataBase {
  type: "pool";
  data: {
    id: string;
    name: string;
  };
}

export interface MapDataReport extends MapDataBase {
  type: "report";
  data: {
    id: number;
    title: string;
  };
}

export type MapDataItemPoint =
  | MapDataVoucher
  | MapDataPoolPoint
  | MapDataReport;

export interface MapDataPoolPolygon {
  type: "pool_polygon";
  id: string;
  name: string;
  coordinates: number[][];
  href?: string;
}

export type MapDataItem = MapDataItemPoint | MapDataPoolPolygon;

interface MapItemPointFeatureProperties {
  id: string;
  type: MapDataItemPoint["type"];
  data: MapDataItemPoint["data"];
  href: string;
}

interface MapItemPolygonFeatureProperties {
  id: string;
  type: "pool_polygon";
  name: string;
  href?: string;
}

type MapFeatureProperties =
  | MapItemPointFeatureProperties
  | MapItemPolygonFeatureProperties;

interface PopupFeatureInfo {
  longitude: number;
  latitude: number;
  properties: MapFeatureProperties;
}

interface DataMapProps extends Omit<ReactMapGLProps, "children"> {
  items: Readonly<MapDataItemPoint[]>;
  polygons?: Readonly<MapDataPoolPolygon[]>;
}

function getPopupContent(properties: MapFeatureProperties) {
  switch (properties.type) {
    case "voucher":
      const voucher = properties.data as MapDataVoucher["data"];
      return (
        <div>
          <h4 className="font-semibold mb-1">Voucher</h4>
          <p>{voucher.voucher_name}</p>
          <Link
            href={properties.href}
            className="text-blue-600 hover:underline text-sm mt-1 block"
          >
            View Details
          </Link>
        </div>
      );
    case "pool":
      const poolPoint = properties.data as MapDataPoolPoint["data"];
      return (
        <div>
          <h4 className="font-semibold mb-1">Pool (Point)</h4>
          <p>{poolPoint.name ?? `Pool ${poolPoint.id}`}</p>
          <Link
            href={properties.href}
            className="text-blue-600 hover:underline text-sm mt-1 block"
          >
            View Details
          </Link>
        </div>
      );
    case "report":
      const report = properties.data as MapDataReport["data"];
      return (
        <div>
          <h4 className="font-semibold mb-1">Report</h4>
          <p>{report.title ?? `Report ${report.id}`}</p>
          <Link
            href={properties.href}
            className="text-blue-600 hover:underline text-sm mt-1 block"
          >
            View Details
          </Link>
        </div>
      );
    case "pool_polygon":
      const polygon = properties;
      return (
        <div>
          <h4 className="font-semibold mb-1">Pool Area</h4>
          <p>{polygon.name}</p>
          {polygon.href && (
            <Link
              href={polygon.href}
              className="text-blue-600 hover:underline text-sm mt-1 block"
            >
              View Details
            </Link>
          )}
        </div>
      );
    default:
      const exhaustiveCheck: never = properties;
      console.error("Unhandled item type in getPopupContent:", exhaustiveCheck);
      return <p>Details unavailable</p>;
  }
}

const itemColors: Record<MapDataItemPoint["type"], string> = {
  voucher: "#d9534f",
  pool: "#428bca",
  report: "#5cb85c",
};

const voucherClusterLayer: LayerProps = {
  id: "voucher-clusters",
  type: "circle",
  source: "vouchers-source",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#f0ad4e",
      10,
      "#d9534f",
      50,
      "#c9302c",
    ],
    "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 50, 25],
    "circle-stroke-width": 1,
    "circle-stroke-color": "#fff",
  },
};

const voucherClusterCountLayer: LayerProps = {
  id: "voucher-cluster-count",
  type: "symbol",
  source: "vouchers-source",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
  },
  paint: {
    "text-color": "#ffffff",
  },
};

const unclusteredVoucherPointLayer: LayerProps = {
  id: "unclustered-voucher-point",
  type: "circle",
  source: "vouchers-source",
  filter: [
    "all",
    ["!", ["has", "point_count"]],
    ["==", ["geometry-type"], "Point"],
    ["==", ["get", "type"], "voucher"],
  ],
  paint: {
    "circle-color": itemColors.voucher,
    "circle-radius": 5,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#fff",
  },
} as const;

const reportPointLayer: LayerProps = {
  id: "report-point",
  type: "circle",
  source: "other-features-source",
  filter: [
    "all",
    ["==", ["geometry-type"], "Point"],
    ["==", ["get", "type"], "report"],
  ],
  paint: {
    "circle-color": itemColors.report,
    "circle-radius": 5,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#fff",
  },
} as const;

const poolPolygonLayer: LayerProps = {
  id: "pool-polygons-fill",
  type: "fill",
  source: "other-features-source",
  filter: ["==", ["geometry-type"], "Polygon"],
  paint: {
    "fill-color": ["get", "color"],
    "fill-opacity": 0.4,
  },
};

const poolPolygonOutlineLayer: LayerProps = {
  id: "pool-polygons-outline",
  type: "line",
  source: "other-features-source",
  filter: ["==", ["geometry-type"], "Polygon"],
  paint: {
    "line-color": ["get", "color"],
    "line-width": 1.5,
  },
};

export function DataMap({
  items,
  polygons = [],
  style,
  initialViewState: initialViewStateProp,
  ...props
}: DataMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<PopupFeatureInfo | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<{
    [key in MapDataItemPoint["type"] | "pool_polygon"]: boolean;
  }>({
    voucher: true,
    pool: false,
    report: true,
    pool_polygon: true,
  });

  const initialViewState = {
    longitude: 38,
    latitude: 0,
    zoom: 1.5,
    ...initialViewStateProp,
  };

  const mapStyle = "mapbox://styles/mapbox/satellite-streets-v12";

  const { vouchersGeoJson, otherFeaturesGeoJson } = useMemo(() => {
    const voucherFeatures: GeoJSON.Feature<
      Point,
      MapItemPointFeatureProperties
    >[] = [];
    const otherPointFeatures: GeoJSON.Feature<
      Point,
      MapItemPointFeatureProperties
    >[] = [];
    const polygonFeatures: GeoJSON.Feature<
      Polygon,
      MapItemPolygonFeatureProperties & { color: string }
    >[] = [];

    items.forEach((item) => {
      const feature: GeoJSON.Feature<Point, MapItemPointFeatureProperties> = {
        type: "Feature",
        properties: {
          id: item.id,
          type: item.type,
          data: item.data,
          href: item.href,
        },
        geometry: {
          type: "Point",
          coordinates: [item.longitude, item.latitude],
        },
      };

      if (item.type === "voucher" && visibleLayers.voucher) {
        voucherFeatures.push(feature);
      } else if (item.type === "report" && visibleLayers.report) {
        otherPointFeatures.push(feature);
      }
    });

    if (visibleLayers.pool_polygon) {
      polygons.forEach((pool, index) => {
        const coords = pool.coordinates;
        if (!coords || coords.length < 3) {
          console.warn(
            `Pool ${pool.id} has fewer than 3 coordinates, skipping polygon.`
          );
          return;
        }

        let sumLon = 0;
        let sumLat = 0;
        let validCoordCount = 0;
        for (const coord of coords) {
          const lon = coord?.[0];
          const lat = coord?.[1];
          if (typeof lon === "number" && typeof lat === "number") {
            sumLon += lon;
            sumLat += lat;
            validCoordCount++;
          }
        }

        if (validCoordCount < 3) {
          console.warn(
            `Pool ${pool.id} has fewer than 3 valid coordinates after filtering, skipping polygon.`
          );
          return;
        }

        const centroidLon = sumLon / validCoordCount;
        const centroidLat = sumLat / validCoordCount;

        const sortedCoordinates = [...coords]
          .filter(
            (coord) =>
              typeof coord?.[0] === "number" && typeof coord?.[1] === "number"
          )
          .sort((a, b) => {
            const lonA = a[0]!;
            const latA = a[1]!;
            const lonB = b[0]!;
            const latB = b[1]!;

            const angleA = Math.atan2(latA - centroidLat, lonA - centroidLon);
            const angleB = Math.atan2(latB - centroidLat, lonB - centroidLon);
            return angleA - angleB;
          });

        const firstCoord = sortedCoordinates[0];
        const closedCoords = firstCoord
          ? [...sortedCoordinates, firstCoord]
          : sortedCoordinates;

        const color = poolColors[index % poolColors.length] ?? poolColors[0]!;

        polygonFeatures.push({
          type: "Feature",
          properties: {
            id: pool.id,
            type: "pool_polygon",
            name: pool.name,
            href: pool.href,
            color: color,
          },
          geometry: {
            type: "Polygon",
            coordinates: [closedCoords],
          },
        });
      });
    }

    const vouchersGeoJson: FeatureCollection<
      Point,
      MapItemPointFeatureProperties
    > = {
      type: "FeatureCollection",
      features: voucherFeatures,
    };

    const otherFeaturesGeoJson: FeatureCollection<
      Point | Polygon,
      MapFeatureProperties
    > = {
      type: "FeatureCollection",
      features: [...otherPointFeatures, ...polygonFeatures] as GeoJSON.Feature<
        Point | Polygon,
        MapFeatureProperties
      >[],
    };

    return { vouchersGeoJson, otherFeaturesGeoJson };
  }, [items, polygons, visibleLayers]);

  const handleLayerToggle = (
    layerType: MapDataItemPoint["type"] | "pool_polygon"
  ) => {
    setVisibleLayers((prev) => ({ ...prev, [layerType]: !prev[layerType] }));
    setPopupInfo(null);
  };

  const handleClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];

      if (!feature || !feature.layer) {
        if (popupInfo) setPopupInfo(null);
        return;
      }

      event.preventDefault();

      const layerId = feature.layer.id;
      const sourceId = feature.source;

      if (
        layerId === voucherClusterLayer.id &&
        sourceId === "vouchers-source"
      ) {
        if (feature.geometry.type === "Point") {
          const clusterId = feature.properties?.cluster_id as number;
          if (!clusterId) return;

          const mapboxSource = mapRef.current?.getSource("vouchers-source");

          if (
            mapboxSource &&
            typeof (mapboxSource as mapboxgl.GeoJSONSource)
              .getClusterExpansionZoom === "function"
          ) {
            (mapboxSource as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
              clusterId,
              (
                err: Error | null | undefined,
                zoom: number | null | undefined
              ) => {
                if (
                  err ||
                  !feature.geometry ||
                  feature.geometry.type !== "Point" ||
                  !feature.geometry.coordinates
                ) {
                  console.error(
                    "Error getting cluster expansion zoom or missing coordinates:",
                    err
                  );
                  return;
                }
                const targetZoom =
                  typeof zoom === "number" ? Math.min(zoom + 1, 15) : 5;
                mapRef.current?.flyTo({
                  center: feature.geometry.coordinates as [number, number],
                  zoom: targetZoom,
                  essential: true,
                  duration: 500,
                });
              }
            );
          } else {
            console.warn(
              "Source 'vouchers-source' not found or doesn't support clustering."
            );
          }
        }
        return;
      }

      if (
        layerId === unclusteredVoucherPointLayer.id &&
        sourceId === "vouchers-source"
      ) {
        if (
          feature.geometry.type === "Point" &&
          feature.geometry.coordinates &&
          feature.geometry.coordinates.length >= 2
        ) {
          const properties =
            feature.properties as MapItemPointFeatureProperties;
          setPopupInfo({
            longitude: feature.geometry.coordinates[0]!,
            latitude: feature.geometry.coordinates[1]!,
            properties: properties,
          });
        } else {
          console.warn(
            "Voucher point feature missing valid coordinates or geometry type mismatch."
          );
        }
        return;
      }

      if (
        layerId === reportPointLayer.id &&
        sourceId === "other-features-source"
      ) {
        if (
          feature.geometry.type === "Point" &&
          feature.geometry.coordinates &&
          feature.geometry.coordinates.length >= 2
        ) {
          const properties =
            feature.properties as MapItemPointFeatureProperties;
          setPopupInfo({
            longitude: feature.geometry.coordinates[0]!,
            latitude: feature.geometry.coordinates[1]!,
            properties: properties,
          });
        } else {
          console.warn(
            "Report point feature missing valid coordinates or geometry type mismatch."
          );
        }
        return;
      }

      if (
        layerId === poolPolygonLayer.id &&
        sourceId === "other-features-source"
      ) {
        if (feature.geometry.type === "Polygon") {
          const properties =
            feature.properties as MapItemPolygonFeatureProperties;
          setPopupInfo({
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat,
            properties: properties,
          });
        } else {
          console.warn("Polygon layer click feature is not a Polygon.");
        }
        return;
      }

      if (popupInfo) {
        setPopupInfo(null);
      }
    },
    [popupInfo]
  );

  function getLayerLabel(layerType: string): string {
    switch (layerType) {
      case "pool_polygon":
        return "Pool Areas";
      case "voucher":
        return "Vouchers";
      case "report":
        return "Reports";
      default:
        return `${layerType.charAt(0).toUpperCase() + layerType.slice(1)}s`;
    }
  }

  const interactiveLayerIds = useMemo(
    () =>
      [
        voucherClusterLayer.id,
        unclusteredVoucherPointLayer.id,
        reportPointLayer.id,
        poolPolygonLayer.id,
      ].filter(Boolean) as string[],
    []
  );

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
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
        interactiveLayerIds={interactiveLayerIds}
        onClick={handleClick}
        cursor={props.cursor ?? "auto"}
        interactive
        onMouseMove={(e) => {
          const features = e.features ?? [];
          const isInteractive = features.some(
            (f) => f.layer && interactiveLayerIds.includes(f.layer.id)
          );
          if (mapRef.current) {
            mapRef.current.getCanvas().style.cursor = isInteractive
              ? "pointer"
              : "";
          }
        }}
        onMouseLeave={() => {
          if (mapRef.current) {
            mapRef.current.getCanvas().style.cursor = "";
          }
        }}
      >
        <Source
          id="vouchers-source"
          type="geojson"
          data={vouchersGeoJson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...voucherClusterLayer} />
          <Layer {...voucherClusterCountLayer} />
          <Layer {...unclusteredVoucherPointLayer} />
        </Source>

        <Source
          id="other-features-source"
          type="geojson"
          data={otherFeaturesGeoJson}
          cluster={false}
        >
          <Layer {...poolPolygonLayer} />
          <Layer {...poolPolygonOutlineLayer} />
          <Layer {...reportPointLayer} />
        </Source>

        {popupInfo && (
          <Popup
            anchor="bottom"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            offset={15}
            maxWidth="250px"
          >
            {getPopupContent(popupInfo.properties)}
          </Popup>
        )}
      </Map>

      <Card className="absolute top-4 right-4 z-10 w-auto min-w-[150px] bg-background/80 backdrop-blur-sm">
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium">Layers</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {(Object.keys(visibleLayers) as Array<keyof typeof visibleLayers>)
            .filter((layerType) => layerType !== "pool")
            .map((layerType) => (
              <div key={layerType} className="flex items-center space-x-2">
                <Checkbox
                  id={`layer-${layerType}`}
                  checked={visibleLayers[layerType]}
                  onCheckedChange={() => handleLayerToggle(layerType)}
                  aria-label={`Toggle ${getLayerLabel(layerType)} layer`}
                />
                <Label
                  htmlFor={`layer-${layerType}`}
                  className="capitalize text-xs select-none cursor-pointer"
                >
                  {getLayerLabel(layerType)}
                </Label>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
