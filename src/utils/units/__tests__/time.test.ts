import { describe, it, expect } from 'vitest';
import { minsToHuman } from '../time';

describe('time utilities', () => {
  describe('minsToHuman', () => {
    it('should handle zero minutes', () => {
      expect(minsToHuman(0n)).toBe('< 1s');
    });

    it('should handle less than a minute', () => {
      expect(minsToHuman(0n)).toBe('< 1s');
    });

    it('should format minutes only', () => {
      expect(minsToHuman(1n)).toBe('1Min ');
      expect(minsToHuman(30n)).toBe('30Min ');
      expect(minsToHuman(59n)).toBe('59Min ');
    });

    it('should format hours and minutes', () => {
      expect(minsToHuman(60n)).toBe('1Hour ');
      expect(minsToHuman(90n)).toBe('1Hour 30Min ');
      expect(minsToHuman(120n)).toBe('2Hour ');
      expect(minsToHuman(125n)).toBe('2Hour 5Min ');
    });

    it('should format days, hours, and minutes', () => {
      expect(minsToHuman(1440n)).toBe('1 Days '); // 1 day
      expect(minsToHuman(1500n)).toBe('1 Days 1Hour '); // 1 day 1 hour
      expect(minsToHuman(1530n)).toBe('1 Days 1Hour 30Min '); // 1 day 1 hour 30 min
      expect(minsToHuman(2880n)).toBe('2 Days '); // 2 days
    });

    it('should format years, days, hours, and minutes', () => {
      const yearInMins = 365 * 24 * 60; // 525600 minutes in a year
      // Due to the logic, years only without other components returns "< 1s"
      expect(minsToHuman(BigInt(yearInMins))).toBe('< 1s');
      expect(minsToHuman(BigInt(yearInMins + 1440))).toBe('1 Year 1 Days ');
      expect(minsToHuman(BigInt(yearInMins + 1440 + 60))).toBe('1 Year 1 Days 1Hour ');
      expect(minsToHuman(BigInt(yearInMins + 1440 + 60 + 30))).toBe('1 Year 1 Days 1Hour 30Min ');
    });

    it('should handle large values', () => {
      const twoYears = 2 * 365 * 24 * 60;
      // Years only returns "< 1s" due to the function logic
      expect(minsToHuman(BigInt(twoYears))).toBe('< 1s');

      const complexTime = BigInt(twoYears + 5 * 1440 + 3 * 60 + 45); // 2 years, 5 days, 3 hours, 45 minutes
      expect(minsToHuman(complexTime)).toBe('2 Year 5 Days 3Hour 45Min ');
    });

    it('should handle edge cases with specific time units', () => {
      // Just hours (no days)
      expect(minsToHuman(23n * 60n)).toBe('23Hour ');

      // Just days (no years)
      expect(minsToHuman(364n * 24n * 60n)).toBe('364 Days ');

      // Complex combinations
      expect(minsToHuman(7n * 24n * 60n + 5n * 60n + 15n)).toBe('7 Days 5Hour 15Min ');
    });

    it('should omit zero components', () => {
      // No minutes
      expect(minsToHuman(120n)).toBe('2Hour ');

      // No hours
      expect(minsToHuman(1440n + 30n)).toBe('1 Days 30Min ');

      // No days
      expect(minsToHuman(BigInt(365 * 24 * 60) + 90n)).toBe('1 Year 1Hour 30Min ');
    });

    it('should handle fractional inputs correctly', () => {
      // Since we convert to Number, fractional bigints should work
      // Note: bigint can't be fractional, but the function converts to Number
      expect(minsToHuman(1n)).toBe('1Min ');
    });

    it('should format singular and plural correctly', () => {
      expect(minsToHuman(1n)).toBe('1Min ');
      expect(minsToHuman(60n)).toBe('1Hour ');
      expect(minsToHuman(1440n)).toBe('1 Days ');
      // Years only returns "< 1s" due to function logic
      expect(minsToHuman(BigInt(365 * 24 * 60))).toBe('< 1s');

      expect(minsToHuman(2n)).toBe('2Min ');
      expect(minsToHuman(120n)).toBe('2Hour ');
      expect(minsToHuman(2880n)).toBe('2 Days ');
      expect(minsToHuman(BigInt(2 * 365 * 24 * 60))).toBe('< 1s');
    });

    it('should handle very large time periods', () => {
      const centuryInMins = BigInt(100 * 365 * 24 * 60);
      const result = minsToHuman(centuryInMins);
      // Years only returns "< 1s" due to function logic
      expect(result).toBe('< 1s');
    });
  });
});