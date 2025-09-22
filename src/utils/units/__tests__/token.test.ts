import { describe, it, expect, vi } from 'vitest';
import { toUserUnitsString, getFormattedValue, type TokenValue } from '../token';

// Mock the viem formatUnits function
vi.mock('viem', () => ({
  formatUnits: vi.fn((value: bigint, decimals: number) => {
    // Simple mock implementation
    const divisor = 10 ** decimals;
    return (Number(value) / divisor).toString();
  })
}));

describe('token utilities', () => {
  describe('toUserUnitsString', () => {
    it('should format token values with default decimals', () => {
      const result = toUserUnitsString(1000000n, 6);
      expect(result).toBe('1');
    });

    it('should handle undefined value', () => {
      expect(toUserUnitsString(undefined, 6)).toBe('0');
    });

    it('should handle undefined decimals', () => {
      const result = toUserUnitsString(1000000n, undefined);
      expect(result).toBe('1');
    });

    it('should use precision for very small values that round to zero', () => {
      const result = toUserUnitsString(1n, 6);
      // Very small value should use precision formatting
      expect(result).toMatch(/0\.00/);
    });

    it('should round down to two decimal places for normal values', () => {
      const result = toUserUnitsString(1234567n, 6);
      expect(result).toBe('1.23');
    });

    it('should use locale formatting for larger values', () => {
      const result = toUserUnitsString(1234567890n, 6);
      expect(result).toMatch(/1,234/);
    });

    it('should handle zero value', () => {
      expect(toUserUnitsString(0n, 6)).toBe('0.00');
    });

    it('should handle different decimal places', () => {
      expect(toUserUnitsString(1000n, 3)).toBe('1');
      expect(toUserUnitsString(1000n, 2)).toBe('10');
      // Very small values use precision formatting
      const result = toUserUnitsString(1000n, 18);
      expect(result).toMatch(/1\.00e-15/);
    });
  });

  describe('getFormattedValue', () => {
    it('should return undefined if decimals is not provided', () => {
      expect(getFormattedValue(1000n, undefined)).toBeUndefined();
    });

    it('should return default TokenValue for undefined or invalid value', () => {
      const result = getFormattedValue(undefined, 6);
      expect(result).toEqual({
        formatted: '0',
        formattedNumber: 0,
        value: 0n,
        decimals: 6,
      });
    });

    it('should return default TokenValue for non-bigint value', () => {
      const result = getFormattedValue('invalid' as unknown as bigint, 6);
      expect(result).toEqual({
        formatted: '0',
        formattedNumber: 0,
        value: 0n,
        decimals: 6,
      });
    });

    it('should format valid bigint values correctly', () => {
      const result = getFormattedValue(1234567n, 6);
      expect(result).toEqual({
        formatted: '1.23',
        formattedNumber: 1.234567,
        value: 1234567n,
        decimals: 6,
      });
    });

    it('should handle zero value', () => {
      const result = getFormattedValue(0n, 6);
      expect(result).toEqual({
        formatted: '0',
        formattedNumber: 0,
        value: 0n,
        decimals: 6,
      });
    });

    it('should truncate to 2 decimal places in formatted string', () => {
      const result = getFormattedValue(1999999n, 6);
      expect(result?.formatted).toBe('1.99');
      expect(result?.formattedNumber).toBe(1.999999);
    });

    it('should handle different decimal configurations', () => {
      const result18 = getFormattedValue(1000000000000000000n, 18);
      expect(result18?.formatted).toBe('1');
      expect(result18?.formattedNumber).toBe(1);
      expect(result18?.decimals).toBe(18);

      const result2 = getFormattedValue(100n, 2);
      expect(result2?.formatted).toBe('1');
      expect(result2?.formattedNumber).toBe(1);
      expect(result2?.decimals).toBe(2);
    });

    it('should preserve the original value and decimals', () => {
      const originalValue = 123456789n;
      const decimals = 8;
      const result = getFormattedValue(originalValue, decimals);

      expect(result?.value).toBe(originalValue);
      expect(result?.decimals).toBe(decimals);
    });

    it('should handle very large values', () => {
      const largeValue = 999999999999999999n;
      const result = getFormattedValue(largeValue, 6);

      expect(result?.value).toBe(largeValue);
      expect(result?.decimals).toBe(6);
      expect(typeof result?.formatted).toBe('string');
      expect(typeof result?.formattedNumber).toBe('number');
    });
  });

  describe('TokenValue type', () => {
    it('should have correct interface structure', () => {
      const tokenValue: TokenValue = {
        formatted: '1.23',
        formattedNumber: 1.23,
        value: 123n,
        decimals: 2,
      };

      expect(typeof tokenValue.formatted).toBe('string');
      expect(typeof tokenValue.formattedNumber).toBe('number');
      expect(typeof tokenValue.value).toBe('bigint');
      expect(typeof tokenValue.decimals).toBe('number');
    });
  });
});