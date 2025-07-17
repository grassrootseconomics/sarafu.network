import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Globe, Loader2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { z } from "zod";
import { useStatus } from "~/components/status";
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
import { Skeleton } from "~/components/ui/skeleton";
import { useDebounce } from "~/hooks/use-debounce";
import { useENS } from "~/lib/sarafu/resolver";
import { client, trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";

const sarafuENSSuffix = ".sarafu.eth";

export function UpsertENSForm({ onSuccess }: { onSuccess?: () => void }) {
  const account = useAccount();
  const {
    data: currentEnsName,
    refetch: refetchEnsName,
    isLoading: isLoadingCurrentEns,
  } = useENS({
    address: account.address,
  });

  const [availabilityStatus, setAvailabilityStatus] = useState<
    "available" | "taken" | "checking" | null
  >(null);

  // Use ref to track the latest request to prevent race conditions
  const latestRequestRef = useRef<string | null>(null);

  const status = useStatus();
  const upsert = trpc.ens.upsert.useMutation();

  // Simplified validation schema without async refine
  const UpsertENSFormSchema = z.object({
    ensPrefix: z
      .string()
      .min(1, { message: "ENS name prefix cannot be empty." })
      .min(3, { message: "ENS name must be at least 3 characters long." })
      .max(20, { message: "ENS name cannot exceed 20 characters." })
      .regex(/^[a-z0-9-]+$/, {
        message: "Only lowercase letters, numbers, and hyphens allowed.",
      })
      .regex(/^[a-z0-9].*[a-z0-9]$|^[a-z0-9]$/, {
        message: "Cannot start or end with a hyphen.",
      }),
  });

  const form = useForm<z.infer<typeof UpsertENSFormSchema>>({
    resolver: zodResolver(UpsertENSFormSchema),
    defaultValues: {
      ensPrefix: "",
    },
    mode: "onChange",
  });

  const watchedPrefix = form.watch("ensPrefix");
  const debouncedPrefix = useDebounce(watchedPrefix, 500);

  // Check availability for debounced input
  useEffect(() => {
    if (!debouncedPrefix || debouncedPrefix.length < 3) {
      setAvailabilityStatus(null);
      return;
    }

    // Check if input is valid according to schema before checking availability
    const result = UpsertENSFormSchema.safeParse({
      ensPrefix: debouncedPrefix,
    });
    if (!result.success) {
      setAvailabilityStatus(null);
      return;
    }

    const checkAvailability = async () => {
      const currentRequest = debouncedPrefix;
      latestRequestRef.current = currentRequest;

      setAvailabilityStatus("checking");

      try {
        const exists = await client.ens.exists.query({
          ensName: `${debouncedPrefix}${sarafuENSSuffix}`,
        });

        // Only update state if this is still the latest request
        if (latestRequestRef.current === currentRequest) {
          const isAvailable = !exists;
          setAvailabilityStatus(isAvailable ? "available" : "taken");
        }
      } catch {
        // Only update state if this is still the latest request
        if (latestRequestRef.current === currentRequest) {
          setAvailabilityStatus(null);
        }
      }
    };

    void checkAvailability();
  }, [debouncedPrefix]);

  // Pre-fill the form with the current ENS prefix if it exists
  useEffect(() => {
    if (currentEnsName && currentEnsName.name.endsWith(sarafuENSSuffix)) {
      const prefix = currentEnsName.name.substring(
        0,
        currentEnsName.name.length - sarafuENSSuffix.length
      );
      form.setValue("ensPrefix", prefix);
    } else if (!isLoadingCurrentEns) {
      form.setValue("ensPrefix", "");
    }
  }, [currentEnsName, form, isLoadingCurrentEns]);

  async function handleSubmit(data: z.infer<typeof UpsertENSFormSchema>) {
    // Additional validation before submit - ensure name is available
    if (availabilityStatus !== "available") {
      form.setError("ensPrefix", {
        type: "manual",
        message: "Please choose an available ENS name.",
      });
      return;
    }

    status.pending(
      "Registering ENS name...",
      "Please wait while we register your ENS name. This may take a few moments.",
      undefined,
      "compact"
    );

    const fullEnsName = `${data.ensPrefix}${sarafuENSSuffix}`;

    try {
      const response = await upsert.mutateAsync({ ensName: fullEnsName });
      await refetchEnsName();

      status.success(
        "ENS Registration Successful!",
        <>
          Your ENS name <strong>{response.name}</strong> has been registered
          successfully. You can now use this name to receive transactions.
        </>,
        <Button onClick={() => status.reset()} className="mt-2">
          Continue
        </Button>
      );

      form.reset({ ensPrefix: data.ensPrefix });
      onSuccess?.();
    } catch (error) {
      status.error(
        "Registration Failed",
        error instanceof Error
          ? error.message
          : "Unable to register your ENS name. Please check your connection and try again.",
        <Button
          onClick={() => status.reset()}
          variant="outline"
          className="mt-2"
        >
          Try Again
        </Button>
      );
    }
  }

  // Show status component when active
  if (status.Status) {
    return <div className="space-y-4">{status.Status}</div>;
  }

  // Loading state for initial data
  if (isLoadingCurrentEns) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const isFormValid =
    form.formState.isValid && availabilityStatus === "available";
  const hasCurrentEns =
    currentEnsName && currentEnsName.name.endsWith(sarafuENSSuffix);

  return (
    <div className="space-y-6">
      {/* Current ENS Display */}
      {hasCurrentEns && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Current ENS Name
              </p>
              <p className="font-semibold">{currentEnsName.name}</p>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="ensPrefix"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  {hasCurrentEns ? "Update ENS Name" : "Choose Your ENS Name"}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="flex items-center rounded-md border border-input bg-background">
                      <div className="flex items-center pl-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        type="text"
                        placeholder="your-name"
                        {...field}
                        className="border-0 pl-2 pr-32 focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0"
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase();
                          field.onChange(value);
                          // Reset availability status immediately when typing
                          if (value !== debouncedPrefix) {
                            setAvailabilityStatus(null);
                          }
                        }}
                      />
                      <div className="absolute right-3 flex items-center">
                        <span className="text-muted-foreground mr-2">
                          {sarafuENSSuffix}
                        </span>
                        {/* Availability Status */}
                        {watchedPrefix && watchedPrefix.length >= 3 && (
                          <div className="ml-2">
                            {availabilityStatus === "checking" ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : availabilityStatus === "available" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : availabilityStatus === "taken" ? (
                              <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-red-600" />
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </FormControl>

                <div className="space-y-2">
                  <FormDescription className="text-sm">
                    {hasCurrentEns
                      ? "Enter a new prefix to update your ENS name."
                      : "Choose a unique prefix for your ENS name. This will be your identity on the network."}
                  </FormDescription>

                  {/* Availability feedback */}
                  {watchedPrefix &&
                    watchedPrefix.length >= 3 &&
                    availabilityStatus && (
                      <div
                        className={cn(
                          "text-sm font-medium",
                          availabilityStatus === "available" &&
                            "text-green-600",
                          availabilityStatus === "taken" && "text-red-600"
                        )}
                      >
                        {availabilityStatus === "available" &&
                          "✓ This name is available!"}
                        {availabilityStatus === "taken" &&
                          "✗ This name is already taken"}
                      </div>
                    )}

                  {/* Preview */}
                  {watchedPrefix && (
                    <div className="text-sm text-muted-foreground">
                      Preview:{" "}
                      <span className="font-mono">
                        {watchedPrefix}
                        {sarafuENSSuffix}
                      </span>
                    </div>
                  )}
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={
              upsert.isPending ||
              !isFormValid ||
              availabilityStatus !== "available"
            }
            className="w-full"
            size="lg"
          >
            {upsert.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                {hasCurrentEns ? "Update ENS Name" : "Register ENS Name"}
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
