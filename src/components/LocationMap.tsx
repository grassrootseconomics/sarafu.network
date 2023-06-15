import { Icon, type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState } from "react";
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
interface LocationMapProps extends MapContainerProps {
  value?: LatLngExpression | undefined;
  onLocationSelected?: (latLong: string) => void;
}

interface Position {
  lat: number;
  lng: number;
}

const LocationMap: React.FC<LocationMapProps> = ({
  onLocationSelected,
  value,
  ...props
}) => {
  const [position, setPosition] = useState<LatLngExpression | undefined>(value);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (!onLocationSelected) return;
        setPosition(e.latlng);
        onLocationSelected(`${e.latlng.lat}, ${e.latlng.lng}`);
      },
    });

    return null;
  };

  return (
    <MapContainer
      center={position || [-3.654593340629959, 39.85153198242188]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      {...props}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker
        position={position || [-3.654593340629959, 39.85153198242188]}
        icon={markerIcon}
      ></Marker>
      <MapEvents />
    </MapContainer>
  );
};

export default LocationMap;
