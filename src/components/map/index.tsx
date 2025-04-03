"use client";
import {
  Icon,
  type LatLngBounds,
  type LatLngExpression,
  type LeafletEventHandlerFnMap,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import {
  MapContainer,
  type MapContainerProps,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "react-leaflet-markercluster/styles";

// Dynamically import MarkerClusterGroup with no SSR

export const markerIcon = new Icon({
  iconUrl: "/marker.svg",
  iconSize: [30, 30],
});

export interface MapProps<T> extends MapContainerProps {
  items?: T[];
  onItemClicked?: (item: T) => void;
  getTooltip: (item: T) => string;
  getLatLng: (item: T) => LatLngExpression | undefined;
  mapEvents?: LeafletEventHandlerFnMap;
  onZoomChange?: (zoom: number) => void;
  onBoundsChange?: (bounds: LatLngBounds) => void;
}

export default function Map<T>({
  onItemClicked,
  mapEvents,
  getTooltip,
  getLatLng,
  items,
  onZoomChange,
  onBoundsChange,
  ...props
}: MapProps<T>) {
  const MapEvents = () => {
    const events = {
      ...mapEvents,
      zoomend: () => {
        if (onZoomChange) {
          onZoomChange(map.getZoom());
        }
      },
      moveend: () => {
        if (onBoundsChange) {
          onBoundsChange(map.getBounds());
        }
      },
    };
    const map = useMapEvents(events);
    return null;
  };

  const RemoveWaterMark = () => {
    const map = useMap();
    map.attributionControl.setPrefix("");
    return null;
  };

  // Memoize markers array creation
  const markers = useMemo(() => {
    return items
      ?.map((item, idx) => {
        const position = getLatLng(item);
        if (!position) return null;

        return (
          <Marker
            eventHandlers={{
              click: () => {
                if (onItemClicked) {
                  onItemClicked(item);
                }
              },
            }}
            key={idx}
            position={position}
            icon={markerIcon}
          >
            {getTooltip && <Tooltip>{getTooltip(item)}</Tooltip>}
          </Marker>
        );
      })
      .filter(Boolean);
  }, [items, getLatLng, onItemClicked, getTooltip]);

  return (
    <MapContainer
      center={[0, 38]}
      zoom={3}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      {...props}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers && markers.length > 0 && (
        <MarkerClusterGroup
          polygonOptions={{
            lineCap: "round",
            lineJoin: "round",
          }}
          chunkedLoading
          spiderfyOnMaxZoom
        >
          {markers}
        </MarkerClusterGroup>
      )}
      <MapEvents />
      <RemoveWaterMark />
    </MapContainer>
  );
}
