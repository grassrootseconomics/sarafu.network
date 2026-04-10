import { type DeployVoucherInput } from "@sarafu/api/schemas/deploy-voucher";
import { type ExpirationFormValues } from "@sarafu/schemas/voucher";
import { type RouterOutput } from "~/server/api/root";
import { VoucherType } from "@sarafu/core/enums";
import { type OfferVoucherWizardData } from "./schemas";

type User = NonNullable<RouterOutput["me"]["get"]>;

export function transformToDeployInput(
  data: OfferVoucherWizardData,
  user: User,
): DeployVoucherInput {
  return {
    name: data.voucher.name,
    description: data.voucher.shopDescription || "",
    symbol: data.voucher.symbol,
    supply: data.voucher.supply ?? 1000,
    value: data.voucher.value,
    uoa: data.voucher.uoa,
    email: data.voucher.contactEmail || user.email || "",
    website: undefined,
    geo: data.voucher.geo ?? user.geo ?? undefined,
    location: data.voucher.location ?? user.location_name ?? undefined,
    expiration: buildExpiration(data.voucher),
    products: [
      {
        name: data.offer.name,
        description: data.offer.description ?? "",
        quantity: data.pricing.quantity ?? 0,
        frequency: data.pricing.frequency ?? "day",
        image_url: data.offer.photo,
        price: data.pricing.price,
        unit: data.pricing.unit,
        categories: data.offer.categories,
      },
    ],
    termsAndConditions: data.confirm.termsAndConditions,
    pathLicense: data.confirm.pathLicense,
  };
}

function buildExpiration(
  voucher: OfferVoucherWizardData["voucher"],
): ExpirationFormValues {
  if (voucher.voucherType === VoucherType.DEMURRAGE) {
    return {
      type: VoucherType.DEMURRAGE,
      rate: voucher.demurrageRate!,
      period: voucher.demurragePeriod!,
      communityFund: voucher.communityFund as `0x${string}`,
    };
  }
  if (voucher.voucherType === VoucherType.GIFTABLE_EXPIRING) {
    return {
      type: VoucherType.GIFTABLE_EXPIRING,
      expirationDate: voucher.expirationDate!,
    };
  }
  return { type: VoucherType.GIFTABLE };
}
