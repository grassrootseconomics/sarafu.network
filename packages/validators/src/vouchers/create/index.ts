import type { z } from "zod";
import type { AboutYouFormValues } from "./about-you";
import { aboutYouSchema } from "./about-you";
import type { ExpirationFormValues } from "./expiration";
import { expirationSchema, expirationTypeEnum } from "./expiration";
import type { NameAndProductsFormValues } from "./name-and-products";
import { nameAndProductsSchema } from "./name-and-products";
import type { OptionsFormValues } from "./options";
import { optionsSchema } from "./options";
import type { SigningAndPublishingFormValues } from "./sigining-and-publishing";
import { signingAndPublishingSchema } from "./sigining-and-publishing";
import type { ValueAndSupplyFormValues } from "./value-and-supply";
import { valueAndSupplySchema } from "./value-and-supply";

export const createVoucherSchemas = {
  aboutYou: aboutYouSchema,
  expiration: expirationSchema,
  nameAndProducts: nameAndProductsSchema,
  valueAndSupply: valueAndSupplySchema,
  options: optionsSchema,
  signingAndPublishing: signingAndPublishingSchema,
};
export { aboutYouSchema, expirationSchema,expirationTypeEnum, nameAndProductsSchema, optionsSchema, signingAndPublishingSchema, valueAndSupplySchema };
export type { AboutYouFormValues, ExpirationFormValues, NameAndProductsFormValues, OptionsFormValues, SigningAndPublishingFormValues, ValueAndSupplyFormValues };
export type CreateVoucherSchema = {
  [key in keyof typeof createVoucherSchemas]: z.infer<(typeof createVoucherSchemas)[key]>;
};
