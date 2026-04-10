import { vi } from "vitest";

export const mockFetch = vi.fn();

export function setupFetchMock() {
  global.fetch = mockFetch;
}

export function clearFetchMock() {
  mockFetch.mockClear();
}