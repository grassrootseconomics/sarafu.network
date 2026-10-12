import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSiweAdapter } from "~/config/siwe";

afterEach(() => {
  vi.unstubAllGlobals();
});
describe("createSiweAdapter", () => {
  it("reports the account-creation-disabled response", async () => {
    const onAccountCreationDisabled = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: vi.fn().mockResolvedValue({
        code: "ACCOUNT_CREATION_DISABLED",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const adapter = createSiweAdapter(
      new QueryClient(),
      onAccountCreationDisabled,
    );
    const verified = await adapter.verify({
      message: "message",
      signature: "0xsignature",
    });

    expect(verified).toBe(false);
    expect(onAccountCreationDisabled).toHaveBeenCalledOnce();
  });
});
