"use client";

import { useReverseGeocoder } from "~/hooks/use-reverse-geocoder";
import { Skeleton } from "../ui/skeleton";

export function ReportLocationName({
  location,
  className,
  onClick,
}: {
  location:
    | { lat: number; lng: number }
    | { x: number; y: number }
    | undefined
    | null;
  className?: string;
  onClick?: () => void;
}) {
  const geo = useReverseGeocoder(location);
  return (
    <div className={className} onClick={onClick}>
      {geo.isLoading ? <Skeleton className="h-4 w-24" /> : geo.location}
    </div>
  );
}
