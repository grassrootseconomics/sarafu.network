import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { z } from "zod";
import AreYouSureDialog from "~/components/dialogs/are-you-sure";
import { InputField } from "~/components/forms/fields/input-field";
import { MapField } from "~/components/forms/fields/map-field";
import { Loading } from "~/components/loading";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
import { useToast } from "~/components/ui/use-toast";
import { useUser } from "~/hooks/useAuth";
import { type RouterOutput } from "~/server/api/root";
import { type UpdateVoucherInput } from "~/server/api/routers/voucher";
import { api } from "~/utils/api";

// Form validation schema
const formSchema = z.object({
  voucherWebsite: z.string().trim().url().optional(),
  voucherEmail: z.string().trim().email().optional(),
  voucherDescription: z.string().trim().min(1, "Description is required"),
  geo: z.object({
    x: z.number(),
    y: z.number(),
  }),
  locationName: z.string().trim().min(1, "Location is required"),
});

interface UpdateFormProps {
  onSuccess: () => void;
  voucher: Exclude<RouterOutput["voucher"]["byAddress"], undefined>;
}

const UpdateVoucherForm = ({ onSuccess, voucher }: UpdateFormProps) => {
  const { isConnected, address } = useAccount();
  const user = useUser();
  const toast = useToast();
  const router = useRouter();
  const utils = api.useContext();
  const { mutateAsync, isPending } = api.voucher.update.useMutation();
  const deleteMutation = api.voucher.remove.useMutation();

  const form = useForm<Omit<UpdateVoucherInput, "voucherAddress">>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      voucherWebsite: voucher.voucher_website,
      voucherEmail: voucher.voucher_email,
      voucherDescription: voucher.voucher_description,
      geo: voucher.geo,
      locationName: voucher.location_name,
    },
  });

  const handleMutate = async (
    formData: Omit<UpdateVoucherInput, "voucherAddress">
  ) => {
    try {
      await mutateAsync({
        voucherAddress: voucher.voucher_address as `0x${string}`,
        ...formData,
      });
      void utils.voucher.byAddress.invalidate({
        voucherAddress: voucher.voucher_address,
      });
      onSuccess();
    } catch (e) {
      console.error(e);
      toast.toast({ title: "Error updating voucher", variant: "destructive" });
    }
  };

  // Render alerts for wallet connection and authorization issues
  if (!isConnected || !address) {
    return (
      <Alert variant={"warning"}>
        <AlertTitle>Warning</AlertTitle>Please Connect your Wallet
      </Alert>
    );
  }
  if (!user || !user.isStaff) {
    return (
      <Alert variant={"destructive"}>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          You are not Authorized to Update this Voucher
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleMutate)}
        className="space-y-1 border-slate-50"
      >
        <InputField
          form={form}
          name="voucherWebsite"
          label="Website"
          placeholder="Website"
        />
        <InputField
          form={form}
          name="voucherEmail"
          label="Email"
          placeholder="Email"
        />
        <InputField
          form={form}
          name="voucherDescription"
          label="Description"
          placeholder="Description"
        />
        <MapField
          form={form}
          name="geo"
          label="Location"
          locationName="locationName"
        />
        <DialogFooter className="pt-8">
          {user.isAdmin && (
            <AreYouSureDialog
              onYes={() =>
                deleteMutation.mutate(
                  { voucherAddress: voucher.voucher_address },
                  { onSuccess: () => void router.push("/vouchers") }
                )
              }
            />
          )}
          <Button type="submit" disabled={!isConnected || isPending}>
            {isPending ? (
              <Loading />
            ) : isConnected ? (
              "Save"
            ) : (
              "Please Connect your Wallet"
            )}
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
};

export default UpdateVoucherForm;
