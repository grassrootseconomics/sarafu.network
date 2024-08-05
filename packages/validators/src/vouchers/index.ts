import { isAddress } from "viem";
import { z } from "zod";
import type { CreateVoucherSchema } from "./create";
import { createVoucherSchemas } from "./create";
export const insertVoucherInput = z.object({
  ...createVoucherSchemas,
  voucherAddress: z
    .string()
    .refine(isAddress, { message: "Invalid address format" }),
  contractVersion: z.string(),
});
export const updateVoucherInput = z.object({
  geo: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .nullable(),
  bannerUrl: z.string().url().nullable().optional(),
  iconUrl: z.string().url().nullable().optional(),
  voucherEmail: z.string().email().nullable(),
  voucherWebsite: z.string().url().nullable(),
  locationName: z.string().nullable(),
  voucherAddress: z
    .string()
    .refine(isAddress, { message: "Invalid address format" }),
  voucherDescription: z.string(),
});
export type UpdateVoucherInput = z.infer<typeof updateVoucherInput>;

export type DeployVoucherInput = z.infer<typeof insertVoucherInput>;
export { createVoucherSchemas };
export type { CreateVoucherSchema };
