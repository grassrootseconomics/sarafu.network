import { type Point } from "~/server/db/graph-db";
import { type AccountRoleType } from "~/server/enums";

export interface AppSession {
  address: `0x${string}`;
  chainId: number;
  user: {
    id: number;
    default_voucher: string | null;
    family_name: string | null;
    gender: string | null;
    geo: Point | null;
    given_names: string | null;
    location_name: string | null;
    year_of_birth: number | null;
    role: keyof typeof AccountRoleType;
    account_id: number;
  };
}
