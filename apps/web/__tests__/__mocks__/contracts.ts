import { vi } from "vitest";

export const mockContracts = () => ({
  VoucherIndex: {
    exists: vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return false;
    }),
    add: vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return true;
    }),
    remove: vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return true;
    }),
  },
});