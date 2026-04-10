"use client";

import dynamic from "next/dynamic";
import { Loading } from "~/components/loading";

const LocationMap = dynamic(() => import("~/components/map/location-map"), {
  ssr: false,
  loading: () => <Loading />,
});

interface LocationMapClientProps {
  style?: React.CSSProperties;
  value?: {
    latitude: number;
    longitude: number;
  };
}

export function LocationMapClient({ style, value }: LocationMapClientProps) {
  return <LocationMap style={style} value={value} />;
}
