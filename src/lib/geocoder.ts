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
