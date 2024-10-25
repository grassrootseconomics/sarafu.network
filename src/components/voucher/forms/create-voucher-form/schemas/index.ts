import { type z } from "zod";
import { aboutYouSchema } from "./about-you";
import { expirationSchema } from "./expiration";
import { nameAndProductsSchema } from "./name-and-products";
import { signingAndPublishingSchema } from "./sigining-and-publishing";
import { valueAndSupplySchema } from "./value-and-supply";

export const schemas = {
  aboutYou: aboutYouSchema,
  expiration: expirationSchema,
  nameAndProducts: nameAndProductsSchema,
  valueAndSupply: valueAndSupplySchema,
  signingAndPublishing: signingAndPublishingSchema,
};

export type VoucherPublishingSchema = {
  [key in keyof typeof schemas]: z.infer<(typeof schemas)[key]>;
};
