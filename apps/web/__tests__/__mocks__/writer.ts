import { vi } from "vitest";
import { mockVoucherAddress } from "./voucher";

export const mockWriter = () => ({
  getWriterWalletClient: vi.fn().mockReturnValue({
    deployContract: vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return mockVoucherAddress;
    }),
    writeContract: vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return mockVoucherAddress;
    }),
  }),
});