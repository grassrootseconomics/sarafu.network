import { describe, it, expect } from 'vitest';
import { stringToColour } from '../colour';

describe('colour utilities', () => {
  describe('stringToColour', () => {
    it('should return a valid hex color for any string input', () => {
      const result = stringToColour('test');
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should be deterministic - same input produces same output', () => {
      const input = 'hello world';
      const result1 = stringToColour(input);
      const result2 = stringToColour(input);
      expect(result1).toBe(result2);
    });

    it('should produce different colors for different strings', () => {
      const color1 = stringToColour('string1');
      const color2 = stringToColour('string2');
      expect(color1).not.toBe(color2);
    });

    it('should handle empty string', () => {
      const result = stringToColour('');
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should handle special characters', () => {
      const result = stringToColour('!@#$%^&*()');
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should handle unicode characters', () => {
      const result = stringToColour('🚀💎🌟');
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000);
      const result = stringToColour(longString);
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should pad hex values to ensure 6-character output', () => {
      // Test with strings that might produce small hash values
      const result = stringToColour('a');
      expect(result).toHaveLength(7); // # + 6 characters
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });
  });
});