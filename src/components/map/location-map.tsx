"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, {
  Marker,
  type MapLayerMouseEvent,
  type MapProps,
} from "react-map-gl";

// TODO: Replace with your Mapbox access token, preferably via environment variable
const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "YOUR_MAPBOX_ACCESS_TOKEN";

interface LocationValue {
  latitude: number;
  longitude: number;
}

interface LocationMapProps extends Omit<MapProps, "value" | "onChange"> {
  value?: LocationValue | undefined;
  marker?: React.ReactNode;
  onChange?: (latLong: LocationValue) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const defaultLocation = {
  latitude: -3.654593340629959,
  longitude: 39.85153198242188,
};

function LocationMap({
  onChange: onLocationSelected,
  value,
  disabled,
  style,
  marker,
  ...props
}: LocationMapProps) {
  const initialViewState = {
    longitude: value?.longitude ?? defaultLocation.longitude,
    latitude: value?.latitude ?? defaultLocation.latitude,
    zoom: 2, // Start zoomed out for globe view
  };

  const mapStyle = "mapbox://styles/mapbox/streets-v12"; // Or satellite-streets-v12, outdoors-v12, etc.

  const handleMapClick = (event: MapLayerMouseEvent) => {
    if (disabled || !onLocationSelected) return;
    const { lng, lat } = event.lngLat;
    onLocationSelected({
      latitude: lat,
      longitude: lng,
    });
  };

  const interactionProps = disabled
    ? {
        doubleClickZoom: false,
        dragPan: false,
        dragRotate: false,
        scrollZoom: false,
        touchZoom: false,
        touchRotate: false,
        keyboard: false,
      }
    : {};

  return (
    <Map
      {...props}
      initialViewState={initialViewState}
      mapboxAccessToken={MAPBOX_TOKEN}
      logoPosition="top-left"
      mapStyle={mapStyle}
      terrain={{
        source: "mapbox-terrain-v2",
        exaggeration: 1.5,
      }}
      style={{ height: "100%", width: "100%", ...style } as React.CSSProperties}
      projection={{ name: "globe" }}
      onClick={handleMapClick}
      interactive={!disabled}
      {...interactionProps}
    >
      {value && value.longitude && value.latitude && (
        <Marker
          longitude={value.longitude}
          latitude={value.latitude}
          anchor="bottom"
        >
          {/* Basic SVG marker, you can customize this */}
          {marker || (
            <svg
              height="30"
              viewBox="0 0 24 24"
              style={{
                cursor: "pointer",
                fill: "#d00",
                stroke: "none",
                transform: "translate(0, 15px)", // Adjust position to point correctly
              }}
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          )}
        </Marker>
      )}
    </Map>
  );
}

export default LocationMap;
