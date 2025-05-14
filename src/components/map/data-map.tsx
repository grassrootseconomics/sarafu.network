"use client";

import type { FeatureCollection, Point, Polygon } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  Source,
  type LayerProps,
  type MapMouseEvent,
  type MapRef,
  type MapProps as ReactMapGLProps,
} from "react-map-gl/mapbox";
import { cn } from "~/lib/utils";
import { Icons } from "../icons";
const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "YOUR_MAPBOX_ACCESS_TOKEN";

const spiderRadius = 0.001;
const spiderGroupingRadius = 0.0001;

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
    title: string;
    image: string;
    description: string;
  };
}

export interface MapDataReport extends MapDataBase {
  type: "report";
  data: {
    id: number;
    title: string;
    description: string;
    image: string;
    tags: string[];
  };
}

export type MapDataItemPoint = MapDataVoucher | MapDataReport;

export type MapDataItem = MapDataItemPoint;

interface MapItemPointFeatureProperties {
  id: string;
  type: MapDataItemPoint["type"];
  data: MapDataItemPoint["data"];
  href: string;
  isSpiderPoint?: boolean;
}

type MapFeatureProperties = MapItemPointFeatureProperties;

interface DataMapProps extends Omit<ReactMapGLProps, "children"> {
  items: Readonly<MapDataItemPoint[]>;
}

// Define interface for overlapping point groups
interface OverlappingPointGroup {
  key: string;
  points: MapDataItemPoint[];
  latitude: number;
  longitude: number;
}

// Helper function to detect overlapping points
function findOverlappingPoints(
  items: Readonly<MapDataItemPoint[]>
): OverlappingPointGroup[] {
  const pointGroups = groupPointsByLocation(items);
  return createOverlappingGroups(pointGroups);
}

// Group points by their location using a precision-based key
function groupPointsByLocation(
  items: Readonly<MapDataItemPoint[]>
): Record<string, MapDataItemPoint[]> {
  const pointGroups: Record<string, MapDataItemPoint[]> = {};
  const precision = 5;

  items.forEach((item) => {
    const key = `${item.latitude.toFixed(precision)},${item.longitude.toFixed(
      precision
    )}`;
    if (!pointGroups[key]) {
      pointGroups[key] = [];
    }
    pointGroups[key].push(item);
  });

  return pointGroups;
}

// Create overlapping groups from grouped points
function createOverlappingGroups(
  pointGroups: Record<string, MapDataItemPoint[]>
): OverlappingPointGroup[] {
  const overlappingGroups: OverlappingPointGroup[] = [];

  Object.entries(pointGroups).forEach(([key, points]) => {
    if (points.length > 1) {
      // Calculate the average position for the group
      const avgLat =
        points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
      const avgLng =
        points.reduce((sum, p) => sum + p.longitude, 0) / points.length;

      overlappingGroups.push({
        key,
        points,
        latitude: avgLat,
        longitude: avgLng,
      });
    }
  });

  return overlappingGroups;
}

// Function to create a spider arrangement of points
function createSpiderPoints(
  center: [number, number],
  points: MapDataItemPoint[],
  radius = spiderRadius
) {
  // Use a larger radius for more points
  const adjustedRadius = points.length > 5 ? radius * 1.5 : radius;

  return points.map((point, index) => {
    const angle = (Math.PI * 2 * index) / points.length;
    const newPoint = {
      ...point,
      originalLatitude: point.latitude,
      originalLongitude: point.longitude,
      latitude: center[1] + Math.sin(angle) * adjustedRadius,
      longitude: center[0] + Math.cos(angle) * adjustedRadius,
      isSpiderPoint: true, // This flag is important for identification
    };
    return newPoint;
  });
}

// Get card content based on feature properties
function getCardContent(properties: MapFeatureProperties) {
  if ("data" in properties && typeof properties.data === "string") {
    // Mapbox returns data as a string, so we need to parse it
    properties.data = JSON.parse(properties.data) as MapDataItemPoint["data"];
  }

  return getCardContentByType(properties);
}

// Get card content based on feature type
function getCardContentByType(properties: MapFeatureProperties) {
  switch (properties.type) {
    case "voucher":
      const voucher = properties.data as MapDataVoucher["data"];
      return {
        type: "voucher" as const,
        title: voucher.title,
        description: voucher.description.slice(0, 100),
        href: properties.href,
        image: voucher.image,
      };
    case "report":
      const report = properties.data as MapDataReport["data"];
      return {
        type: "report" as const,
        title: report.title,
        description: report.description.slice(0, 100),
        href: properties.href,
        image: report.image,
        tags: report.tags,
      };
    default:
      const exhaustiveCheck = properties;
      console.error("Unhandled item type in getCardContent:", exhaustiveCheck);
      return {
        type: "unknown" as const,
        title: "Unknown",
        description: "Details unavailable",
        href: "#",
        image: "/images/placeholder.png",
      };
  }
}

const itemColors: Record<MapDataItemPoint["type"], string> = {
  voucher: "#d9534f",
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

export function DataMap({
  items,
  style,
  initialViewState: initialViewStateProp,
  ...props
}: DataMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedFeature, setSelectedFeature] =
    useState<MapFeatureProperties | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<{
    [key in MapDataItemPoint["type"]]: boolean;
  }>({
    voucher: true,
    report: true,
  });
  const [spiderfiedPoints, setSpiderfiedPoints] = useState<MapDataItemPoint[]>(
    []
  );
  const [spiderfiedCenter, setSpiderfiedCenter] = useState<
    [number, number] | null
  >(null);
  // Add a ref to track if we're currently handling a map click
  const isHandlingMapClick = useRef(false);

  const initialViewState = {
    longitude: 38,
    latitude: 0,
    zoom: 1.5,
    ...initialViewStateProp,
  };

  const mapStyle = "mapbox://styles/mapbox/satellite-streets-v12";

  // Find overlapping points
  const overlappingPointGroups = useMemo(() => {
    return findOverlappingPoints(items);
  }, [items]);

  const {
    vouchersGeoJson,
    otherFeaturesGeoJson,
    spiderfiedGeoJson,
    spiderCenterGeoJson,
    spiderLinesGeoJson,
  } = useMemo(() => {
    return createGeoJsonData({
      items,
      visibleLayers,
      spiderfiedPoints,
      spiderfiedCenter,
    });
  }, [items, visibleLayers, spiderfiedPoints, spiderfiedCenter]);

  const handleLayerToggle = (layerType: MapDataItemPoint["type"]) => {
    setVisibleLayers((prev) => ({ ...prev, [layerType]: !prev[layerType] }));
    setSelectedFeature(null);
    setSpiderfiedPoints([]);
    setSpiderfiedCenter(null);
  };

  // Close spiderfier when clicking elsewhere on map
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Skip if we're currently handling a map click on a feature
      if (isHandlingMapClick.current) {
        return;
      }

      if (spiderfiedPoints.length > 0) {
        const target = e.target as HTMLElement;

        // Check if the click is within the map container but not on a spiderfied point
        if (target.closest(".mapboxgl-canvas-container")) {
          // Check if we clicked on a spiderfied point element
          const targetElement = target as HTMLElement & {
            isSpiderPoint?: boolean;
          };
          const isSpiderPointClick =
            targetElement.isSpiderPoint ||
            target.closest('[data-is-spider-point="true"]');

          if (isSpiderPointClick) {
            return;
          }

          setSpiderfiedPoints([]);
          setSpiderfiedCenter(null);
        }
      }
    };

    // Use a timeout to ensure this runs after the map click handler
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleDocumentClick);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [spiderfiedPoints]);

  const handleClick = useCallback(
    (event: MapMouseEvent) => {
      // Set the flag to prevent the document click handler from running
      isHandlingMapClick.current = true;

      // Reset the flag after this event cycle
      setTimeout(() => {
        isHandlingMapClick.current = false;
      }, 100); // Increased timeout to ensure it's not cleared too quickly

      const feature = event.features?.[0];

      if (!feature || !feature.layer) {
        handleEmptyFeatureClick(event);
        return;
      }

      event.preventDefault();

      const layerId = feature.layer.id;
      const sourceId = feature.source;

      // Handle different types of clicks
      if (sourceId && isClusterClick(layerId, sourceId)) {
        handleClusterClick(feature);
      } else if (sourceId && isPointClick(layerId, sourceId)) {
        handlePointClick(feature, event);
      } else {
        // Clear selection for other clicks but NOT spiderfied points
        if (selectedFeature) {
          setSelectedFeature(null);
        }
      }
    },
    [
      selectedFeature,
      overlappingPointGroups,
      spiderfiedCenter,
      spiderfiedPoints,
    ]
  );

  // Helper functions for handleClick
  function handleEmptyFeatureClick(event: MapMouseEvent) {
    // Don't clear selection if clicking on a spiderfied point
    if (
      event.target &&
      (event.target as { isSpiderPoint?: boolean }).isSpiderPoint
    ) {
      return;
    }

    // Otherwise clear selection but NOT spiderfied points
    if (selectedFeature) {
      setSelectedFeature(null);
    }
  }

  function isClusterClick(layerId: string, sourceId: string) {
    return layerId === voucherClusterLayer.id && sourceId === "vouchers-source";
  }

  function isPointClick(layerId: string, sourceId: string) {
    return (
      (layerId === unclusteredVoucherPointLayer.id &&
        sourceId === "vouchers-source") ||
      (layerId === reportPointLayer.id &&
        sourceId === "other-features-source") ||
      (layerId === "spiderfied-points" &&
        sourceId === "spiderfied-points-source")
    );
  }

  function handleClusterClick(feature: mapboxgl.MapboxGeoJSONFeature) {
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
          (err: Error | null | undefined, zoom: number | null | undefined) => {
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
  }

  function handlePointClick(
    feature: mapboxgl.MapboxGeoJSONFeature,
    _event: MapMouseEvent
  ) {
    if (
      feature.geometry.type === "Point" &&
      feature.geometry.coordinates &&
      feature.geometry.coordinates.length >= 2
    ) {
      const coordinates = feature.geometry.coordinates as [number, number];
      const properties = feature.properties as MapItemPointFeatureProperties;

      // If clicking on a spiderfied point, just show its details
      if (
        (feature.layer && feature.layer.id === "spiderfied-points") ||
        properties.isSpiderPoint
      ) {
        setSelectedFeature(properties);
        // Don't clear the spiderfied points
        return;
      }

      handleOverlappingPoints(coordinates, properties);
    }
  }

  function handleOverlappingPoints(
    coordinates: [number, number],
    properties: MapItemPointFeatureProperties
  ) {
    // Check if there are multiple points at this location
    const overlappingGroup = overlappingPointGroups.find(
      (group: OverlappingPointGroup) => {
        const distance = Math.sqrt(
          Math.pow(group.latitude - coordinates[1], 2) +
            Math.pow(group.longitude - coordinates[0], 2)
        );
        return distance < spiderGroupingRadius;
      }
    );

    if (overlappingGroup && overlappingGroup.points.length > 1) {
      // If we already have this group spiderfied, collapse it
      if (
        spiderfiedCenter &&
        Math.sqrt(
          Math.pow(spiderfiedCenter[1] - coordinates[1], 2) +
            Math.pow(spiderfiedCenter[0] - coordinates[0], 2)
        ) < spiderGroupingRadius
      ) {
        setSpiderfiedPoints([]);
        setSpiderfiedCenter(null);
        setSelectedFeature(null);
      } else {
        // Otherwise, spiderify the points
        const spiderPoints = createSpiderPoints(
          coordinates,
          overlappingGroup.points
        );
        setSpiderfiedPoints(spiderPoints);
        setSpiderfiedCenter(coordinates);
        setSelectedFeature(null);
      }
    } else {
      // Single point, just show its details
      setSelectedFeature(properties);
      setSpiderfiedPoints([]);
      setSpiderfiedCenter(null);
    }
  }

  function getLayerLabel(layerType: string): string {
    switch (layerType) {
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
        "spiderfied-points",
      ].filter(Boolean) as string[],
    []
  );

  // Spider point layer
  const spiderfiedPointLayer: LayerProps = {
    id: "spiderfied-points",
    type: "circle",
    source: "spiderfied-points-source",
    paint: {
      "circle-color": [
        "match",
        ["get", "type"],
        "voucher",
        itemColors.voucher,
        "report",
        itemColors.report,
        "#888888",
      ],
      "circle-radius": 5,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff",
      "circle-opacity": 1,
    },
    layout: {
      visibility: "visible",
    },
  } as const;

  // Spider center point layer
  const spiderCenterPointLayer: LayerProps = {
    id: "spider-center-point",
    type: "circle",
    source: "spider-center-source",
    paint: {
      "circle-color": "#000000",
      "circle-radius": 4,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
      "circle-opacity": 0.7,
    },
  } as const;

  // Spider lines layer
  const spiderLinesLayer: LayerProps = {
    id: "spider-lines",
    type: "line",
    source: "spider-lines-source",
    paint: {
      "line-color": "#ffffff",
      "line-width": 1.5,
      "line-opacity": 0.7,
      "line-dasharray": [1, 1],
    },
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
  } as const;

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-border/20">
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
          <Layer {...reportPointLayer} />
        </Source>

        {spiderfiedPoints.length > 0 && (
          <>
            <Source
              id="spider-lines-source"
              type="geojson"
              data={spiderLinesGeoJson}
            >
              <Layer {...spiderLinesLayer} />
            </Source>
            <Source
              id="spiderfied-points-source"
              type="geojson"
              data={spiderfiedGeoJson}
              cluster={false}
              generateId={true}
            >
              <Layer {...spiderfiedPointLayer} />
            </Source>
            <Source
              id="spider-center-source"
              type="geojson"
              data={spiderCenterGeoJson}
            >
              <Layer {...spiderCenterPointLayer} />
            </Source>
          </>
        )}
      </Map>
      <div className="absolute top-4 left-4 z-10 w-auto flex gap-2">
        {(Object.keys(visibleLayers) as Array<keyof typeof visibleLayers>).map(
          (layerType) => (
            <div key={layerType} className="flex items-center space-x-2">
              <button
                id={`layer-${layerType}`}
                onClick={() => handleLayerToggle(layerType)}
                aria-label={`Toggle ${getLayerLabel(layerType)} layer`}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm",
                  visibleLayers[layerType]
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-background/80 backdrop-blur-sm text-foreground/70 hover:bg-background/90 hover:text-foreground"
                )}
              >
                {layerType === "voucher" && <Icons.vouchers size={16} />}
                {layerType === "report" && <Icons.reports size={12} />}

                {getLayerLabel(layerType)}
              </button>
            </div>
          )
        )}
      </div>
      {selectedFeature && (
        <div className="absolute top-4 right-4 z-10 left-4 sm:left-[unset] w-[unset] sm:w-[320px] bg-background/95 backdrop-blur-md rounded-xl shadow-xl p-0 overflow-hidden border border-border/30">
          <button
            className="absolute top-3 right-3 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-background/80 text-foreground/60 hover:text-foreground hover:bg-background/90 transition-colors"
            onClick={() => setSelectedFeature(null)}
            aria-label="Close details"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
          {(() => {
            const content = getCardContent(selectedFeature);
            return (
              <div className="flex flex-col">
                {content?.image && (
                  <div className="w-full h-44 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <img
                      src={content.image}
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 z-10 p-4 w-full">
                      <div className="inline-flex items-center px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground mb-2">
                        {content.type?.charAt(0).toUpperCase() +
                          (content.type?.slice(1) || "")}
                      </div>
                      <h2 className="text-lg font-semibold text-white text-shadow-sm line-clamp-2">
                        {content.title}
                      </h2>
                    </div>
                  </div>
                )}

                <div className={cn("p-4", !content?.image && "pt-8")}>
                  {!content?.image && (
                    <>
                      <div className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground mb-2">
                        {content.type?.charAt(0).toUpperCase() +
                          (content.type?.slice(1) || "")}
                      </div>
                      <h2 className="text-lg font-semibold mb-2">
                        {content.title}
                      </h2>
                    </>
                  )}

                  {content?.tags && content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {content.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-secondary/70 text-secondary-foreground text-xs px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-foreground/80 mb-4 line-clamp-3">
                    {content.description}
                    {content.description?.length > 100 && "..."}
                  </p>

                  {content.href && (
                    <Link
                      href={content.href}
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      View Details
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-1.5"
                      >
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
      {/* Zoom controls */}
      <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-md flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-background/90 transition-colors shadow-sm"
          aria-label="Zoom in"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-md flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-background/90 transition-colors shadow-sm"
          aria-label="Zoom out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}

// Create GeoJSON data for map sources
function createGeoJsonData({
  items,
  visibleLayers,
  spiderfiedPoints,
  spiderfiedCenter,
}: {
  items: Readonly<MapDataItemPoint[]>;
  visibleLayers: { [key in MapDataItemPoint["type"]]: boolean };
  spiderfiedPoints: MapDataItemPoint[];
  spiderfiedCenter: [number, number] | null;
}) {
  const voucherFeatures: GeoJSON.Feature<
    Point,
    MapItemPointFeatureProperties
  >[] = [];
  const otherPointFeatures: GeoJSON.Feature<
    Point,
    MapItemPointFeatureProperties
  >[] = [];
  const spiderfiedFeatures: GeoJSON.Feature<
    Point,
    MapItemPointFeatureProperties & { isSpiderPoint?: boolean }
  >[] = [];

  // Create center point feature if spiderfied
  const centerPointFeature = createCenterPointFeature(spiderfiedCenter);

  // Create lines connecting spiderfied points to center
  const spiderLines = createSpiderLines(spiderfiedCenter, spiderfiedPoints);

  // Process regular points
  const processedPoints = new Set<string>();

  // First add spiderfied points if any
  if (spiderfiedPoints.length > 0) {
    addSpiderfiedPointsToFeatures(
      spiderfiedPoints,
      spiderfiedFeatures,
      processedPoints
    );
  }

  // Then process remaining points
  processRemainingPoints(
    items,
    processedPoints,
    spiderfiedCenter,
    visibleLayers,
    voucherFeatures,
    otherPointFeatures
  );

  return {
    vouchersGeoJson: {
      type: "FeatureCollection",
      features: voucherFeatures,
    } as FeatureCollection<Point, MapItemPointFeatureProperties>,
    otherFeaturesGeoJson: {
      type: "FeatureCollection",
      features: [...otherPointFeatures] as GeoJSON.Feature<
        Point | Polygon,
        MapFeatureProperties
      >[],
    } as FeatureCollection<Point | Polygon, MapFeatureProperties>,
    spiderfiedGeoJson: {
      type: "FeatureCollection",
      features: spiderfiedFeatures,
    } as FeatureCollection<
      Point,
      MapItemPointFeatureProperties & { isSpiderPoint?: boolean }
    >,
    spiderCenterGeoJson: {
      type: "FeatureCollection",
      features: centerPointFeature,
    } as FeatureCollection<Point, { isSpiderCenter: boolean }>,
    spiderLinesGeoJson: {
      type: "FeatureCollection",
      features: spiderLines,
    } as FeatureCollection<GeoJSON.LineString, Record<string, never>>,
  };
}

// Create center point feature for spider
function createCenterPointFeature(spiderfiedCenter: [number, number] | null) {
  return spiderfiedCenter
    ? [
        {
          type: "Feature",
          properties: { isSpiderCenter: true },
          geometry: {
            type: "Point",
            coordinates: spiderfiedCenter,
          },
        },
      ]
    : [];
}

// Create lines connecting spiderfied points to center
function createSpiderLines(
  spiderfiedCenter: [number, number] | null,
  spiderfiedPoints: MapDataItemPoint[]
) {
  const spiderLines: GeoJSON.Feature<
    GeoJSON.LineString,
    Record<string, never>
  >[] = [];

  if (spiderfiedCenter && spiderfiedPoints.length > 0) {
    spiderfiedPoints.forEach((point) => {
      spiderLines.push({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [spiderfiedCenter, [point.longitude, point.latitude]],
        },
      });
    });
  }

  return spiderLines;
}

// Add spiderfied points to features array
function addSpiderfiedPointsToFeatures(
  spiderfiedPoints: MapDataItemPoint[],
  spiderfiedFeatures: GeoJSON.Feature<
    Point,
    MapItemPointFeatureProperties & { isSpiderPoint?: boolean }
  >[],
  processedPoints: Set<string>
) {
  spiderfiedPoints.forEach((item) => {
    const feature: GeoJSON.Feature<
      Point,
      MapItemPointFeatureProperties & { isSpiderPoint?: boolean }
    > = {
      type: "Feature",
      properties: {
        id: item.id,
        type: item.type,
        data: item.data,
        href: item.href,
        isSpiderPoint: true,
      },
      geometry: {
        type: "Point",
        coordinates: [item.longitude, item.latitude],
      },
    };
    spiderfiedFeatures.push(feature);
    processedPoints.add(item.id);
  });
}

// Process remaining points that are not part of spiderfied groups
function processRemainingPoints(
  items: Readonly<MapDataItemPoint[]>,
  processedPoints: Set<string>,
  spiderfiedCenter: [number, number] | null,
  visibleLayers: { [key in MapDataItemPoint["type"]]: boolean },
  voucherFeatures: GeoJSON.Feature<Point, MapItemPointFeatureProperties>[],
  otherPointFeatures: GeoJSON.Feature<Point, MapItemPointFeatureProperties>[]
) {
  items.forEach((item) => {
    // Skip if this point is currently part of a spiderfied group
    if (processedPoints.has(item.id)) return;

    // Check if this point is part of an overlapping group that's currently spiderfied
    if (isPartOfSpiderfiedGroup(item, spiderfiedCenter)) return;

    const feature = createFeatureFromItem(item);

    if (item.type === "voucher" && visibleLayers.voucher) {
      voucherFeatures.push(feature);
    } else if (item.type === "report" && visibleLayers.report) {
      otherPointFeatures.push(feature);
    }
  });
}

// Check if a point is part of a spiderfied group
function isPartOfSpiderfiedGroup(
  item: MapDataItemPoint,
  spiderfiedCenter: [number, number] | null
) {
  return (
    spiderfiedCenter &&
    Math.sqrt(
      Math.pow(item.latitude - spiderfiedCenter[1], 2) +
        Math.pow(item.longitude - spiderfiedCenter[0], 2)
    ) < spiderGroupingRadius
  );
}

// Create a GeoJSON feature from a map item
function createFeatureFromItem(item: MapDataItemPoint) {
  return {
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
  } as GeoJSON.Feature<Point, MapItemPointFeatureProperties>;
}
