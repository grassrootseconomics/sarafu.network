import { type LatLng } from "leaflet";
import { useState } from "react";

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
const useReverseGeocoder = (value: string) => {
  const [address, setAddress] = useState<string>(value);
  async function getLocation(latLng: LatLng) {
    // Here the coordinates are in LatLng Format
    // if you wish to use other formats you will have to change the lat and lng in the fetch URL
    const response = await fetch(GEOCODE_URL + `${latLng.lng},${latLng.lat}`);
    const data = (await response.json()) as Data;
    console.log(data);
    const addressLabel =
      data.address !== undefined ? data.address.LongLabel : "Unknown";
    setAddress(addressLabel);
  }
  return { address, getLocation };
};
