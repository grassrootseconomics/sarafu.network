import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { InputField } from "~/components/forms/fields/input-field";
import { TextAreaField } from "~/components/forms/fields/textarea-field";
import { Loading } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { trpc } from "~/lib/trpc";
import { type SwapPool } from "../types";

const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  purpose: z.string().min(1, "Purpose is required"),
  amount: z.coerce
    .number()
    .min(1, "Amount must be at least 1")
    .max(10000, "Amount cannot exceed 10,000"),
});

interface NormieDonationFormProps {
  pool: SwapPool;
  onSuccess?: () => void;
}

export function NormieDonationForm({
  pool,
  onSuccess,
}: NormieDonationFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      purpose: "",
      amount: 0,
    },
  });

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
        onSuccess?.();
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
          placeholder="Enter amount to donate"
        />

        <Button type="submit" className="w-full" disabled={checkout.isPending}>
          {checkout.isPending ? <Loading /> : "Proceed to Payment"}
        </Button>
      </form>
    </Form>
  );
}
