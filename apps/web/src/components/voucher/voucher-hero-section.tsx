"use client";

import Image from "next/image";
import { toast } from "sonner";
import { EditableImageOverlay } from "~/components/editable-image-overlay";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { BasicVoucherFunctions } from "~/components/voucher/voucher-contract-functions";
import { useAuth } from "~/hooks/use-auth";
import { trpc } from "~/lib/trpc";
import { hasPermission } from "@sarafu/core/permissions";
import { type VoucherDetails } from "../pools/contract-functions";
import { VoucherTypeTag } from "./voucher-type-tag";

interface VoucherHeroSectionProps {
  address: `0x${string}`;
  details: VoucherDetails;
  isOwner: boolean | undefined;
}

export function VoucherHeroSection({
  address,
  details,
  isOwner,
}: VoucherHeroSectionProps) {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const { data: voucher } = trpc.voucher.byAddress.useQuery(
    { voucherAddress: address },
    {
      enabled: !!address,
      staleTime: 60_000,
    }
  );
  const update = trpc.voucher.update.useMutation();

  const canEdit = hasPermission(auth?.user, isOwner, "Vouchers", "UPDATE");

  const handleBannerSave = async (url: string) => {
    try {
      await update.mutateAsync({ voucherAddress: address, bannerUrl: url });
      utils.voucher.byAddress.setData(
        { voucherAddress: address },
        (old) => (old ? { ...old, banner_url: url } : old)
      );
      toast.success("Banner updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update banner");
    }
  };

  const handleIconSave = async (url: string) => {
    try {
      await update.mutateAsync({ voucherAddress: address, iconUrl: url });
      utils.voucher.byAddress.setData(
        { voucherAddress: address },
        (old) => (old ? { ...old, icon_url: url } : old)
      );
      toast.success("Icon updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update icon");
    }
  };

  return (
    <EditableImageOverlay
      canEdit={canEdit}
      folder="voucher"
      aspectRatio={16 / 9}
      onImageSaved={handleBannerSave}
      isSaving={update.isPending}
      overlayPosition="top-right"
      className="overflow-hidden rounded-2xl shadow-2xl"
    >
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
              <EditableImageOverlay
                canEdit={canEdit}
                folder="voucher"
                aspectRatio={1}
                circularCrop
                onImageSaved={handleIconSave}
                isSaving={update.isPending}
                overlayPosition="center"
                className="shrink-0"
              >
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
              </EditableImageOverlay>
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
              <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-xs rounded-lg border border-white/20">
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
    </EditableImageOverlay>
  );
}
