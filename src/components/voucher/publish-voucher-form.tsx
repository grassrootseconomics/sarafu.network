import { zodResolver } from "@hookform/resolvers/zod";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { FormProvider, useForm } from "react-hook-form";
import {
  createPublicClient,
  hexToNumber,
  http,
  isAddress,
  stringToHex,
} from "viem";
import { useAccount } from "wagmi";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { type DeployVoucherInput } from "~/server/api/routers/voucher";
import { abi } from "../../contracts/erc20-token-index/contract";
import { getViemChain } from "../../lib/web3";

const LocationMapButton = dynamic(() => import("../location-map-button"), {
  ssr: false,
});
interface FormValues {
  name: string;
  description: string;
  geo: {
    x: number;
    y: number;
  };
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

const PublishVoucherForm = ({
  onSubmit,
}: {
  onSubmit: (data: Omit<DeployVoucherInput, "voucherAddress">) => void;
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
    geo: z.object({
      x: z.number(),
      y: z.number(),
    }),
    location: z.string().nonempty("Location is required"),
    decimals: z.coerce
      .number()
      .positive("Decimals must be a positive integer")
      .int("Decimals must be a positive integer")
      .refine((value) => Number.isInteger(value), {
        message: "Decimals must be a positive integer",
      })
      .default(6),
    demurrageRatePercentage: z
      .number()
      .positive("Demurrage Rate must be positive")
      .refine((value) => !isNaN(value), {
        message: "Demurrage Rate must be a number",
      }),
    periodMinutes: z.coerce
      .number()
      .positive("Period Minutes must be a positive integer")
      .int("Period Minutes must be a positive integer")
      .refine((value) => Number.isInteger(value) && value > 0, {
        message: "Period Minutes must be a positive integer",
      })
      .default(43200),
    defaultSinkAddress: z
      .string()
      .nonempty("Default Sink Address is required")
      .refine(isAddress, { message: "Invalid address format" }),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  });
  const handleFormSubmit = (formData: FormValues) => {
    const data: Omit<DeployVoucherInput, "voucherAddress"> = {
      voucherName: formData.name,
      symbol: formData.symbol,
      decimals: formData.decimals,
      demurrageRate: formData.demurrageRatePercentage / 100,
      periodMinutes: formData.periodMinutes,
      sinkAddress: formData.defaultSinkAddress,
      voucherDescription: formData.description,
      geo: formData.geo,
      locationName: formData.location,
      supply: 0,
    };
    onSubmit(data);
  };
  const Warning = () => {
    if (!isConnected || !address)
      return (
        <Alert variant="warning">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Please Connect your Wallet</AlertDescription>
        </Alert>
      );
    if (authorizedAddresses.includes(address)) return null;
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          You are not using an Authorized address to deploy this contract. This
          mean that you will be able to deploy the Voucher to the blockchain but
          it will not be visible on the website.
        </AlertDescription>
      </Alert>
    );
  };
  return (
    <FormProvider {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-1"
      >
        <Warning />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
              </FormControl>
              {<FormMessage /> || (
                <FormDescription>
                  This is the symbol used for the voucher
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel>Symbol</FormLabel>
              <FormControl>
                <Input placeholder="Symbol" {...field} />
              </FormControl>
              {<FormMessage /> || (
                <FormDescription>
                  This is the symbol used for the voucher
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Description" {...field} />
              </FormControl>
              {<FormMessage /> || (
                <FormDescription>
                  This is the name that will be displayed on the voucher page
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <div>
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Location" {...field} />
                </FormControl>
                {<FormMessage /> || (
                  <FormDescription>
                    This is the name of the location where the voucher is valid
                  </FormDescription>
                )}
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
                  <div className="flex justify-center">
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
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="decimals"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel>Decimals</FormLabel>
              <FormControl defaultValue={6}>
                <Input type="number" placeholder="Decimals" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="demurrageRatePercentage"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel>Demurrage Rate (%)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Demurrage Rate (%)"
                  {...form.register("demurrageRatePercentage", {
                    valueAsNumber: true,
                    value: 2,
                  })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="periodMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Period Minutes</FormLabel>
              <FormControl defaultValue={43200}>
                <Input type="number" placeholder="Period Minutes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultSinkAddress"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel>Community Fund Address</FormLabel>
              <FormControl>
                <Input placeholder="Community Fund Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="pt-4 flex justify-center">
          <Button type="submit" disabled={!isConnected}>
            {isConnected ? "Deploy Contract" : "Please Connect your Wallet"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default PublishVoucherForm;
