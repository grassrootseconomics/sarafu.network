const GEOCODE_URL =
  "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=pjson&langCode=EN&location=";

interface Data {
  address: Address;
  location: Location;
}

interface Location {
  x: number;
  y: number;
  spatialReference: SpatialReference;
}

interface SpatialReference {
  wkid: number;
  latestWkid: number;
}

interface Address {
  Match_addr: string;
  LongLabel: string;
  ShortLabel: string;
  Addr_type: string;
  Type: string;
  PlaceName: string;
  AddNum: string;
  Address: string;
  Block: string;
  Sector: string;
  Neighborhood: string;
  District: string;
  City: string;
  MetroArea: string;
  Subregion: string;
  Region: string;
  RegionAbbr: string;
  Territory: string;
  Postal: string;
  PostalExt: string;
  CntryName: string;
  CountryCode: string;
}

const FORWARD_GEOCODE_URL =
  "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&outFields=*&maxLocations=5&SingleLine=";

export interface GeocodeSuggestion {
  text: string;
  latitude: number;
  longitude: number;
}

interface ForwardGeocodeResponse {
  candidates: Array<{
    address: string;
    location: { x: number; y: number };
  }>;
}

export async function searchLocations(
  query: string
): Promise<GeocodeSuggestion[]> {
  if (query.length < 2) return [];
  try {
    const response = await fetch(
      FORWARD_GEOCODE_URL + encodeURIComponent(query)
    );
    const data = (await response.json()) as ForwardGeocodeResponse;
    if (!data.candidates) return [];
    return data.candidates.map((candidate) => ({
      text: candidate.address,
      // ArcGIS: x = longitude, y = latitude
      latitude: candidate.location.y,
      longitude: candidate.location.x,
    }));
  } catch {
    return [];
  }
}

export async function getLocation(location: {
  latitude: number;
  longitude: number;
}) {
  // Here the coordinates are in Latitude/Longitude Format
  // The geocode service expects longitude, latitude
  const response = await fetch(
    GEOCODE_URL + `${location.longitude},${location.latitude}`
  );
  const data = (await response.json()) as Data;
  const addressLabel =
    data.address !== undefined ? data.address.LongLabel : "Unknown";
  return addressLabel;
}
