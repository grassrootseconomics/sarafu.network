import { Icon, type LeafletEvent } from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import "leaflet/dist/leaflet.css";
import React from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
  type MapContainerProps,
} from "react-leaflet";
export const markerIcon = new Icon({
  iconUrl: "/marker.svg",
  iconSize: [30, 30],
});
interface LocationMapProps extends MapContainerProps {
  value?:
    | {
        lat: number;
        lng: number;
      }
    | undefined;
  onChange?: (latLong: { lat: number; lng: number }) => void;
  disabled?: boolean;
}
const provider = new OpenStreetMapProvider();
const searchControl = GeoSearchControl({
  provider: provider,
  showMarker: false,
  showPopup: false,
  style: "bar",
  marker: {
    icon: markerIcon,
    draggable: false,
  },
  popupFormat: ({ result }: { result: { label: string } }) => result.label,
  maxMarkers: 1,
  retainZoomLevel: false,
  animateZoom: true,
  autoClose: true,
  searchLabel: "Enter address",
  keepResult: true,
});
const SearchControl = (props: {
  onSelect: (e: { location: { x: number; y: number } }) => void;
}) => {
  const map = useMap();

  map.on("geosearch/showlocation", (e) => {
    props.onSelect(e as LeafletEvent & { location: { x: number; y: number } });
  });
  React.useEffect(() => {
    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, []);

  return null;
};
const defaultLocation = {
  lat: -3.654593340629959,
  lng: 39.85153198242188,
};
const LocationMap: React.FC<LocationMapProps> = ({
  onChange: onLocationSelected,
  value,
  disabled,
  ...props
}) => {
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (!onLocationSelected) return;
        onLocationSelected(e.latlng);
      },
    });

    return null;
  };
  const disabledProps = disabled
    ? {
        doubleClickZoom: false,
        closePopupOnClick: false,
        dragging: false,
        trackResize: false,
        touchZoom: false,
        scrollWheelZoom: false,
      }
    : {};
  return (
    <MapContainer
      {...disabledProps}
      center={value || defaultLocation}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      {...props}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={value || defaultLocation} icon={markerIcon}></Marker>
      {!disabled && (
        <>
          <MapEvents />
          <SearchControl
            onSelect={(e) => {
              onLocationSelected?.({
                lat: e.location.y,
                lng: e.location.x,
              });
            }}
          />
        </>
      )}
    </MapContainer>
  );
};

export default LocationMap;
