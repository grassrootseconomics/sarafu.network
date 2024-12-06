"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { z } from "zod";
import AreYouSureDialog from "~/components/dialogs/are-you-sure";
import { ImageUploadField } from "~/components/forms/fields/image-upload-field";
import { InputField } from "~/components/forms/fields/input-field";
import { MapField } from "~/components/forms/fields/map-field";
import { TextAreaField } from "~/components/forms/fields/textarea-field";
import { Loading } from "~/components/loading";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";
import { useIsOwner } from "~/hooks/useIsOwner";
import { trpc } from "~/lib/trpc";
import { type RouterOutput } from "~/server/api/root";
import { type UpdateVoucherInput } from "~/server/api/routers/voucher";
import { hasPermission } from "~/utils/permissions";

// Form validation schema
const formSchema = z.object({
  geo: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .nullable(),
  bannerUrl: z.string().url().nullable().optional(),
  iconUrl: z.string().url().nullable().optional(),
  voucherEmail: z.string().email().nullable(),
  voucherWebsite: z.string().url().nullable(),
  locationName: z.string().nullable(),
  voucherDescription: z.string(),
});

interface UpdateFormProps {
  onSuccess?: () => void;
  voucher: Exclude<RouterOutput["voucher"]["byAddress"], undefined>;
}

const UpdateVoucherForm = ({ onSuccess, voucher }: UpdateFormProps) => {
  const { isConnected, address } = useAccount();
  const auth = useAuth();
  const router = useRouter();
  const utils = trpc.useUtils();
  const update = trpc.voucher.update.useMutation();
  const remove = trpc.voucher.remove.useMutation();

  const isPending = update.isPending || remove.isPending;

  const isOwner = useIsOwner(voucher?.voucher_address);
  const canUpdate = hasPermission(auth?.user, isOwner, "Vouchers", "UPDATE");
  const canDelete = hasPermission(auth?.user, isOwner, "Vouchers", "DELETE");

  const form = useForm<Omit<UpdateVoucherInput, "voucherAddress">>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      voucherWebsite: voucher?.voucher_website,
      voucherEmail: voucher?.voucher_email,
      voucherDescription: voucher?.voucher_description,
      geo: voucher?.geo,
      locationName: voucher?.location_name,
      bannerUrl: voucher?.banner_url,
      iconUrl: voucher?.icon_url,
    },
  });

  const handleUpdate = async (
    formData: Omit<UpdateVoucherInput, "voucherAddress">
  ) => {
    try {
      if (!voucher?.voucher_address) return;
      await update.mutateAsync({
        voucherAddress: voucher.voucher_address as `0x${string}`,
        ...formData,
      });
      toast.success("Voucher updated successfully");
      await utils.voucher.invalidate();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Error updating voucher");
    }
  };
  const handleRemove = async () => {
    const id = "remove-voucher";
    try {
      if (!voucher?.voucher_address) return;
      toast.loading("Removing voucher", { id, duration: 15000 });
      await remove.mutateAsync({
        voucherAddress: voucher.voucher_address as `0x${string}`,
      });
      toast.success("Voucher removed successfully", {
        id,
        duration: undefined,
      });
      void router.push("/vouchers");
      await utils.voucher.invalidate();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(`Error: ${(error as Error).message ?? "Removing voucher"}`, {
        id,
        duration: 4000,
      });
    }
  };

  if (!isConnected || !address) {
    return (
      <Alert variant="warning" title="Warning">
        Please Connect your Wallet
      </Alert>
    );
  }

  if (!canUpdate) {
    return (
      <Alert variant="destructive" title="Error">
        You are not Authorized to Update this Voucher
      </Alert>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleUpdate)}
        className="p-6 bg-white shadow-lg rounded-lg space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUploadField
            form={form}
            name="iconUrl"
            label="Icon"
            folder="voucher"
            aspectRatio={1}
            className="size-40 mx-auto"
            circularCrop={true}
          />
          <div>
            <InputField
              form={form}
              name="voucherWebsite"
              label="Website"
              placeholder="http://example.com"
              className="w-full"
            />
            <InputField
              form={form}
              name="voucherEmail"
              label="Email"
              placeholder="email@example.com"
              className="w-full"
            />
          </div>
        </div>

        <TextAreaField
          form={form}
          name="voucherDescription"
          label="Description"
          placeholder="Enter description here..."
          className="w-full"
        />
        <ImageUploadField
          form={form}
          name="bannerUrl"
          label="Banner"
          placeholder=""
          folder="voucher"
          className="w-full md:w-2/3 mx-auto"
          aspectRatio={16 / 9}
        />
        <MapField
          form={form}
          name="geo"
          label="Location"
          locationName="locationName"
        />

        <div className="flex justify-between items-center space-x-4">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isPending ? <Loading /> : "Save Changes"}
          </Button>
          {canDelete && voucher && (
            <AreYouSureDialog
              title="Are you sure?"
              description="Deleting this voucher cannot be undone. Are you sure you want to proceed?"
              onYes={handleRemove}
            />
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateVoucherForm;
