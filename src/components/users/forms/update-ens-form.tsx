import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEnsName } from "wagmi";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { trpc } from "~/lib/trpc";

const UpdateENSFormSchema = z.object({
  // Validate only the prefix part entered by the user
  ensPrefix: z
    .string()
    .min(1, { message: "ENS name prefix cannot be empty." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Only lowercase letters, numbers, and hyphens allowed.",
    }),
});

const ensSuffix = ".sarafu.eth";

export function UpdateENSForm({ onSuccess }: { onSuccess?: () => void }) {
  const { data: currentEnsName, refetch: refetchEnsName } = useEnsName();
  const update = trpc.me.updateENS.useMutation();

  const form = useForm<z.infer<typeof UpdateENSFormSchema>>({
    resolver: zodResolver(UpdateENSFormSchema),
    defaultValues: {
      ensPrefix: "",
    },
  });

  // Pre-fill the form with the current ENS prefix if it exists
  useEffect(() => {
    if (currentEnsName && currentEnsName.endsWith(ensSuffix)) {
      const prefix = currentEnsName.substring(
        0,
        currentEnsName.length - ensSuffix.length
      );
      form.setValue("ensPrefix", prefix);
    } else {
      // Clear if the current ENS doesn't match the expected format or doesn't exist
      form.setValue("ensPrefix", "");
    }
  }, [currentEnsName, form]);

  async function handleUpdate(data: z.infer<typeof UpdateENSFormSchema>) {
    const fullEnsName = `${data.ensPrefix}${ensSuffix}`;
    try {
      const response = await update.mutateAsync({ ens: fullEnsName });
      toast.success(response.message ?? "ENS name updated successfully.");
      await refetchEnsName();
      form.reset({ ensPrefix: data.ensPrefix }); // Keep the prefix after successful update
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update ENS name."
      );
      console.error("Failed to update ENS:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
        <FormField
          control={form.control}
          name="ensPrefix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ENS Name Prefix</FormLabel>
              <FormControl>
                {/* Container for Input and suffix */}
                <div className="relative flex items-center">
                  {/* Adjust padding-right to make space for the suffix */}
                  <Input
                    type="text"
                    placeholder="your-name"
                    {...field}
                    className="pr-28" // Increased padding right
                  />
                  {/* Static suffix display */}
                  <span className="absolute right-3 text-muted-foreground pointer-events-none">
                    {ensSuffix}
                  </span>
                </div>
              </FormControl>
              <FormDescription>
                Enter the desired prefix for your ENS name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? "Updating..." : "Update ENS"}
        </Button>
      </form>
    </Form>
  );
}
