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
  useMapEvents,
  type MapContainerProps,
} from "react-leaflet";
export const markerIcon = new Icon({
  iconUrl: "/marker.svg",
  iconSize: [30, 30],
});
interface MapProps<T> extends MapContainerProps {
  items?: T[];
  onItemClicked?: (item: T) => void;
  getLatLng: (item: T) => LatLngExpression;
  mapEvents?: LeafletEventHandlerFnMap;
}

function Map<T>({
  onItemClicked,
  mapEvents,
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
      center={[-3.654593340629959, 39.85153198242188]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      {...props}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {items?.map((item, idx) => (
        <Marker key={idx} position={getLatLng(item)} icon={markerIcon}></Marker>
      ))}
      <MapEvents />
    </MapContainer>
  );
}

export default Map;
