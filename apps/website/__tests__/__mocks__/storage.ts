/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { vi } from "vitest";

export class MockStorage extends Storage {
  store: Record<string, string> = {};
  setItem = vi.fn((key, value) => {
    this.store[key] = value;
  });
  getItem = vi.fn((key) => {
    return this.store[key] || null;
  });
  removeItem = vi.fn((key) => {
    delete this.store[key];
  });
  clear = vi.fn(() => {
    this.store = {};
  });
}
