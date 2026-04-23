export {
  symbolField,
  consentFields,
  geoField,
  productSchema,
  expirationTypeEnum,
  expirationSchema,
  type ExpirationFormValues,
} from "@sarafu/schemas/voucher";

import { symbolField } from "@sarafu/schemas/voucher";
import { VoucherIndex } from "@sarafu/contracts";

export const symbolFieldWithUniqueness = symbolField.refine(
  async (value) => {
    try {
      const exists = await VoucherIndex.exists(value);
      return !exists;
    } catch {
      return true;
    }
  },
  { message: "Symbol already exists, please pick another" },
);
