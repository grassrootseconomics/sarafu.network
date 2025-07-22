import { type DeployVoucherInput } from "../../src/server/api/routers/voucher";
import { VoucherType } from "../../src/server/enums";
import { mockUserAddress } from "./user";
export const mockVoucherAddress = "0xEB3907eCaD74a0013C259D5874aE7f22DCBcC95a";
export const mockDeployInput: DeployVoucherInput = {
  options: {
    transfer: "no",
  },
  aboutYou: {
    name: "name",
    email: "me@email.com",
    geo: {
      x: 1,
      y: 2,
    },
    location: "locationName",
    type: "personal",
    website: "http://www.sarafu.network",
  },
  expiration: {
    type: VoucherType.DEMURRAGE,
    communityFund: mockUserAddress,
    period: 43800,
    rate: 2,
  },
  nameAndProducts: {
    name: "name",
    description: "description",
    symbol: "SYM",
    products: [],
  },
  valueAndSupply: {
    supply: 1,
    value: 1,
    uoa: "BYTES",
  },
  signingAndPublishing: {
    pathLicense: true,
    termsAndConditions: true,
  },
};
