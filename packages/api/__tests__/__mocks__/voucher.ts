import { type DeployVoucherInput } from "../../src/routers/voucher";
import { VoucherType } from "@sarafu/core/enums";
import { mockUserAddress } from "./user";
export const mockVoucherAddress = "0xEB3907eCaD74a0013C259D5874aE7f22DCBcC95a";
export const mockDeployInput: DeployVoucherInput = {
  name: "name",
  description: "description",
  symbol: "SYM",
  supply: 1,
  value: 1,
  uoa: "BYTES",
  email: "me@email.com",
  website: "http://www.sarafu.network",
  geo: {
    x: 1,
    y: 2,
  },
  location: "locationName",
  expiration: {
    type: VoucherType.DEMURRAGE,
    communityFund: mockUserAddress,
    period: 43800,
    rate: 2,
  },
  products: [],
  termsAndConditions: true,
  pathLicense: true,
};
