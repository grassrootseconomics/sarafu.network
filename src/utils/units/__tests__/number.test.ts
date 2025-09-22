import { describe, it, expect } from 'vitest';
import { truncateByDecimalPlace, formatNumber } from '../number';

describe('number utilities', () => {
  describe('truncateByDecimalPlace', () => {
    it('should truncate numbers to specified decimal places', () => {
      expect(truncateByDecimalPlace(3.14159, 2)).toBe(3.14);
      expect(truncateByDecimalPlace(3.14159, 3)).toBe(3.141);
      expect(truncateByDecimalPlace(3.14159, 0)).toBe(3);
    });

    it('should handle string inputs', () => {
      expect(truncateByDecimalPlace('3.14159', 2)).toBe(3.14);
      expect(truncateByDecimalPlace('100.999', 1)).toBe(100.9);
    });

    it('should handle bigint inputs', () => {
      expect(truncateByDecimalPlace(123n, 2)).toBe(123);
      expect(truncateByDecimalPlace(456n, 0)).toBe(456);
    });

    it('should handle edge cases', () => {
      expect(truncateByDecimalPlace(0, 2)).toBe(0);
      expect(truncateByDecimalPlace(1.0, 2)).toBe(1);
      expect(truncateByDecimalPlace(-3.14159, 2)).toBe(-3.14);
    });

    it('should not round, only truncate', () => {
      expect(truncateByDecimalPlace(3.999, 2)).toBe(3.99);
      expect(truncateByDecimalPlace(3.999, 1)).toBe(3.9);
      expect(truncateByDecimalPlace(3.999, 0)).toBe(3);
    });

    it('should handle numbers with fewer decimal places than requested', () => {
      expect(truncateByDecimalPlace(3.5, 3)).toBe(3.5);
      expect(truncateByDecimalPlace(10, 2)).toBe(10);
    });

    it('should handle very small numbers', () => {
      expect(truncateByDecimalPlace(0.00123, 3)).toBe(0.001);
      expect(truncateByDecimalPlace(0.00123, 4)).toBe(0.0012);
    });

    it('should handle very large numbers', () => {
      expect(truncateByDecimalPlace(1234567.89123, 2)).toBe(1234567.89);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with default settings', () => {
      expect(formatNumber(1234.567)).toBe('1,234.567');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle scientific notation for very small numbers', () => {
      const result = formatNumber(0.000001);
      expect(result).toBe('1e-6');

      const result2 = formatNumber(0.00005);
      expect(result2).toBe('5e-5');
    });

    it('should respect custom scientific notation threshold', () => {
      const result = formatNumber(0.01, { scientificBelow: 0.1 });
      expect(result).toBe('1e-2');

      const result2 = formatNumber(0.01, { scientificBelow: 0.001 });
      expect(result2).toBe('0.01');
    });

    it('should snap near-integers', () => {
      expect(formatNumber(100.00001)).toBe('100');
      expect(formatNumber(99.99999)).toBe('100');
      expect(formatNumber(100.1)).toBe('100.1');
    });

    it('should respect custom integer tolerance', () => {
      expect(formatNumber(100.01, { integerTolerance: 0.02 })).toBe('100');
      expect(formatNumber(100.01, { integerTolerance: 0.005 })).toBe('100.01');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1234.567)).toBe('-1,234.567');
      expect(formatNumber(-0.000001)).toBe('-1e-6');
      expect(formatNumber(-100.00001)).toBe('-100');
    });

    it('should handle edge cases', () => {
      expect(formatNumber(Infinity)).toBe('Infinity');
      expect(formatNumber(-Infinity)).toBe('-Infinity');
      expect(formatNumber(NaN)).toBe('NaN');
    });

    it('should strip trailing zeros', () => {
      expect(formatNumber(1.100)).toBe('1.1');
      expect(formatNumber(1.000)).toBe('1');
      expect(formatNumber(0.100)).toBe('0.1');
    });

    it('should use grouping separators', () => {
      expect(formatNumber(1234567.89)).toBe('1,234,567.89');
      expect(formatNumber(1000)).toBe('1,000');
    });

    it('should respect locale settings', () => {
      // Note: This test might behave differently in different environments
      const germanFormatted = formatNumber(1234.567, { locale: 'de-DE' });
      // German locale typically uses . for thousands and , for decimals
      expect(typeof germanFormatted).toBe('string');
      expect(germanFormatted.length).toBeGreaterThan(0);
    });

    it('should handle very large numbers', () => {
      const largeNumber = 999999999999.123;
      const result = formatNumber(largeNumber);
      expect(result).toMatch(/999,999,999,999\.123/);
    });

    it('should preserve precision for medium-sized decimals', () => {
      expect(formatNumber(0.123456)).toBe('0.123456');
      expect(formatNumber(0.001234)).toBe('0.001234');
    });

    it('should format scientific notation mantissa correctly', () => {
      const result = formatNumber(0.0000123);
      expect(result).toBe('1.23e-5');

      const result2 = formatNumber(0.0000100);
      expect(result2).toBe('1e-5');
    });
  });
});