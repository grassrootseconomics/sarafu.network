import { vi } from "vitest";

export const mockCustodialAPI = {
  deployERC20: vi.fn().mockResolvedValue({
    description: "Token deployment initiated",
    ok: true,
    result: { trackingId: "test-tracking-id" }
  }),
  deployDMR20: vi.fn().mockResolvedValue({
    description: "DMR20 deployment initiated",
    ok: true,
    result: { trackingId: "test-tracking-id" }
  }),
  waitForDeployment: vi.fn().mockResolvedValue({
    address: "0xEB3907eCaD74a0013C259D5874aE7f22DCBcC95a"
  }),
  OTXType: {
    STANDARD_TOKEN_DEPLOY: "STANDARD_TOKEN_DEPLOY",
    EXPIRING_TOKEN_DEPLOY: "EXPIRING_TOKEN_DEPLOY",
    DEMURRAGE_TOKEN_DEPLOY: "DEMURRAGE_TOKEN_DEPLOY",
  }
};