import {
  Icon,
  type LatLngBounds,
  type LatLngExpression,
  type LeafletEventHandlerFnMap,
} from "leaflet";
import {
  MapContainer,
  type MapContainerProps,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
export const markerIcon = new Icon({
  iconUrl: "/marker.svg",
  iconSize: [30, 30],
});

import "leaflet/dist/leaflet.css";

export interface MapProps<T> extends MapContainerProps {
  items?: T[];
  onItemClicked?: (item: T) => void;
  getTooltip: (item: T) => string;
  getLatLng: (item: T) => LatLngExpression | undefined;
  mapEvents?: LeafletEventHandlerFnMap;
  onZoomChange?: (zoom: number) => void;
  onBoundsChange?: (bounds: LatLngBounds) => void;
}

function Map<T>({
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
    const map = useMapEvents({
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
    });
    return null;
  };

  const RemoveWaterMark = () => {
    const map = useMap();
    map.attributionControl.setPrefix("");
    return null;
  };

  return (
    <MapContainer
      center={[0, 38]}
      zoom={6}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      {...props}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {getLatLng && items?.map((item, idx) => (
        <Marker
          eventHandlers={{
            click: () => {
              if (onItemClicked) {
                onItemClicked(item);
              }
            },
          }}
          key={idx}
          position={getLatLng(item) ?? [0, 0]}
          icon={markerIcon}
        >
          {getTooltip && <Tooltip>{getTooltip(item)}</Tooltip>}
        </Marker>
      ))}
      <MapEvents />
      <RemoveWaterMark />
    </MapContainer>
  );
}

export default Map;
