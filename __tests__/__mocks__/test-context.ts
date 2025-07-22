import { AccountRoleType } from "~/server/enums";
import { mockUserAddress } from "./user";

const ctxBase = {
  graphDB: {} as any,
  federatedDB: {} as any,
  session: null,
  ip: "test",
};

export const mockTestContext = {
  superUser: {
    ...ctxBase,
    session: {
      user: {
        id: 1,
        role: AccountRoleType.SUPER_ADMIN,
        account_id: 1,
      },
      address: mockUserAddress,
    },
  },
  noAuth: {
    ...ctxBase,
  },
};