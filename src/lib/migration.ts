export const COSMO_LOCAL_CREDIT_URL = "https://cosmolocal.credit";
export const MIGRATION_SUPPORT_EMAIL = "info@grassecon.org";
export const MIGRATION_DEADLINE = "30 October 2026";

export const ACCOUNT_CREATION_DISABLED_CODE =
  "ACCOUNT_CREATION_DISABLED" as const;

export const CREATION_DISABLED_MESSAGE =
  "New creation is no longer available on Sarafu Network. Please use Cosmo-Local Credit.";

export const creationResources = {
  offer: "offers",
  report: "reports",
  voucher: "vouchers",
  pool: "pools",
  account: "accounts",
  "paper-wallet": "paper wallets",
} as const;

export type CreationResource = keyof typeof creationResources;
