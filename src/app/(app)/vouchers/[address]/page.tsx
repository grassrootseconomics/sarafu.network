import { type Metadata } from "next";
import { isAddress } from "viem";
import { getVoucherDetails } from "~/components/pools/contract-functions";
import VoucherPageClient from "~/components/voucher/voucher-page";
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
  params: { address: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const address = params.address;
  const voucherData = await caller.voucher.byAddress({
    voucherAddress: address,
  });

  return {
    title: voucherData?.voucher_name ?? "Unknown Voucher",
    description: voucherData?.voucher_description ?? "",
    openGraph: {
      title: voucherData?.voucher_name,
      description: voucherData?.voucher_description ?? "",
      url: `https://sarafu.network/vouchers/${address}`,
      images: voucherData?.banner_url ? [voucherData.banner_url] : [],
    },
  };
}
export default async function VouchersPage({
  params,
}: {
  params: { address: string };
}) {
  if (!isAddress(params.address)) {
    return <div>Error</div>;
  }
  const voucher_details = await getVoucherDetails(params.address);

  return (
    <VoucherPageClient address={params.address} details={voucher_details} />
  );
}
