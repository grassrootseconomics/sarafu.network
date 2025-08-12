import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { BasicVoucherFunctions } from "~/components/voucher/voucher-contract-functions";
import { VoucherTypeTag } from "./voucher-type-tag";
import { type VoucherDetails } from "../pools/contract-functions";
import { trpc } from "~/lib/trpc";

interface VoucherHeroSectionProps {
  address: `0x${string}`;
  details: VoucherDetails;
}

export function VoucherHeroSection({
  address,
  details,
}: VoucherHeroSectionProps) {
  const { data: voucher } = trpc.voucher.byAddress.useQuery(
    { voucherAddress: address },
    {
      enabled: !!address,
      staleTime: 60_000,
    }
  );
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-2xl">
      {/* Banner Background */}
      {voucher?.banner_url ? (
        <div className="absolute inset-0">
          <Image
            src={voucher.banner_url}
            alt="Voucher banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800" />
      )}

      {/* Content Overlay */}
      <div className="relative z-10 px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="max-w-4xl">
          <div className="space-y-6">
            {/* Voucher Icon and Name */}
            <div className="flex items-center gap-6">
              <Avatar className="size-20 sm:size-24 shadow-xl ring-4 ring-white/20">
                <AvatarImage
                  asChild
                  src={voucher?.icon_url ?? "/apple-touch-icon.png"}
                >
                  <Image
                    src={voucher?.icon_url ?? "/apple-touch-icon.png"}
                    alt=""
                    width={96}
                    height={96}
                  />
                </AvatarImage>
                <AvatarFallback>
                  {details?.name?.substring(0, 2).toLocaleUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  {details?.name}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-xl sm:text-2xl text-white/90">
                    {details?.symbol}
                  </p>
                  {voucher?.voucher_type && (
                    <VoucherTypeTag
                      type={voucher?.voucher_type}
                      address={address}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Voucher Value */}
            {voucher?.voucher_value && voucher?.voucher_uoa && (
              <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20">
                <p className="font-semibold text-white">
                  1 {details?.symbol} = {voucher.voucher_value}{" "}
                  {voucher.voucher_uoa} of Products
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4">
              <BasicVoucherFunctions
                voucher_address={address}
                voucher={voucher}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl" />
    </div>
  );
}