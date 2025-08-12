import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isAddress } from "viem";
import { getVoucherDetails } from "~/components/pools/contract-functions";
import VoucherPageClient from "~/components/voucher/voucher-page";
import { publicClient } from "~/config/viem.config.server";
import { caller } from "~/server/api/routers/_app";
import { graphDB } from "~/server/db";
export async function generateStaticParams() {
  const vouchers = await graphDB
    .selectFrom("vouchers")
    .select("voucher_address")
    .execute();
  return vouchers.map((v) => ({
    address: v.voucher_address,
  }));
}

type Props = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const address = params.address;
  const t = await getTranslations("vouchers");
  const voucherData = await caller.voucher.byAddress({
    voucherAddress: address,
  });

  return {
    title: voucherData?.voucher_name ?? t("unknownVoucher"),
    description: voucherData?.voucher_description ?? "",
    openGraph: {
      title: voucherData?.voucher_name ?? t("unknownVoucher"),
      description: voucherData?.voucher_description ?? "",
      url: `https://sarafu.network/vouchers/${address}`,
      images: voucherData?.banner_url ? [voucherData.banner_url] : [],
    },
  };
}
export default async function VouchersPage(props: {
  params: Promise<{ address: string }>;
}) {
  const params = await props.params;
  if (!isAddress(params.address)) {
    const t = await getTranslations("common");
    return <div>{t("error")}</div>;
  }
  const voucher_details = await getVoucherDetails(publicClient, params.address);

  return (
    <VoucherPageClient address={params.address} details={voucher_details} />
  );
}
