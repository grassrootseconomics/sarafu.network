import { type User } from "~/lib/session";
import { AccountRoleType } from "../enums";

export const isAdmin = (user?: User) => {
  return user?.role === AccountRoleType.ADMIN;
};
export const isStaff = (user?: User) => {
  return user?.role === AccountRoleType.STAFF;
};
