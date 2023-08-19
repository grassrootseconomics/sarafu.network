import { zodResolver } from "@hookform/resolvers/zod";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import {
  createPublicClient,
  hexToNumber,
  http,
  isAddress,
  stringToHex,
} from "viem";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { env } from "~/env.mjs";
import { useUser } from "~/hooks/useAuth";
import { getLocation } from "~/lib/geocoder";
import { cn } from "~/lib/utils";
import { type DeployVoucherInput } from "~/server/api/routers/voucher";
import { abi } from "../../contracts/erc20-token-index/contract";
import { getViemChain } from "../../lib/web3";
import { Checkbox } from "../ui/checkbox";

const LocationMapButton = dynamic(() => import("../map/location-map-button"), {
  ssr: false,
});

const publicClient = createPublicClient({
  chain: getViemChain(),
  transport: http(),
});
const PublishVoucherForm = ({
  onSubmit,
}: {
  onSubmit: (data: Omit<DeployVoucherInput, "voucherAddress">) => void;
}) => {
  const user = useUser();
  const formSchema = z.object({
    name: z.string().nonempty("Name is required"),
    symbol: z
      .string()
      .nonempty("Symbol is required")
      .refine(
        async (value) => {
          try {
            const res = await publicClient.readContract({
              address: env.NEXT_PUBLIC_TOKEN_INDEX_ADDRESS,
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
    geo: z
      .object({
        x: z.number(),
        y: z.number(),
      })
      .required(),
    location: z.string().nonempty("Location is required"),
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
      }),
    defaultSinkAddress: z
      .string()
      .nonempty("Default Sink Address is required")
      .refine(isAddress, { message: "Invalid address format" }),
    termsAndConditions: z.boolean().refine((value) => value === true, {
      message: "You must accept the terms and conditions",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      description: "",
      geo: undefined,
      location: "",
      symbol: "",
      demurrageRatePercentage: 2,
      periodMinutes: 43200,
      defaultSinkAddress: undefined,
    },
  });
  const handleFormSubmit = (formData: z.infer<typeof formSchema>) => {
    const data: Omit<DeployVoucherInput, "voucherAddress"> = {
      voucherName: formData.name,
      symbol: formData.symbol,
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
    if (!user) {
      return (
        <Alert variant="warning">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Please Connect your Wallet</AlertDescription>
        </Alert>
      );
    }
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
                  Name used for the voucher
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
              {<FormMessage /> || <FormDescription></FormDescription>}
            </FormItem>
          )}
        />
        <div>
          <FormField
            control={form.control}
            name="geo"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <div className="flex justify-center space-x-1">
                    <div className="flex flex-col">
                      <FormLabel className="p-1">Latitude</FormLabel>
                      <Input
                        placeholder="Latitude"
                        value={field.value?.x}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (isNaN(value) || value > 90 || value < -90) return;
                          form.setValue(field.name, {
                            ...field.value,
                            x: value,
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <FormLabel className="p-1">Longitude</FormLabel>
                      <Input
                        placeholder="Longitude"
                        value={field.value?.y}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (isNaN(value) || value > 180 || value < -180)
                            return;
                          form.setValue(field.name, {
                            ...field.value,
                            y: value,
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <FormLabel className="h-5"></FormLabel>
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
                            getLocation(d)
                              .then((location) => {
                                form.setValue("location", location);
                              })
                              .catch(console.error);
                          }
                        }}
                      />
                    </div>
                  </div>
                </FormControl>
                {<FormMessage /> || <FormDescription></FormDescription>}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel>Location Name</FormLabel>
                <FormControl>
                  <Input placeholder="Location Name" {...field} />
                </FormControl>
                {<FormMessage /> || (
                  <FormDescription>
                    This is the name of the location where the voucher is valid
                  </FormDescription>
                )}
              </FormItem>
            )}
          />
        </div>
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
              <FormControl>
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
                <Input placeholder="0x00..00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="termsAndConditions"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  <span className="font-normal">Accept </span>
                  <Link
                    rel="noopener noreferrer"
                    target="_blank"
                    className={cn(
                      buttonVariants({ variant: "link", size: "xs" }),
                      "p-0"
                    )}
                    href="/terms-and-conditions"
                  >
                    Terms and Conditions
                  </Link>
                </FormLabel>
                <FormDescription>
                  You agree to our Terms of Service and Privacy Policy
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <div className="pt-4 flex justify-center">
          <Button type="submit" disabled={!user || !form.formState.isDirty}>
            {user ? "Publish Contract" : "Please Connect your Wallet"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default PublishVoucherForm;
