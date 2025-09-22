import { describe, it, expect } from 'vitest';
import { truncateString } from '../string';

describe('string utilities', () => {
  describe('truncateString', () => {
    it('should not truncate strings shorter than or equal to the limit', () => {
      expect(truncateString('hello', 5)).toBe('hello');
      expect(truncateString('hello', 6)).toBe('hello');
      expect(truncateString('hi', 10)).toBe('hi');
    });

    it('should truncate strings longer than the limit and add ellipsis', () => {
      expect(truncateString('hello world', 5)).toBe('hello...');
      expect(truncateString('this is a long string', 10)).toBe('this is a ...');
    });

    it('should handle edge cases', () => {
      expect(truncateString('', 5)).toBe('');
      expect(truncateString('a', 0)).toBe('...');
      expect(truncateString('hello', 0)).toBe('...');
    });

    it('should handle single character limit', () => {
      expect(truncateString('hello', 1)).toBe('h...');
    });

    it('should handle unicode characters', () => {
      // Note: Some unicode characters may take multiple bytes/positions
      const result = truncateString('🚀🌟💎✨🎯', 3);
      expect(result).toContain('...');
      expect(truncateString('café', 3)).toBe('caf...');
    });

    it('should preserve original string when exactly at limit', () => {
      const text = 'exactly ten ch';
      expect(truncateString(text, text.length)).toBe(text);
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000);
      const result = truncateString(longString, 50);
      expect(result).toBe('a'.repeat(50) + '...');
      expect(result.length).toBe(53); // 50 + '...'
    });

    it('should handle whitespace correctly', () => {
      expect(truncateString('hello world test', 11)).toBe('hello world...');
      expect(truncateString('   spaces   ', 5)).toBe('   sp...');
    });

    it('should handle special characters', () => {
      expect(truncateString('!@#$%^&*()', 5)).toBe('!@#$%...');
      expect(truncateString('line\nbreak', 6)).toBe('line\nb...');
    });
  });
});