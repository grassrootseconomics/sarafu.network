"use client";
import type { SearchBoxRetrieveResponse } from "@mapbox/search-js-core";
import { SearchBox } from "@mapbox/search-js-react";
import { LocateFixed } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useRef } from "react";
import Map, {
  type MapMouseEvent,
  Marker,
  type MapProps,
  type MapRef,
} from "react-map-gl/mapbox";
import { Button } from "~/components/ui/button";

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
  onCurrentLocation?: (latLong: LocationValue) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  showSearchBar?: boolean;
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
  onCurrentLocation,
  showSearchBar = false,
  ...props
}: LocationMapProps) {
  const mapRef = useRef<MapRef>(null);

  const initialViewState = {
    longitude: value?.longitude ?? defaultLocation.longitude,
    latitude: value?.latitude ?? defaultLocation.latitude,
    zoom: 2, // Start zoomed out for globe view
  };

  const mapStyle = "mapbox://styles/mapbox/streets-v12"; // Or satellite-streets-v12, outdoors-v12, etc.

  const handleMapClick = (event: MapMouseEvent) => {
    if (disabled || !onLocationSelected) return;
    const { lng, lat } = event.lngLat;
    onLocationSelected({
      latitude: lat,
      longitude: lng,
    });
  };

  const handleGoToCurrentLocation = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 14 });
          onCurrentLocation?.({
            latitude,
            longitude,
          });
        },
        (error) => {
          console.error("Error getting current location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    },
    []
  );

  const handleRetrieve = useCallback(
    (res: SearchBoxRetrieveResponse) => {
      const selected = res.features[0];
      if (
        !selected ||
        !selected.geometry ||
        selected.geometry.type !== "Point"
      ) {
        return;
      }

      const coords = selected.geometry.coordinates;
      const latitude = coords[1];
      const longitude = coords[0];

      if (!longitude || !latitude) {
        return;
      }

      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: 14,
        essential: true,
      });

      if (onLocationSelected) {
        onLocationSelected({ latitude, longitude });
      }
    },
    [onLocationSelected]
  );

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
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        {...props}
        initialViewState={initialViewState}
        mapboxAccessToken={MAPBOX_TOKEN}
        logoPosition="top-left"
        mapStyle={mapStyle}
        terrain={{
          source: "mapbox-terrain-v2",
          exaggeration: 1.5,
        }}
        style={
          { height: "100%", width: "100%", ...style } as React.CSSProperties
        }
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

      {/* Controls Overlay */}
      <div className="absolute top-2 left-2 flex gap-2 z-10 items-center">
        {/* Search Bar (Optional & Not Disabled) */}
        {showSearchBar && !disabled && (
          <div className="min-w-[250px]">
            <SearchBox
              accessToken={MAPBOX_TOKEN}
              mapboxgl={undefined}
              value=""
              onRetrieve={handleRetrieve}
              theme={{
                variables: {},
              }}
            />
          </div>
        )}

        {/* Go to Current Location Button */}
        <Button
          onClick={handleGoToCurrentLocation}
          size="icon"
          variant="secondary"
          className="shadow-md h-9 w-9"
          aria-label="Go to current location"
          disabled={disabled}
        >
          <LocateFixed className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export default LocationMap;
