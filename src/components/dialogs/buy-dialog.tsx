"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, Loader2, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getAddress } from "viem";
import { useAccount } from "wagmi";
import { z } from "zod";

import { PhoneField } from "~/components/forms/fields/phone-field";
import { ResponsiveModal } from "~/components/responsive-modal";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { trpc } from "~/lib/trpc";
import {
  formatPhoneInternational,
  isPhoneNumber,
} from "~/utils/phone-number";

type Asset = "USDT" | "USDC" | "cUSD";
type Step = "phone" | "amount" | "confirm" | "success";

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .refine((v) => isPhoneNumber(v, "KE"), "Enter a valid Kenyan phone number"),
});

const amountSchema = z.object({
  asset: z.enum(["USDT", "USDC", "cUSD"]),
  amount: z.coerce
    .number()
    .min(20, "Minimum is 20 KES")
    .max(250_000, "Maximum is 250,000 KES"),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type AmountForm = z.infer<typeof amountSchema>;

const phoneStorageKey = (address: `0x${string}`) =>
  `onramp:phone:${getAddress(address)}`;

interface BuyDialogProps {
  button: React.ReactNode;
}

export function BuyDialog({ button }: BuyDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      button={button}
      title="Buy stablecoin"
      description="Convert KES via M-PESA"
    >
      <BuyFlow onClose={() => setOpen(false)} key={open ? "open" : "closed"} />
    </ResponsiveModal>
  );
}

function BuyFlow({ onClose }: { onClose: () => void }) {
  const account = useAccount();
  const address = account.address;

  const initialPhone = useMemo(() => {
    if (typeof window === "undefined" || !address) return "";
    return window.localStorage.getItem(phoneStorageKey(address)) ?? "";
  }, [address]);

  const [step, setStep] = useState<Step>(initialPhone ? "amount" : "phone");
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [asset, setAsset] = useState<Asset>("USDT");
  const [amount, setAmount] = useState<number>(0);
  const [transactionCode, setTransactionCode] = useState<string | null>(null);

  const ratesQuery = trpc.onramp.getRates.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const triggerMutation = trpc.onramp.trigger.useMutation();

  if (!address) {
    return <p className="p-4 text-sm">Connect a wallet to continue.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {step === "phone" && (
        <PhoneStep
          defaultValue={phoneNumber}
          onSubmit={(p) => {
            setPhoneNumber(p);
            setStep("amount");
          }}
        />
      )}

      {step === "amount" && (
        <AmountStep
          phoneNumber={phoneNumber}
          rates={ratesQuery.data}
          ratesError={ratesQuery.isError}
          defaultAsset={asset}
          defaultAmount={amount}
          onEditPhone={() => setStep("phone")}
          onSubmit={(values) => {
            setAsset(values.asset);
            setAmount(values.amount);
            setStep("confirm");
          }}
        />
      )}

      {step === "confirm" && (
        <ConfirmStep
          phoneNumber={phoneNumber}
          asset={asset}
          amount={amount}
          rates={ratesQuery.data}
          submitting={triggerMutation.isPending}
          onEditPhone={() => setStep("phone")}
          onBack={() => setStep("amount")}
          onSubmit={async () => {
            try {
              const result = await triggerMutation.mutateAsync({
                phoneNumber,
                asset,
                amount,
              });
              window.localStorage.setItem(
                phoneStorageKey(address),
                phoneNumber
              );
              setTransactionCode(result?.transactionCode ?? null);
              setStep("success");
            } catch (err: unknown) {
              const code = (err as { data?: { code?: string } })?.data?.code;
              const message =
                err instanceof Error ? err.message : "Unexpected error";
              if (code === "NOT_FOUND") {
                toast.error("Wallet not linked — please re-enter your phone.");
                window.localStorage.removeItem(phoneStorageKey(address));
                setStep("phone");
              } else if (code === "BAD_REQUEST") {
                toast.error(message);
              } else {
                toast.error("On-ramp service unavailable, please try again.");
              }
            }
          }}
        />
      )}

      {step === "success" && (
        <SuccessStep transactionCode={transactionCode} onDone={onClose} />
      )}
    </div>
  );
}

function PhoneRow({
  phoneNumber,
  onEdit,
}: {
  phoneNumber: string;
  onEdit: () => void;
}) {
  const formatted = phoneNumber
    ? formatPhoneInternational(phoneNumber, "KE")
    : "";
  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">M-PESA phone</span>
        <span className="text-sm font-medium">{formatted || "—"}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="h-8 gap-1"
      >
        <Pencil className="size-3.5" /> Edit
      </Button>
    </div>
  );
}

function PhoneStep({
  defaultValue,
  onSubmit,
}: {
  defaultValue: string;
  onSubmit: (phone: string) => void;
}) {
  const form = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: defaultValue },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values.phoneNumber))}
        className="flex flex-col gap-4"
      >
        <PhoneField
          form={form}
          name="phoneNumber"
          label="M-PESA phone number"
          placeholder="712 345 678"
          lockCountry="KE"
        />
        <Button type="submit">Continue</Button>
      </form>
    </Form>
  );
}

function AmountStep({
  phoneNumber,
  rates,
  ratesError,
  defaultAsset,
  defaultAmount,
  onEditPhone,
  onSubmit,
}: {
  phoneNumber: string;
  rates: { buy: number; sell: number } | undefined;
  ratesError: boolean;
  defaultAsset: Asset;
  defaultAmount: number;
  onEditPhone: () => void;
  onSubmit: (values: { asset: Asset; amount: number }) => void;
}) {
  const form = useForm<AmountForm>({
    resolver: zodResolver(amountSchema),
    defaultValues: { asset: defaultAsset, amount: defaultAmount || undefined },
    mode: "onChange",
  });

  const watchedAmount = form.watch("amount");
  const watchedAsset = form.watch("asset");

  const preview = useMemo(() => {
    if (ratesError) return "Rate unavailable";
    if (!rates || !watchedAmount) return null;
    const value = Number(watchedAmount) / rates.buy;
    if (!Number.isFinite(value) || value <= 0) return null;
    return `≈ ${value.toFixed(2)} ${watchedAsset}`;
  }, [rates, ratesError, watchedAmount, watchedAsset]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit({ asset: values.asset, amount: Number(values.amount) })
        )}
        className="flex flex-col gap-4"
      >
        <PhoneRow phoneNumber={phoneNumber} onEdit={onEditPhone} />
        <FormField
          control={form.control}
          name="asset"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receive</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="cUSD">cUSD</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pay (KES)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={20}
                  max={250_000}
                  placeholder="500"
                  {...field}
                />
              </FormControl>
              {preview ? (
                <p className="text-sm text-muted-foreground">{preview}</p>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Review</Button>
      </form>
    </Form>
  );
}

function ConfirmStep({
  phoneNumber,
  asset,
  amount,
  rates,
  submitting,
  onEditPhone,
  onBack,
  onSubmit,
}: {
  phoneNumber: string;
  asset: Asset;
  amount: number;
  rates: { buy: number; sell: number } | undefined;
  submitting: boolean;
  onEditPhone: () => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const estimated =
    rates && amount ? (amount / rates.buy).toFixed(2) : null;

  return (
    <div className="flex flex-col gap-4">
      <PhoneRow phoneNumber={phoneNumber} onEdit={onEditPhone} />
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Pay</dt>
        <dd>{amount.toLocaleString()} KES</dd>
        <dt className="text-muted-foreground">Receive</dt>
        <dd>{estimated ? `≈ ${estimated} ${asset}` : asset}</dd>
      </dl>
      <p className="text-xs text-muted-foreground">
        You&apos;ll receive an M-PESA STK push prompt on your phone to
        authorize payment. Final amount may vary slightly with the live rate.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={submitting}
        >
          <ChevronLeft className="size-4 mr-1" /> Back
        </Button>
        <Button onClick={onSubmit} disabled={submitting} className="flex-1">
          {submitting ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" /> Submitting…
            </>
          ) : (
            "Confirm and pay"
          )}
        </Button>
      </div>
    </div>
  );
}

function SuccessStep({
  transactionCode,
  onDone,
}: {
  transactionCode: string | null;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 items-center text-center py-2">
      <CheckCircle2 className="size-12 text-green-600" />
      <div className="space-y-1">
        <p className="font-medium">Check your phone</p>
        <p className="text-sm text-muted-foreground">
          Enter your M-PESA PIN on the prompt to complete the on-ramp. Your
          stablecoin will appear in your wallet shortly after.
        </p>
        {transactionCode ? (
          <p className="text-xs text-muted-foreground pt-2">
            Reference: <span className="font-mono">{transactionCode}</span>
          </p>
        ) : null}
      </div>
      <Button onClick={onDone} className="w-full">
        Done
      </Button>
    </div>
  );
}
