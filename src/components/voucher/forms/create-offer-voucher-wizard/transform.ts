import { type VoucherPublishingSchema } from "~/components/voucher/forms/create-voucher-form/schemas";
import { type RouterOutput } from "~/server/api/root";
import { VoucherType } from "~/server/enums";
import { type OfferVoucherWizardData } from "./schemas";

type User = NonNullable<RouterOutput["me"]["get"]>;

export function transformToDeployInput(
  data: OfferVoucherWizardData,
  user: User
): VoucherPublishingSchema {
  const userName =
    `${user.given_names ?? ""} ${user.family_name ?? ""}`.trim() || "Unknown";

  return {
    aboutYou: {
      type: "personal" as const,
      name: userName,
      email: data.voucher.contactEmail || user.email || "",
      website: undefined,
      geo: data.voucher.geo ?? user.geo ?? undefined,
      location: data.voucher.location ?? user.location_name ?? undefined,
    },
    nameAndProducts: {
      name: data.voucher.name,
      description:
        data.voucher.shopDescription ?? data.offer.description ?? "",
      symbol: data.voucher.symbol,
      products: [
        {
          name: data.offer.name,
          description: data.offer.description ?? "",
          quantity: data.pricing.quantity ?? 0,
          frequency: data.pricing.frequency ?? "day",
          image_url: data.offer.photo,
        },
      ],
    },
    valueAndSupply: {
      uoa: data.voucher.uoa,
      value: data.voucher.value,
      supply: data.voucher.supply ?? 1000,
    },
    expiration: buildExpiration(data.voucher),
    signingAndPublishing: {
      termsAndConditions: data.confirm.termsAndConditions,
      pathLicense: data.confirm.pathLicense,
    },
  };
}

function buildExpiration(
  voucher: OfferVoucherWizardData["voucher"]
): VoucherPublishingSchema["expiration"] {
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
