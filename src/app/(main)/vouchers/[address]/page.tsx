import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { isAddress } from "viem";
import VoucherPageClient from "~/components/voucher/voucher-page";
import { publicClient } from "~/config/viem.config.server";
import { getTokenDetails } from "~/server/api/models/token";
import { getPublicVoucher } from "~/server/api/public-fetchers";

export const revalidate = 60;

type Props = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const address = params.address;
  const voucherData = await getPublicVoucher(address);

  return {
    title: voucherData?.voucher_name ?? "Unknown Voucher",
    description: voucherData?.voucher_description ?? "",
    openGraph: {
      title: voucherData?.voucher_name ?? "Unknown Voucher",
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
  const address = params.address;
  if (!address || !isAddress(address)) {
    return redirect("/vouchers");
  }
  const [voucher_details, voucher_metadata] = await Promise.all([
    getTokenDetails(publicClient, { address }),
    getPublicVoucher(address),
  ]);

  return (
    <VoucherPageClient
      address={address}
      details={voucher_details}
      initialVoucher={voucher_metadata}
    />
  );
}
