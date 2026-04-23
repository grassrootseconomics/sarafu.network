"use client";

import * as React from "react";
import { getLocation } from "~/lib/geocoder";
export function useReverseGeocoder(
  point:
    | { latitude: number; longitude: number }
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

    const locationPoint =
      "latitude" in point ? point : { latitude: point.x, longitude: point.y };

    void getLocation(locationPoint)
      .then((location) => setLocation(location))
      .catch((error) => {
        console.error("Failed to get location:", error);
        setLocation(null);
      })
      .finally(() => setIsLoading(false));
  }, [point]);

  return { location, isLoading };
}
