"use client";

import { createContext, useContext, type ReactNode } from "react";

const GeoCountryContext = createContext<string | null>(null);

export function GeoCountryProvider({
  country,
  children,
}: {
  country: string | null;
  children: ReactNode;
}) {
  return (
    <GeoCountryContext.Provider value={country}>
      {children}
    </GeoCountryContext.Provider>
  );
}

export function useGeoCountry(): string | null {
  return useContext(GeoCountryContext);
}
