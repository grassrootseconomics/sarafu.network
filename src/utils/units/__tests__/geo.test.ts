import { describe, expect, it } from "vitest";
import {
  clampLatLng,
  distanceKmFromPoint,
  formatDistanceKm,
  haversineKm,
  latLngToPoint,
  pointToLatLng,
} from "../geo";

describe("geo utilities", () => {
  describe("pointToLatLng", () => {
    it("maps Point.x to latitude and Point.y to longitude", () => {
      // Nairobi is roughly (lat -1.29, lng 36.82)
      expect(pointToLatLng({ x: -1.29, y: 36.82 })).toEqual({
        latitude: -1.29,
        longitude: 36.82,
      });
    });

    it("returns null for null/undefined", () => {
      expect(pointToLatLng(null)).toBeNull();
      expect(pointToLatLng(undefined)).toBeNull();
    });

    it("returns null for non-finite values", () => {
      expect(pointToLatLng({ x: Number.NaN, y: 0 })).toBeNull();
      expect(pointToLatLng({ x: 0, y: Number.POSITIVE_INFINITY })).toBeNull();
    });
  });

  describe("latLngToPoint", () => {
    it("is the inverse of pointToLatLng", () => {
      const original = { x: -1.29, y: 36.82 };
      expect(latLngToPoint(pointToLatLng(original)!)).toEqual(original);
    });
  });

  describe("clampLatLng", () => {
    it("clamps latitude to ±90 and longitude to ±180", () => {
      expect(clampLatLng({ latitude: 200, longitude: 500 })).toEqual({
        latitude: 90,
        longitude: 180,
      });
      expect(clampLatLng({ latitude: -200, longitude: -500 })).toEqual({
        latitude: -90,
        longitude: -180,
      });
    });
  });

  describe("haversineKm", () => {
    it("returns 0 for identical points", () => {
      const p = { latitude: -1.29, longitude: 36.82 };
      expect(haversineKm(p, p)).toBe(0);
    });

    it("computes the Nairobi → Madrid distance (~6,400 km)", () => {
      const nairobi = { latitude: -1.29, longitude: 36.82 };
      const madrid = { latitude: 40.42, longitude: -3.7 };
      const km = haversineKm(nairobi, madrid);
      expect(km).toBeGreaterThan(6000);
      expect(km).toBeLessThan(6400);
    });
  });

  describe("distanceKmFromPoint", () => {
    it("uses the (x=lat, y=lng) convention when measuring", () => {
      // User in Nairobi, voucher stored as Point in Madrid.
      const user = { latitude: -1.29, longitude: 36.82 };
      const madridPoint = { x: 40.42, y: -3.7 };
      const km = distanceKmFromPoint(user, madridPoint)!;
      expect(km).toBeGreaterThan(6000);
      expect(km).toBeLessThan(6400);
    });

    it("returns null when either side is missing", () => {
      expect(distanceKmFromPoint(null, { x: 0, y: 0 })).toBeNull();
      expect(
        distanceKmFromPoint({ latitude: 0, longitude: 0 }, null),
      ).toBeNull();
    });
  });

  describe("formatDistanceKm", () => {
    it("uses metres below 1 km", () => {
      expect(formatDistanceKm(0.4)).toBe("400 m");
    });
    it("uses one decimal between 1 and 10 km", () => {
      expect(formatDistanceKm(2.345)).toBe("2.3 km");
    });
    it("rounds to whole km above 10", () => {
      expect(formatDistanceKm(123.7)).toBe("124 km");
    });
  });
});
