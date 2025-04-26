"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useCallback, useState } from "react";
import Map, {
  Marker,
  Popup,
  type MapProps as ReactMapGLProps,
} from "react-map-gl";

// TODO: Replace with your Mapbox access token, preferably via environment variable
const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "YOUR_MAPBOX_ACCESS_TOKEN";

interface ItemLocation {
  latitude: number;
  longitude: number;
}

export interface MapProps<T> extends Omit<ReactMapGLProps, "children"> {
  items?: T[];
  getPopupInfo: (item: T) => React.ReactNode; // Function to get content for the popup
  getLngLat: (item: T) => ItemLocation | undefined;
  getMarker: (item: T) => React.ReactNode | undefined;
  onItemClicked?: (item: T) => void; // Optional: If specific action needed beyond showing popup
  // Add Mapbox specific event handlers here if needed, e.g.:
  // onZoomEnd?: (e: ViewStateChangeEvent) => void
  // onMoveEnd?: (e: ViewStateChangeEvent) => void
}

export default function MapComponent<T>({
  getPopupInfo,
  getLngLat,
  items,
  onItemClicked,
  getMarker,
  style,
  ...props
}: MapProps<T>) {
  const [popupInfo, setPopupInfo] = useState<T | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const initialViewState = {
    longitude: 38, // Center longitude
    latitude: 0, // Center latitude
    zoom: 1.5, // Zoom level appropriate for globe
  };

  const mapStyle = "mapbox://styles/mapbox/streets-v12";

  const handleMarkerClick = useCallback(
    (item: T) => {
      setPopupInfo(item);
      if (onItemClicked) {
        onItemClicked(item);
      }
    },
    [onItemClicked]
  );

  const markers = React.useMemo(() => {
    return (
      items
        ?.map((item, index) => {
          const position = getLngLat(item);
          if (!position) return null;

          return (
            <Marker
              key={`marker-${index}`}
              longitude={position.longitude}
              latitude={position.latitude}
              anchor="bottom"
              onClick={() => {
                // Prevent map click event when clicking marker
                handleMarkerClick(item);
              }}
            >
              {/* Basic SVG marker, you can customize this */}
              {getMarker ? (
                getMarker(item)
              ) : (
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
          );
        })
        .filter(Boolean) || []
    );
  }, [items, getLngLat, handleMarkerClick, getMarker]);

  const popupLocation = popupInfo ? getLngLat(popupInfo) : null;

  return (
    <Map
      {...props}
      initialViewState={initialViewState}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={mapStyle}
      logoPosition="top-left"
      terrain={{
        source: "mapbox-terrain-v2",
        exaggeration: 1.5,
      }}
      style={{ height: "100%", width: "100%", ...style } as React.CSSProperties}
      projection={{ name: "globe" }} // Enable globe projection
      onLoad={() => setIsMapLoaded(true)}
    >
      {isMapLoaded && markers}

      {popupInfo && popupLocation && (
        <Popup
          anchor="top"
          longitude={popupLocation.longitude}
          latitude={popupLocation.latitude}
          onClose={() => setPopupInfo(null)}
          closeOnClick={false} // Keep popup open when map is clicked
        >
          {getPopupInfo(popupInfo)}
        </Popup>
      )}
    </Map>
  );
}
