import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { erc20Abi, formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { z } from "zod";
import { InputField } from "~/components/forms/fields/input-field";
import { TextAreaField } from "~/components/forms/fields/textarea-field";
import { Loading } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { CUSD_TOKEN_ADDRESS, NORMIE_LIQUIDITY_ADDRESS } from "~/lib/contacts";
import { trpc } from "~/lib/trpc";
import { type SwapPool } from "../types";

const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  purpose: z.string().min(1, "Purpose is required"),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
});

interface NormieDonationFormProps {
  pool: SwapPool;
  onSuccess?: () => void;
}

export function NormieDonationForm({ pool }: NormieDonationFormProps) {
  // Query cUSD balance
  const { data: balanceData } = useReadContract({
    address: CUSD_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [NORMIE_LIQUIDITY_ADDRESS],
  });

  // Calculate max amount (round down to nearest 10)
  const availableLiquidity = balanceData
    ? Math.floor(Number(formatUnits(balanceData, 18)) / 10) * 10
    : 10000; // fallback to 10000 if balance query fails

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),

    defaultValues: {
      name: "",
      email: "",
      purpose: "",
    },
  });
  const amount = form.watch("amount");
  const checkout = trpc.checkout.square.useMutation();

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const result = await checkout.mutateAsync({
        name: data.name,
        email: data.email,
        purpose: data.purpose,
        poolAddress: pool.address,
        poolName: pool.name ?? "Pool",
        amount: Math.floor(data.amount * 100), // Convert to cents
      });

      // Redirect to Square checkout
      if (result.result.checkoutURL) {
        window.location.href = result.result.checkoutURL;
      }
    } catch (error) {
      toast.error("Failed to create checkout session");
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-4"
      >
        <InputField
          form={form}
          name="name"
          label="Name"
          placeholder="Enter your name"
        />
        <InputField
          form={form}
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
        />
        <TextAreaField
          form={form}
          name="purpose"
          label="Purpose"
          placeholder="Purpose"
        />
        <InputField
          form={form}
          name="amount"
          label="Amount (USD)"
          type="number"
          placeholder="Enter amount"
        />
        {/* Available Liquidity Amount */}
        <div className="flex items-center justify-end">
          <span className="text-sm text-gray-500">
            {`Available Liquidity: $${availableLiquidity ?? "0"}`}
          </span>
        </div>
        {/* If the amount exceeds the current available liquidity, show a warning */}
        {amount > availableLiquidity && (
          <div className="mt-2 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-900/20">
            <div className="flex items-start space-x-3">
              <AlertTriangleIcon className="h-5 w-5 flex-shrink-0 text-orange-500" />
              <div className="flex-1">
                <h4 className="mb-1 font-medium text-orange-900 dark:text-orange-200">
                  Queued Transaction Notice
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  The requested amount exceeds available liquidity. Your
                  transaction will be:
                  <ul className="mt-1 list-disc pl-4">
                    <li>Automatically queued for processing</li>
                    <li>
                      Completed within 24 hours when liquidity is available
                    </li>
                  </ul>
                </p>
              </div>
            </div>
          </div>
        )}
        <Button type="submit" className="w-full" disabled={checkout.isPending}>
          {checkout.isPending ? <Loading /> : "Proceed to Payment"}
        </Button>
      </form>
    </Form>
  );
}
