import { describe, expect, it, vi } from "vitest";
import {
  creationDisabledProcedure,
  router,
  staffCreationDisabledProcedure,
} from "~/server/api/trpc";
import { AccountRoleType } from "~/server/enums";

const resolver = vi.fn();

const testRouter = router({
  accountCreation: creationDisabledProcedure.mutation(resolver),
  staffWalletCreation: staffCreationDisabledProcedure.mutation(resolver),
});
const context = {
  graphDB: {},
  federatedDB: {},
  ip: "test",
  session: {
    address: "0x1234567890123456789012345678901234567890" as const,
    chainId: 42220,
    user: {
      id: 1,
      account_id: 1,
      role: AccountRoleType.SUPER_ADMIN,
    },
  },
};

describe("creation-disabled procedures", () => {
  it("blocks authenticated creation before running its resolver", async () => {
    await expect(
      testRouter.createCaller(context as never).accountCreation(),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(resolver).not.toHaveBeenCalled();
  });

  it("also blocks staff and super-admin creation", async () => {
    await expect(
      testRouter.createCaller(context as never).staffWalletCreation(),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(resolver).not.toHaveBeenCalled();
  });
});
