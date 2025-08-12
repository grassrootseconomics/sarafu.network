import { useTranslations } from "next-intl";
import { VoucherType } from "~/server/enums";
import { Alert } from "../alert";
import { Row } from "./voucher-info";

export const VoucherDeclaration = ({
  voucher,
  issuer,
  products,
  contract,
}: {
  voucher: {
    voucher_name: string;
    voucher_description: string;
    voucher_uoa: string;
    voucher_value: number;
    voucher_email?: string;
    voucher_website?: string;
    voucher_type: (typeof VoucherType)[keyof typeof VoucherType];
    created_at: string;
  };
  issuer: {
    name: string;
    address: string;
    type: string;
  };
  products?: {
    name: string;
    quantity: number;
    frequency: string;
  }[];
  contract: {
    rate: number;
    period: number;
    symbol: string;
    supply: number;
    communityFund: string;
    expires: Date | undefined;
  };
}) => {
  const t = useTranslations("vouchers.declaration");
  
  return (
    <div className="font-light">
      <h1 className="text-3xl font-bold mb-4">
        {t("title")}
      </h1>
      <h2 className="text-2xl font-semibold mb-2">{t("preamble.title")}</h2>
      <p className="mb-4">
        {t("preamble.content", { issuerName: issuer.name })}
      </p>
      <h2 className="text-2xl font-semibold mb-2">{t("cavInfo.title")}</h2>
      <div className="p-2 px-4 shadow-md m-2 break-all">
        <Row label={t("cavInfo.name")} value={voucher.voucher_name} />
        <Row label={t("cavInfo.description")} value={voucher.voucher_description} />
        <Row label={t("cavInfo.symbol")} value={contract.symbol} />
        <Row label={t("cavInfo.supply")} value={`${contract.supply} ${contract.symbol}`} />

        <Row label={t("cavInfo.unitOfAccount")} value={voucher.voucher_uoa} />
        <Row
          label={t("cavInfo.value")}
          value={t("cavInfo.valueDescription", {
            symbol: contract.symbol,
            value: voucher?.voucher_value.toString(),
            uoa: voucher.voucher_uoa
          })}
        />
        <Row label={t("cavInfo.contactEmail")} value={voucher.voucher_email ?? ""} />
        <Row label={t("cavInfo.website")} value={voucher.voucher_website ?? ""} />
        <Row label={t("cavInfo.issuerAddress")} value={issuer.address} />
        {voucher.voucher_type === VoucherType.DEMURRAGE && (
          <>
            <Row label={t("cavInfo.expirationRate")} value={`${contract.rate}%`} />
            <Row label={t("cavInfo.redistributionPeriod")} value={contract.period} />
            <Row
              label={t("cavInfo.communityAccount")}
              value={contract.communityFund}
            />
          </>
        )}
        {voucher.voucher_type === VoucherType.GIFTABLE_EXPIRING && (
          <>
            <Row
              label={t("cavInfo.expiresOn")}
              value={`${contract.expires?.toLocaleDateString()}`}
            />
          </>
        )}
      </div>
      <br />

      <Alert
        title={t("totalValue.title")}
        variant="info"
        message={t("totalValue.message", {
          supply: contract.supply,
          symbol: contract?.symbol,
          totalValue: contract.supply * voucher.voucher_value,
          uoa: voucher.voucher_uoa
        })}
      />
      <br />
      {products && (
        <>
          <p className="text-xl font-semibold mb-2">
            {t("productOffering.title")}
          </p>
          <div className="mb-2">
            {products.map((product, index) => (
              <li key={index}>
                {t("productOffering.item", {
                  quantity: product.quantity,
                  name: product.name,
                  frequency: product.frequency,
                  symbol: contract.symbol
                })}
              </li>
            ))}
          </div>
        </>
      )}
      <br />
      <h2 className="text-2xl font-semibold mb-2">{t("addendum.title")}</h2>
      <p className="mb-2">
        {t("addendum.goodFaith")}
      </p>
      <p className="mb-2">
        {t("addendum.entirety")}
      </p>
      <br />
      <h2 className="text-2xl font-semibold mb-2">{t("signatories.title")}</h2>
      <p className="mb-2">
        {t("signatories.titleRole")}:{" "}
        <span className="font-semibold">
          {issuer.type === "group" ? t("signatories.director") : t("signatories.individual")}
        </span>
      </p>
      <p className="mb-2">
        {t("signatories.fullName")}: <span className="font-semibold">{issuer.name}</span>
      </p>
      <p className="mb-2">
        {t("signatories.contactAddress")}:{" "}
        <span className="font-semibold">{voucher.voucher_email}</span>
      </p>
      <p className="mb-2">
        {t("signatories.website")}:{" "}
        <span className="font-semibold">{voucher.voucher_website}</span>
      </p>
      <p className="mb-2">
        {t("signatories.onBehalfOf")}: <span className="font-semibold">{issuer.name}</span>
      </p>

      <p className="mb-2">
        {t("signatories.dateSigning")}:{" "}
        <span className="font-semibold">{voucher.created_at}</span>
      </p>
    </div>
  );
};
