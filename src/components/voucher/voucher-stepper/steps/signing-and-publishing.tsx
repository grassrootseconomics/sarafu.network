import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InfoAlert } from "~/components/alert";
import { buttonVariants } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useUser } from "~/hooks/useAuth";
import { cn } from "~/lib/utils";
import { StepControls } from "../controls";
import {
  useVoucherData,
  useVoucherForm,
  type FormSchemaType,
} from "../provider";

export const signAndPublishSchema = z.object({
  pathLicense: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and conditions",
  }),
  termsAndConditions: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type FormValues = z.infer<typeof signAndPublishSchema>;

// This can come from your database or API.
const defaultValues: Partial<FormValues> = {};
export const SigningAndPublishingStep = () => {
  const data = useVoucherData() as FormSchemaType;
  const user = useUser();
  const { values, onValid } = useVoucherForm("signAndPublishSchema");

  const form = useForm<FormValues>({
    resolver: zodResolver(signAndPublishSchema),
    mode: "onChange",
    defaultValues: values ?? defaultValues,
  });

  return (
    <div className="w-full rounded-lg p-4 text-left bg-white shadow-md">
      <div className="max-w-screen-lg mx-auto p-5">
        <div className="font-light">
          <h1 className="text-4xl font-bold mb-4">
            Community Asset Voucher (CAV) Declaration
          </h1>
          <h2 className="text-2xl font-semibold mb-2">Preamble</h2>
          <p className="mb-4">
            I, <span className="font-semibold">{data.aboutYou.name}</span>,
            hereby agree to publish a Community Asset Voucher on the Celo ledger
            and do not hold Grassroots Economics Foundation liabile for any
            damages and understand there is no warrenty included or implied.
          </p>
          <h2 className="text-2xl font-semibold mb-2">CAV Info</h2>
          <p className="mb-2">
            Name:{" "}
            <span className="font-semibold">{data.nameAndProducts.name}</span>
          </p>
          <p className="mb-2">
            Symbol:{" "}
            <span className="font-semibold">{data.nameAndProducts.symbol}</span>
          </p>
          <p className="mb-2">
            Supply:{" "}
            <span className="font-semibold">{data.valueAndSupply.supply}</span>
          </p>
          <p className="mb-2">
            Unit of Account and Denomination:{" "}
            <span className="font-semibold">{data.valueAndSupply.uoa}</span>
          </p>
          <p className="mb-2">
            CAV Value per Unit of Account:{" "}
            <span className="font-semibold">{data.valueAndSupply.value}</span>
          </p>
          <InfoAlert
            message={`The supply of ${data.valueAndSupply.supply} ${
              data.nameAndProducts?.symbol
            } - valued at ${
              data.valueAndSupply.supply * data.valueAndSupply.value
            } ${
              data.valueAndSupply.uoa
            }, will be redeemable as payment for the following products:`}
          />

          <p className="mb-2">Product Offering and Value:</p>
          <div className="mb-2">
            {data.nameAndProducts.products &&
              data.nameAndProducts.products.map((product, index) => (
                <li key={index}>
                  <strong>{product.quantity}</strong>{" "}
                  <strong>{product.name}</strong> can be purchased every
                  <strong> {product.frequency}</strong> using this CAV as
                  payment
                </li>
              ))}
          </div>

          <p className="mb-2">
            Issuer Account Address:{" "}
            <span className="font-semibold">
              {data.options.transferAddress ?? user?.account.blockchain_address}
            </span>
          </p>

          {data.expiration.type === "gradual" ||
            (data.expiration.type === "both" && (
              <>
                <p className="mb-2">
                  Expiration Rate:{" "}
                  <span className="font-semibold">{data.expiration.rate}</span>
                </p>
                <p className="mb-2">
                  Community Account for Expired CAVs:{" "}
                  <span className="font-semibold">
                    {data.expiration.communityFund}
                  </span>
                </p>
              </>
            ))}
          <h2 className="text-2xl font-semibold mb-2">Addendum</h2>
          <p className="mb-2">
            Good Faith: You the issuer of this CAV and any holders into this
            agreement in good faith and holds harmless other members of the
            Grassroots Economics Foundation
          </p>
          <p className="mb-2">
            Entirety: this agreement represents your consent (and or that of the
            association your are representing)
          </p>
          <h2 className="text-2xl font-semibold mb-2">Official Signatories</h2>
          <p className="mb-2">
            Title:{" "}
            <span className="font-semibold">
              {data.aboutYou.type === "group" ? "Director" : "Individual"}
            </span>
          </p>
          <p className="mb-2">
            Full Name:{" "}
            <span className="font-semibold">{data.aboutYou.name}</span>
          </p>
          <p className="mb-2">
            Contact Address:{" "}
            <span className="font-semibold">{data.aboutYou.email}</span>
          </p>
          <p className="mb-2">
            Website:{" "}
            <span className="font-semibold">{data.aboutYou.website}</span>
          </p>
          <p className="mb-2">
            On behalf of:{" "}
            <span className="font-semibold">{data.aboutYou.name}</span>
          </p>

          <p className="mb-2">
            Date of Signing:{" "}
            <span className="font-semibold">
              {new Date().toLocaleDateString()}
            </span>
          </p>
        </div>
        <Form {...form}>
          <form>
            <div className="flex-col items-center justify-center mt-4">
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
              <FormField
                control={form.control}
                name="pathLicense"
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
                          href="https://docs.grassecon.org/commons/path/"
                        >
                          Public Awareness & Transparent Heritage (PATH) License
                        </Link>
                      </FormLabel>
                      <FormDescription>
                        You allow your CAV to be freely traded/resold.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
      <StepControls
        onNext={form.handleSubmit(onValid, (e) => console.error(e))}
      />
    </div>
  );
};
