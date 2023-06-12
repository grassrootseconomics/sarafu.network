import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertTitle, Box, Button, Card, TextField } from "@mui/material";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import {
  createPublicClient,
  hexToNumber,
  http,
  isAddress,
  stringToHex,
} from "viem";
import { useAccount } from "wagmi";
import { z } from "zod";
import { InsertVoucherBody } from "../../pages/api/deploy";
import { abi } from "../contracts/erc20-token-index/contract";
import { getViemChain } from "../lib/web3";
const LocationMapButton = dynamic(() => import("./LocationMapButton"), {
  ssr: false,
});
interface FormValues {
  name: string;
  description: string;
  geo: string;
  location: string;
  symbol: string;
  decimals: number;
  demurrageRatePercentage: number;
  periodMinutes: number;
  defaultSinkAddress: `0x${string}`;
}

const authorizedAddresses = (
  process.env.NEXT_PUBLIC_AUTHORIZED_ADDRESSES as string
).split(",");
const ContractDeploymentForm = ({
  onSubmit,
}: {
  onSubmit: (
    data: Omit<InsertVoucherBody["voucher"], "voucherAddress">
  ) => void;
}) => {
  const { isConnected, address } = useAccount();
  const formSchema = z.object({
    name: z.string().nonempty("Name is required"),
    symbol: z
      .string()
      .nonempty("Symbol is required")
      .refine(
        async (value) => {
          try {
            const publicClient = createPublicClient({
              chain: getViemChain(),
              transport: http(),
            });
            const res = await publicClient.readContract({
              address: process.env
                .NEXT_PUBLIC_TOKEN_INDEX_ADDRESS as `0x${string}`,
              abi: abi,
              functionName: "addressOf",
              args: [stringToHex(value, { size: 32 })],
            });
            const exists = hexToNumber(res) !== 0;
            return !exists;
          } catch (error) {
            console.error(error);
          }
        },
        { message: "Symbol already exists in the Token Index" }
      ),
    description: z.string().nonempty("Description is required"),
    geo: z.string(),
    location: z.string().nonempty("Location is required"),
    decimals: z
      .number()
      .positive("Decimals must be a positive integer")
      .int("Decimals must be a positive integer")
      .refine((value) => Number.isInteger(value), {
        message: "Decimals must be a positive integer",
      }),
    demurrageRatePercentage: z
      .number()
      .positive("Demurrage Rate must be positive")
      .refine((value) => !isNaN(value), {
        message: "Demurrage Rate must be a number",
      }),
    periodMinutes: z
      .number()
      .positive("Period Minutes must be a positive integer")
      .int("Period Minutes must be a positive integer")
      .refine((value) => Number.isInteger(value) && value > 0, {
        message: "Period Minutes must be a positive integer",
      }),
    defaultSinkAddress: z
      .string()
      .nonempty("Default Sink Address is required")
      .refine(isAddress, { message: "Invalid address format" }),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  });
  const [geo] = watch(["geo"]);
  const handleFormSubmit = (formData: FormValues) => {
    const data: Omit<InsertVoucherBody["voucher"], "voucherAddress"> = {
      voucherName: formData.name,
      symbol: formData.symbol,
      decimals: formData.decimals,
      demurrageRate: formData.demurrageRatePercentage / 100,
      periodMinutes: formData.periodMinutes,
      sinkAddress: formData.defaultSinkAddress,
      voucherDescription: formData.description,
      geo: formData.geo,
      locationName: formData.location,
      supply: 40,
    };
    onSubmit(data);
  };
  const Warning = () => {
    if (!isConnected || !address)
      return (
        <Alert severity="warning">
          <AlertTitle>Warning</AlertTitle>
          Please Connect your Wallet
        </Alert>
      );
    if (authorizedAddresses.includes(address)) return null;
    return (
      <Alert severity="warning">
        <AlertTitle>Warning</AlertTitle>
        You are not using an Authorized address to deploy this contract. This
        mean that you will be able to deploy the Voucher to the blockchain but
        it will not be visible on the website.
      </Alert>
    );
  };
  return (
    <Card sx={{ p: 2, my: 2 }}>
      <Warning />
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <TextField
          size="small"
          label="Name"
          {...register("name")}
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message}
          margin="normal"
        />
        <TextField
          size="small"
          label="Symbol"
          {...register("symbol")}
          fullWidth
          error={!!errors.symbol}
          helperText={errors.symbol?.message}
          margin="normal"
        />
        <TextField
          size="small"
          label="Description"
          {...register("description")}
          fullWidth
          error={!!errors.description}
          helperText={errors.description?.message}
          margin="normal"
        />
        <Box display={"flex"} justifyContent={"center"}>
          <TextField
            size="small"
            label="Location"
            {...register("location")}
            fullWidth
            error={!!errors.location}
            helperText={errors.location?.message}
            margin="normal"
          />
          <LocationMapButton
            value={geo}
            onSelected={(d) => setValue("geo", d)}
          />
        </Box>
        <TextField
          size="small"
          label="Decimals"
          type="number"
          // inputMode="numeric"
          {...register("decimals", { valueAsNumber: true, value: 6 })}
          fullWidth
          error={!!errors.decimals}
          helperText={errors.decimals?.message}
          margin="normal"
        />
        <TextField
          size="small"
          label="Demurrage Rate (%)"
          {...register("demurrageRatePercentage", {
            valueAsNumber: true,
            value: 2,
          })}
          fullWidth
          type="number"
          error={!!errors.demurrageRatePercentage}
          helperText={errors.demurrageRatePercentage?.message}
          margin="normal"
        />
        <TextField
          size="small"
          label="Period Minutes"
          type="number"
          {...register("periodMinutes", {
            valueAsNumber: true,
            value: 43200,
          })}
          fullWidth
          error={!!errors.periodMinutes}
          helperText={errors.periodMinutes?.message}
          margin="normal"
        />
        <TextField
          size="small"
          label="Default Sink Address"
          {...register("defaultSinkAddress")}
          fullWidth
          error={!!errors.defaultSinkAddress}
          helperText={errors.defaultSinkAddress?.message}
          margin="normal"
        />

        <Box sx={{ w: "100%" }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isConnected}
            sx={{ mt: 2, mx: "auto", display: "block" }}
          >
            {isConnected ? "Deploy Contract" : "Please Connect your Wallet"}
          </Button>
        </Box>
      </form>
    </Card>
  );
};

export default ContractDeploymentForm;
