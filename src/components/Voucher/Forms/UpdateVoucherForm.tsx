import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertTitle, Box, Button, TextField } from "@mui/material";
import { type Vouchers } from "kysely-codegen";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { z } from "zod";
import { Loading } from "~/components/Loading";
import { type UpdateVoucherInput } from "~/server/api/routers/voucher";
import { api } from "~/utils/api";

const LocationMapButton = dynamic(() => import("../../LocationMapButton"), {
  ssr: false,
});

const authorizedAddresses = (
  process.env.NEXT_PUBLIC_AUTHORIZED_ADDRESSES as string
).split(",");

const UpdateVoucherForm = ({
  voucher,
  onComplete,
}: {
  voucher: Vouchers;
  onComplete: (success: boolean) => void;
}) => {
  const { isConnected, address } = useAccount();
  const { mutateAsync, isLoading } = api.voucher.update.useMutation();
  const formSchema = z.object({
    voucherDescription: z.string().nonempty("Description is required"),
    geo: z.object({
      x: z.number(),
      y: z.number(),
    }),
    locationName: z.string().nonempty("Location is required"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Omit<UpdateVoucherInput, "voucherAddress">>({
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
  const [geo] = watch(["geo"]);

  const handleMutate = (
    formData: Omit<UpdateVoucherInput, "voucherAddress">
  ) => {
    const data: UpdateVoucherInput = {
      voucherDescription: formData.voucherDescription,
      geo: formData.geo,
      locationName: formData.locationName,
      voucherAddress: voucher.voucher_address as `0x${string}`,
    };
    mutateAsync(data)
      .then(() => {
        onComplete(true);
      })
      .catch((err) => {
        console.error(err);
        onComplete(false);
      });
  };

  if (isLoading) {
    return <Loading />;
  }
  if (!isConnected || !address) {
    return (
      <Alert severity="warning">
        <AlertTitle>Warning</AlertTitle>
        Please Connect your Wallet
      </Alert>
    );
  }
  if (!authorizedAddresses.includes(address)) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        You are not Authorized to Update this Voucher
      </Alert>
    );
  }
  return (
    /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
    <form onSubmit={handleSubmit(handleMutate)}>
      <TextField
        size="small"
        label="Description"
        {...register("voucherDescription")}
        fullWidth
        error={!!errors.voucherDescription}
        helperText={errors.voucherDescription?.message}
        margin="normal"
      />
      <Box display={"flex"} justifyContent={"center"}>
        <TextField
          size="small"
          label="Location"
          {...register("locationName")}
          fullWidth
          error={!!errors.locationName}
          helperText={errors.locationName?.message}
          margin="normal"
        />
        <LocationMapButton
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          value={geo ? { lat: geo.x, lng: geo.y } : undefined}
          onSelected={(d) => {
            if (d) {
              setValue("geo", { x: d.lat, y: d.lng });
            }
          }}
        />
      </Box>
      {JSON.stringify(errors)}
      <Box sx={{ w: "100%" }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!isConnected}
          sx={{ mt: 2, mx: "auto", display: "block" }}
        >
          {isConnected ? "Update Contract" : "Please Connect your Wallet"}
        </Button>
      </Box>
    </form>
  );
};

export default UpdateVoucherForm;
