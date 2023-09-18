import { isAddress } from "viem";
import { z } from "zod";

export const optionsSchema = z
  .object({
    transfer: z.enum(["yes", "no"]),
    transferAddress: z.string().optional(),
  })
  .refine(
    (data) =>
      data.transfer === "no" ||
      (data.transferAddress && isAddress(data.transferAddress)),
    {
      message: "Please enter a valid address",
      path: ["transferAddress"],
    }
  );
export type OptionsFormValues = z.infer<typeof optionsSchema>;
