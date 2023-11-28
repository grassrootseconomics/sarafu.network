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
import { useUser } from "~/hooks/useAuth";
import { type RouterOutput } from "~/server/api/root";
import { type UpdateVoucherInput } from "~/server/api/routers/voucher";
import { api } from "~/utils/api";

interface UpdateFormProps {
  onSuccess: () => void;
  voucher: Exclude<RouterOutput["voucher"]["byAddress"], undefined>;
}
const UpdateVoucherForm = (props: UpdateFormProps) => {
  const { isConnected, address } = useAccount();
  const user = useUser();
  const router = useRouter();
  const utils = api.useUtils();
  const { mutateAsync, isLoading } = api.voucher.update.useMutation({
    onSuccess: () => {
      void utils.voucher.byAddress.invalidate({
        voucherAddress: props.voucher.voucher_address as string,
      });
    },
  });
  const deleteMutation = api.voucher.remove.useMutation({
    onSuccess: () => {
      void utils.voucher.byAddress.invalidate({
        voucherAddress: props.voucher.voucher_address as string,
      });
    },
  });
  const formSchema = z.object({
    voucherDescription: z.string().min(1, "Description is required"),
    geo: z.object({
      x: z.number(),
      y: z.number(),
    }),
    locationName: z.string().min(1, "Location is required"),
  });

  const form = useForm<Omit<UpdateVoucherInput, "voucherAddress">>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  });

  const handleMutate = (
    formData: Omit<UpdateVoucherInput, "voucherAddress">
  ) => {
    const data: UpdateVoucherInput = {
      voucherDescription: formData.voucherDescription,
      geo: formData.geo,
      locationName: formData.locationName,
      voucherAddress: props.voucher.voucher_address as `0x${string}`,
    };
    mutateAsync(data).catch((e) => {
      console.error(e);
    });
  };

  if (!isConnected || !address) {
    return (
      <Alert variant={"warning"}>
        <AlertTitle>Warning</AlertTitle>
        Please Connect your Wallet
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
      <form onSubmit={form.handleSubmit(handleMutate)} className="space-y-1 border-slate-50">
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

        <DialogFooter>
          {user.isAdmin && (
            <AreYouSureDialog
              onYes={() =>
                deleteMutation.mutate(
                  {
                    voucherAddress: props.voucher.voucher_address!,
                  },
                  {
                    onSuccess: () => {
                      void router.push("/vouchers");
                    },
                  }
                )
              }
            />
          )}
          <Button type="submit" disabled={!isConnected || isLoading}>
            {isLoading ? (
              <Loading />
            ) : isConnected && !isLoading ? (
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
