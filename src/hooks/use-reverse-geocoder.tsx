"use client";

import * as React from "react";
import { getLocation } from "~/lib/geocoder";
export function useReverseGeocoder(
  point:
    | { lat: number; lng: number }
    | { x: number; y: number }
    | undefined
    | null
) {
  const [location, setLocation] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!point) {
      setLocation("Unknown");
      setIsLoading(false);
      return;
    }

    const p = "lat" in point ? point : { lat: point.x, lng: point.y };
    void getLocation(p)
      .then((location) => setLocation(location))
      .catch((error) => {
        console.error("Failed to get location:", error);
        setLocation(null);
      })
      .finally(() => setIsLoading(false));
  }, [point]);

  return { location, isLoading };
}
