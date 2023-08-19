import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil2Icon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { z } from "zod";
import { Loading } from "~/components/loading";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useUser } from "~/hooks/useAuth";
import { type UpdateVoucherInput } from "~/server/api/routers/voucher";
import { type Point } from "~/server/db/db";
import { api } from "~/utils/api";
import AreYouSureDialog from "../dialogs/are-you-sure";

const LocationMapButton = dynamic(() => import("../map/location-map-button"), {
  ssr: false,
});

interface UpdateFormProps {
  voucher: {
    voucher_name?: string | undefined;
    voucher_description?: string | undefined;
    location_name?: string | null | undefined;
    voucher_address?: string | undefined;
    geo: Point | null;
    sink_address?: string | undefined;
    demurrage_rate?: string | undefined;
  };
}
const UpdateVoucherDialog = ({ voucher }: UpdateFormProps) => {
  const { isConnected, address } = useAccount();
  const [open, setOpen] = useState(false);
  const user = useUser();
  const router = useRouter();
  const utils = api.useContext();
  const { mutateAsync, isLoading } = api.voucher.update.useMutation({
    onSuccess: () => {
      void utils.voucher.byAddress.invalidate({
        voucherAddress: voucher.voucher_address as string,
      });
      setOpen(false);
    },
  });
  const deleteMutation = api.voucher.remove.useMutation({
    onSuccess: () => {
      void utils.voucher.byAddress.invalidate({
        voucherAddress: voucher.voucher_address as string,
      });
      setOpen(false);
    },
  });
  const formSchema = z.object({
    voucherDescription: z.string().nonempty("Description is required"),
    geo: z.object({
      x: z.number(),
      y: z.number(),
    }),
    locationName: z.string().nonempty("Location is required"),
  });

  const form = useForm<Omit<UpdateVoucherInput, "voucherAddress">>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      voucherDescription: voucher.voucher_description ?? "",
      geo: {
        x: voucher.geo?.x ?? 0,
        y: voucher.geo?.y ?? 0,
      },
      locationName: voucher.location_name ?? "",
    },
  });

  const handleMutate = (
    formData: Omit<UpdateVoucherInput, "voucherAddress">
  ) => {
    console.log(formData);
    const data: UpdateVoucherInput = {
      voucherDescription: formData.voucherDescription,
      geo: formData.geo,
      locationName: formData.locationName,
      voucherAddress: voucher.voucher_address as `0x${string}`,
    };
    mutateAsync(data).catch((e) => {
      console.error(e);
    });
  };

  const buildForm = () => {
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
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={form.handleSubmit(handleMutate)}
          className="space-y-1"
        >
          <DialogHeader>
            <DialogTitle>Edit Voucher</DialogTitle>
            <DialogDescription>
              {"Make changes to the voucher here. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>

          <FormField
            control={form.control}
            name="voucherDescription"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Description" {...field} />
                </FormControl>
                {<FormMessage />}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="locationName"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Location Name</FormLabel>
                <FormControl>
                  <Input placeholder="Location Name" {...field} />
                </FormControl>
                {<FormMessage />}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="geo"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Geo</FormLabel>
                <FormControl>
                  <LocationMapButton
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    value={
                      field.value
                        ? { lat: field.value.x, lng: field.value.y }
                        : undefined
                    }
                    onSelected={(d) => {
                      if (d) {
                        form.setValue("geo", { x: d.lat, y: d.lng });
                      }
                    }}
                  />
                </FormControl>
                {<FormMessage />}
              </FormItem>
            )}
          />

          <DialogFooter className="mt-4">
            {user.isAdmin && (
              <AreYouSureDialog
                onYes={() =>
                  deleteMutation.mutate(
                    {
                      voucherAddress: voucher.voucher_address!,
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
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil2Icon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">{buildForm()}</DialogContent>
    </Dialog>
  );
};

export default UpdateVoucherDialog;
