import { vi } from "vitest";
import { mockVoucherAddress } from "./voucher";

export const mockViemConfig = () => ({
  publicClient: {
    waitForTransactionReceipt: vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { status: "success", contractAddress: mockVoucherAddress };
    }),
    readContract: vi.fn().mockResolvedValue(6),
  },
  defaultReceiptOptions: {
    retryCount: 10,
    confirmations: 5,
    retryDelay: 1000,
    pollingInterval: 1000,
  },
});