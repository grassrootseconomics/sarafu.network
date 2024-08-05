import {
  Icon,
  type LatLngExpression,
  type LeafletEventHandlerFnMap,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMapEvents,
  type MapContainerProps,
} from "react-leaflet";
export const markerIcon = new Icon({
  iconUrl: "/marker.svg",
  iconSize: [30, 30],
});
interface MapProps<T = object> extends MapContainerProps {
  items?: T[];
  onItemClicked?: (item: T) => void;
  getTooltip: (item: T) => string;
  getLatLng: (item: T) => LatLngExpression;

  mapEvents?: LeafletEventHandlerFnMap;
}

function Map<T = object>({
  onItemClicked,
  mapEvents,
  getTooltip,
  getLatLng,
  items,
  ...props
}: MapProps<T>) {
  const MapEvents = () => {
    useMapEvents(mapEvents || {});
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
      {items?.map((item, idx) => (
        <Marker
          eventHandlers={{
            click: () => {
              if (onItemClicked) {
                onItemClicked(item);
              }
            },
          }}
          key={idx}
          position={getLatLng(item)}
          icon={markerIcon}
        >
          {getTooltip && <Tooltip>{getTooltip(item)}</Tooltip>}
        </Marker>
      ))}
      <MapEvents />
    </MapContainer>
  );
}

export default Map;
