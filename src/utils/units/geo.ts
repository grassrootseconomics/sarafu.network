/**
 * Geo conversion + distance utilities.
 *
 * STORAGE CONVENTION (PostgreSQL `point` columns in this codebase):
 *   Point.x = latitude
 *   Point.y = longitude
 *
 * NOTE: this is the OPPOSITE of the standard PostGIS / GeoJSON ordering
 * (which is lon, lat). Always use these helpers when crossing the boundary
 * between stored points and lat/lng — never read `geo.x` / `geo.y` directly.
 */

export type Point = { x: number; y: number };
export type LatLng = { latitude: number; longitude: number };

const LAT_MIN = -90;
const LAT_MAX = 90;
const LNG_MIN = -180;
const LNG_MAX = 180;
const EARTH_RADIUS_KM = 6371;

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

/** Convert a stored Point to {latitude, longitude}, or null if unusable. */
export function pointToLatLng(point: Point | null | undefined): LatLng | null {
  if (!point) return null;
  if (!isFiniteNumber(point.x) || !isFiniteNumber(point.y)) return null;
  return { latitude: point.x, longitude: point.y };
}

/** Convert {latitude, longitude} to a stored Point. */
export function latLngToPoint(latLng: LatLng): Point {
  return { x: latLng.latitude, y: latLng.longitude };
}

/** Clamp a LatLng into valid ranges. */
export function clampLatLng(latLng: LatLng): LatLng {
  return {
    latitude: Math.max(LAT_MIN, Math.min(LAT_MAX, latLng.latitude)),
    longitude: Math.max(LNG_MIN, Math.min(LNG_MAX, latLng.longitude)),
  };
}

/** Great-circle distance between two LatLng points, in kilometres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Distance between a user's LatLng and a stored Point, in kilometres.
 * Returns null if either input is missing or non-finite.
 */
export function distanceKmFromPoint(
  user: LatLng | null | undefined,
  point: Point | null | undefined,
): number | null {
  if (!user) return null;
  const target = pointToLatLng(point);
  if (!target) return null;
  return haversineKm(clampLatLng(user), clampLatLng(target));
}

/**
 * Distance between two stored Points, in kilometres.
 * Returns null if either input is missing or non-finite.
 */
export function distanceKmBetweenPoints(
  a: Point | null | undefined,
  b: Point | null | undefined,
): number | null {
  const aLatLng = pointToLatLng(a);
  const bLatLng = pointToLatLng(b);
  if (!aLatLng || !bLatLng) return null;
  return haversineKm(clampLatLng(aLatLng), clampLatLng(bLatLng));
}

/** Format a kilometre distance as a short human label. */
export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
