import React, { useState } from "react";
import {
  MapContainer,
  MapContainerProps,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
// @ts-ignore
import "leaflet/dist/leaflet.css";

interface LocationMapProps extends MapContainerProps {
  onLocationSelected: (latLong: string) => void;
}

interface Position {
  lat: number;
  lng: number;
}

const LocationMap: React.FC<LocationMapProps> = ({
  onLocationSelected,
  ...props
}) => {
  const [position, setPosition] = useState<Position | null>(null);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
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
      style={{ height: "100vh", width: "100%" }}
      {...props}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEvents />
    </MapContainer>
  );
};

export default LocationMap;
