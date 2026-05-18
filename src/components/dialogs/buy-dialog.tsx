"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Copy,
  ExternalLink,
  History,
  LifeBuoy,
  Loader2,
  Pencil,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { erc20Abi, formatUnits, isAddress, parseEventLogs } from "viem";
import { useAccount, useReadContract, useTransactionReceipt } from "wagmi";
import { z } from "zod";

import { PhoneField } from "~/components/forms/fields/phone-field";
import { ResponsiveModal } from "~/components/responsive-modal";
import { useAuth } from "~/hooks/use-auth";
import { Badge } from "~/components/ui/badge";
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
  CUSD_TOKEN_ADDRESS,
  USDC_TOKEN_ADDRESS,
  USDT_TOKEN_ADDRESS,
} from "~/lib/contacts";
import { VoucherSelectField } from "~/components/voucher/voucher-select-field";
import { type PretiumTransaction } from "~/lib/sarafu/pretium";
import { trpc } from "~/lib/trpc";
import { celoscanUrl } from "~/utils/celo";
import {
  formatPhoneInternational,
  isPhoneNumber,
} from "~/utils/phone-number";

type Asset = "USDT" | "USDC" | "cUSD";
type Step = "phone" | "amount" | "confirm" | "success" | "history";

// Pretium Africa support channel (Telegram) — used for per-transaction support
// from the history view.
const PRETIUM_SUPPORT_URL = "https://t.me/+-8nyVGLheGhkZjA0";

const ONRAMP_ASSETS: {
  address: `0x${string}`;
  name: string;
  symbol: Asset;
}[] = [
  { symbol: "USDT", address: USDT_TOKEN_ADDRESS, name: "Tether USD" },
  { symbol: "USDC", address: USDC_TOKEN_ADDRESS, name: "USD Coin" },
  { symbol: "cUSD", address: CUSD_TOKEN_ADDRESS, name: "Celo Dollar" },
];

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
    .min(100, "Minimum is 100 KES")
    .max(250_000, "Maximum is 250,000 KES"),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type AmountForm = z.infer<typeof amountSchema>;

interface BuyDialogProps {
  button?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called when the user wants to change their verified phone — typically closes
   * this dialog and re-opens VerifyPhoneDialog. */
  onReverify?: () => void;
}

export function BuyDialog({
  button,
  open: controlledOpen,
  onOpenChange,
  onReverify,
}: BuyDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  };
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      button={button}
      title={isHistoryView ? "Purchase history" : "Buy stablecoin"}
      description={
        isHistoryView
          ? "Track your M-PESA stablecoin conversions"
          : "KES → stablecoin via M-PESA"
      }
    >
      <BuyFlow
        onClose={() => setOpen(false)}
        onReverify={onReverify}
        onHistoryViewChange={setIsHistoryView}
        key={open ? "open" : "closed"}
      />
    </ResponsiveModal>
  );
}

function BuyFlow({
  onClose,
  onReverify,
  onHistoryViewChange,
}: {
  onClose: () => void;
  onReverify?: () => void;
  onHistoryViewChange?: (isHistory: boolean) => void;
}) {
  const account = useAccount();
  const address = account.address;
  const auth = useAuth();

  // The verified phone is authoritative; users can only onramp to it.
  const verifiedPhone = auth?.user?.phone_verified_at
    ? auth.user.phone_number ?? ""
    : "";

  const [step, setStep] = useState<Step>(verifiedPhone ? "amount" : "phone");
  const [previousStep, setPreviousStep] = useState<Step>(
    verifiedPhone ? "amount" : "phone"
  );
  const [phoneNumber, setPhoneNumber] = useState(verifiedPhone);
  const [asset, setAsset] = useState<Asset>("USDT");
  const [amount, setAmount] = useState<number>(0);
  const [transactionCode, setTransactionCode] = useState<string | null>(null);

  const ratesQuery = trpc.onramp.getRates.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const transactionsQuery = trpc.onramp.transactions.useQuery(undefined, {
    enabled: !!address,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const all = [...(data.onramps ?? []), ...(data.offramps ?? [])];
      return all.some(isPendingTx) ? 5000 : false;
    },
    refetchOnWindowFocus: false,
  });

  const triggerMutation = trpc.onramp.trigger.useMutation();

  useEffect(() => {
    onHistoryViewChange?.(step === "history");
    return () => onHistoryViewChange?.(false);
  }, [step, onHistoryViewChange]);

  const openHistory = () => {
    setPreviousStep(step);
    setStep("history");
  };

  if (!address) {
    return <p className="p-4 text-sm">Connect a wallet to continue.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {step !== "history" && (
        <DialogToolbar
          onOpenHistory={openHistory}
          pendingCount={countPending(transactionsQuery.data)}
        />
      )}

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
          onEditPhone={
            verifiedPhone && onReverify
              ? onReverify
              : () => setStep("phone")
          }
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
          onEditPhone={
            verifiedPhone && onReverify
              ? onReverify
              : () => setStep("phone")
          }
          onBack={() => setStep("amount")}
          onSubmit={async () => {
            try {
              const result = await triggerMutation.mutateAsync({
                phoneNumber,
                asset,
                amount,
              });
              setTransactionCode(result?.transactionCode ?? null);
              setStep("success");
              // Kick a refetch so the just-submitted tx appears in the success
              // step status panel as soon as upstream records it.
              void transactionsQuery.refetch();
            } catch (err: unknown) {
              const code = (err as { data?: { code?: string } })?.data?.code;
              const message =
                err instanceof Error ? err.message : "Unexpected error";
              if (code === "NOT_FOUND") {
                toast.error("Wallet not linked — please re-verify your phone.");
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
        <SuccessStep
          transactionCode={transactionCode}
          transaction={findTransaction(
            transactionsQuery.data,
            transactionCode
          )}
          onViewHistory={openHistory}
          onDone={onClose}
        />
      )}

      {step === "history" && (
        <HistoryStep
          data={transactionsQuery.data}
          isLoading={transactionsQuery.isLoading}
          isFetching={transactionsQuery.isFetching}
          isError={transactionsQuery.isError}
          onRetry={() => transactionsQuery.refetch()}
          onBack={() => setStep(previousStep)}
        />
      )}
    </div>
  );
}

function DialogToolbar({
  onOpenHistory,
  pendingCount,
}: {
  onOpenHistory: () => void;
  pendingCount: number;
}) {
  return (
    <div className="flex justify-end">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onOpenHistory}
        className="h-8 gap-1.5"
      >
        <History className="size-4" />
        History
        {pendingCount > 0 ? (
          <Badge variant="warning" className="ml-1 h-5 px-1.5">
            {pendingCount}
          </Badge>
        ) : null}
      </Button>
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
        <VoucherSelectField
          form={form}
          name="asset"
          label="Receive"
          placeholder="Select a stablecoin"
          items={ONRAMP_ASSETS}
          getFormValue={(item) => item.symbol}
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
                  min={100}
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
  transaction,
  onViewHistory,
  onDone,
}: {
  transactionCode: string | null;
  transaction: PretiumTransaction | undefined;
  onViewHistory: () => void;
  onDone: () => void;
}) {
  const settled = transaction ? isSettledTx(transaction) : false;
  const failed = transaction ? isFailedTx(transaction) : false;

  return (
    <div className="flex flex-col gap-4 items-center text-center py-2">
      {failed ? (
        <AlertCircle className="size-12 text-destructive" />
      ) : settled ? (
        <CheckCircle2 className="size-12 text-green-600" />
      ) : (
        <div className="relative flex size-16 items-center justify-center">
          <Loader2
            className="absolute inset-0 size-16 animate-spin text-primary/40"
            strokeWidth={1.5}
            aria-hidden
          />
          <Clock className="size-7 text-primary" />
        </div>
      )}
      <div className="space-y-1">
        <p className="font-medium">
          {failed
            ? "Payment failed"
            : settled
              ? "Payment received"
              : "Check your phone"}
        </p>
        <p className="text-sm text-muted-foreground">
          {failed
            ? "The M-PESA payment did not complete. Please try again."
            : settled
              ? "Your stablecoin should appear in your wallet shortly."
              : "Enter your M-PESA PIN on the prompt to complete the on-ramp. Your stablecoin will appear in your wallet shortly after."}
        </p>
        {transaction ? (
          <div className="pt-2 flex justify-center">
            <StatusBadge tx={transaction} />
          </div>
        ) : null}
        {transactionCode ? (
          <p className="text-xs text-muted-foreground pt-2">
            Reference: <span className="font-mono">{transactionCode}</span>
          </p>
        ) : null}
        {transaction?.TxHash ? (
          <a
            href={celoscanUrl.tx(transaction.TxHash)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline pt-1"
          >
            View on Celoscan <ExternalLink className="size-3" />
          </a>
        ) : null}
      </div>
      <div className="flex w-full gap-2">
        <Button variant="outline" onClick={onViewHistory} className="flex-1">
          <History className="size-4 mr-1" /> History
        </Button>
        <Button onClick={onDone} className="flex-1">
          Done
        </Button>
      </div>
    </div>
  );
}

function HistoryStep({
  data,
  isLoading,
  isFetching,
  isError,
  onRetry,
  onBack,
}: {
  data:
    | {
        onramps: PretiumTransaction[];
        offramps: PretiumTransaction[];
      }
    | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onRetry: () => void;
  onBack: () => void;
}) {
  const items = useMemo(() => {
    if (!data) return [];
    const onramps = (data.onramps ?? []).map((t) => ({
      kind: "onramp" as const,
      tx: t,
    }));
    const offramps = (data.offramps ?? []).map((t) => ({
      kind: "offramp" as const,
      tx: t,
    }));
    return [...onramps, ...offramps].sort(
      (a, b) =>
        new Date(b.tx.CreatedAt).getTime() -
        new Date(a.tx.CreatedAt).getTime()
    );
  }, [data]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 gap-1 -ml-2"
        >
          <ChevronLeft className="size-4" /> Back
        </Button>
        <div className="text-xs text-muted-foreground">
          {isFetching && !isLoading ? "Refreshing…" : null}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : isError ? (
        <div className="flex flex-col gap-3 items-center text-center py-8">
          <AlertCircle className="size-8 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load history.
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col gap-2 items-center text-center py-8">
          <History className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No transactions yet</p>
          <p className="text-xs text-muted-foreground">
            Your buys and sells will appear here.
          </p>
        </div>
      ) : (
        <>
          <SupportNote />
          <div className="max-h-[60vh] overflow-y-auto overscroll-contain rounded-lg border bg-card">
            <ul className="flex flex-col divide-y">
              {items.map(({ kind, tx }) => (
                <TransactionRow key={`${kind}-${tx.ID}`} kind={kind} tx={tx} />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function SupportNote() {
  return (
    <div className="flex items-start gap-2.5 rounded-md bg-muted/40 px-3 py-2">
      <LifeBuoy className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium">Need help?</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Copy the transaction ID and message Pretium Africa support on
          Telegram.
        </p>
      </div>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="h-7 shrink-0 text-xs"
      >
        <a href={PRETIUM_SUPPORT_URL} target="_blank" rel="noreferrer">
          Message support
        </a>
      </Button>
    </div>
  );
}

function TransactionRow({
  kind,
  tx,
}: {
  kind: "onramp" | "offramp";
  tx: PretiumTransaction;
}) {
  const delivered = useOnchainDelivered(tx);
  const isOnramp = kind === "onramp";
  const failed = isFailedTx(tx);
  const pending = isPendingTx(tx);

  const tokenAmount = delivered
    ? `${delivered.amount} ${delivered.symbol}`
    : null;
  const kesAmount = `KES ${formatAmount(tx.AmountKES)}`;
  const hasOnchainRecord = hasTxHash(tx);
  const label = isOnramp ? "Buy via M-PESA" : "Sell via M-PESA";
  const shortId = shortenId(tx.PretiumID);

  // Headline is the side the user *receives*: tokens for buys, KES for sells.
  // The on-chain Transfer is the source of truth for buys — we never substitute
  // KES, since that's what the user *paid*, not what they received.
  const headlineNode = (() => {
    if (failed) {
      return <span className="text-muted-foreground/70">Failed</span>;
    }
    if (isOnramp) {
      if (pending) {
        return (
          <span className="text-muted-foreground">Awaiting confirmation</span>
        );
      }
      if (tokenAmount) {
        return (
          <span className="text-success">
            +{delivered?.amount} {delivered?.symbol}
          </span>
        );
      }
      if (hasOnchainRecord) {
        return (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        );
      }
      return (
        <span className="text-muted-foreground/70">Amount unavailable</span>
      );
    }
    return <span className="text-success">+{kesAmount}</span>;
  })();

  const secondaryAmount = isOnramp ? kesAmount : tokenAmount;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(tx.PretiumID);
      toast.success("Transaction ID copied");
    } catch {
      toast.error("Couldn't copy. Try selecting the ID manually.");
    }
  };

  return (
    <li className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors">
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full mt-0.5 ${
          isOnramp
            ? "bg-success/10 text-success"
            : "bg-muted text-muted-foreground"
        }`}
        aria-hidden
      >
        {isOnramp ? (
          <ArrowDownLeft className="size-4" />
        ) : (
          <ArrowUpRight className="size-4" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Row 1: label + headline amount */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium truncate">{label}</span>
          <span
            className={`text-sm font-semibold tabular-nums whitespace-nowrap ${
              failed ? "opacity-60" : ""
            }`}
          >
            {headlineNode}
          </span>
        </div>

        {/* Row 2: status badge + secondary metric + time */}
        <div className="flex items-center gap-x-1.5 text-xs text-muted-foreground">
          <StatusBadge tx={tx} />
          {secondaryAmount ? (
            <>
              <span aria-hidden>·</span>
              <span className="tabular-nums">{secondaryAmount}</span>
            </>
          ) : null}
          <span aria-hidden>·</span>
          <span>{formatRelativeTime(tx.CreatedAt)}</span>
        </div>

        {/* Row 3: shortened ID + actions */}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="font-mono">ID: {shortId}</span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleCopyId}
              aria-label="Copy transaction ID"
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Copy className="size-3.5" />
            </button>
            {hasTxHash(tx) ? (
              <a
                href={celoscanUrl.tx(tx.TxHash)}
                target="_blank"
                rel="noreferrer"
                aria-label="View transaction on Celoscan"
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ExternalLink className="size-3.5" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

function shortenId(id: string): string {
  if (id.length <= 14) return id;
  return `${id.slice(0, 8)}…${id.slice(-5)}`;
}

function StatusBadge({ tx }: { tx: PretiumTransaction }) {
  const variant = txVariant(tx);
  const label = txLabel(tx);
  return (
    <Badge variant={variant} className="gap-1">
      {variant === "warning" ? (
        <Loader2 className="size-3 animate-spin" />
      ) : null}
      {label}
    </Badge>
  );
}

// --- helpers -----------------------------------------------------------

function normalizeStatus(status: string): string {
  return status.trim().toUpperCase();
}

const PENDING_STATUSES = new Set([
  "PENDING",
  "PROCESSING",
  "IN_PROGRESS",
  "INITIATED",
  "SUBMITTED",
]);
const SETTLED_STATUSES = new Set([
  "COMPLETE",
  "COMPLETED",
  "SUCCESS",
  "SUCCESSFUL",
  "SETTLED",
]);
const FAILED_STATUSES = new Set([
  "FAILED",
  "FAILURE",
  "ERROR",
  "CANCELLED",
  "CANCELED",
  "REVERSED",
  "TIMEOUT",
  "EXPIRED",
]);

const ZERO_TX_HASH = `0x${"0".repeat(64)}`;

function hasTxHash(tx: PretiumTransaction): boolean {
  const hash = tx.TxHash?.trim() ?? "";
  return hash.length > 0 && hash.toLowerCase() !== ZERO_TX_HASH;
}

function isSettledTx(tx: PretiumTransaction): boolean {
  if (hasTxHash(tx)) return true;
  return SETTLED_STATUSES.has(normalizeStatus(tx.PretiumStatus));
}

function isFailedTx(tx: PretiumTransaction): boolean {
  if (hasTxHash(tx)) return false;
  return FAILED_STATUSES.has(normalizeStatus(tx.PretiumStatus));
}

function isPendingTx(tx: PretiumTransaction): boolean {
  if (isSettledTx(tx) || isFailedTx(tx)) return false;
  // Upstream returns an empty PretiumStatus while M-PESA payment has been
  // confirmed but the on-chain mint hasn't happened yet — treat as pending.
  const s = normalizeStatus(tx.PretiumStatus);
  if (!s) return true;
  return PENDING_STATUSES.has(s);
}

function txVariant(
  tx: PretiumTransaction
): "warning" | "success" | "destructive" | "secondary" {
  if (isSettledTx(tx)) return "success";
  if (isFailedTx(tx)) return "destructive";
  if (isPendingTx(tx)) return "warning";
  return "secondary";
}

function txLabel(tx: PretiumTransaction): string {
  if (isSettledTx(tx)) return "Completed";
  if (isFailedTx(tx)) return "Failed";
  if (isPendingTx(tx)) {
    const s = normalizeStatus(tx.PretiumStatus);
    return s ? humanizeStatus(s) : "Processing";
  }
  return humanizeStatus(tx.PretiumStatus);
}

function humanizeStatus(status: string): string {
  const s = normalizeStatus(status);
  if (!s) return "Processing";
  return s
    .split(/[_\s]+/)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function countPending(
  data:
    | { onramps: PretiumTransaction[]; offramps: PretiumTransaction[] }
    | undefined
): number {
  if (!data) return 0;
  const onramps = data.onramps ?? [];
  const offramps = data.offramps ?? [];
  return [...onramps, ...offramps].filter(isPendingTx).length;
}

function findTransaction(
  data:
    | { onramps: PretiumTransaction[]; offramps: PretiumTransaction[] }
    | undefined,
  pretiumId: string | null
): PretiumTransaction | undefined {
  if (!data || !pretiumId) return undefined;
  const onramps = data.onramps ?? [];
  const offramps = data.offramps ?? [];
  return (
    onramps.find((t) => t.PretiumID === pretiumId) ??
    offramps.find((t) => t.PretiumID === pretiumId)
  );
}

// Upstream populates AmountUSD with the trigger-time `amount` until the
// conversion is computed, so it often mirrors AmountKES verbatim, and the
// `TokenAddress` field is often empty. The on-chain Transfer event is the
// source of truth for what was actually delivered — fetch the receipt and
// discover the token contract from the matching Transfer log.
function useOnchainDelivered(tx: PretiumTransaction): {
  amount: string;
  symbol: string;
} | null {
  const hash = tx.TxHash?.trim() ?? "";
  const recipient = tx.WalletAddress?.trim() ?? "";
  const hashValid =
    hash.startsWith("0x") &&
    hash.length === 66 &&
    hash.toLowerCase() !== ZERO_TX_HASH;

  const receiptQuery = useTransactionReceipt({
    hash: hashValid ? (hash as `0x${string}`) : undefined,
    query: { enabled: hashValid, staleTime: Infinity, gcTime: Infinity },
  });

  const matchedTransfer = useMemo(() => {
    if (!receiptQuery.data) return null;
    const transfers = parseEventLogs({
      abi: erc20Abi,
      eventName: "Transfer",
      logs: receiptQuery.data.logs,
    });
    const recipientLower = recipient.toLowerCase();
    const toRecipient = recipientLower
      ? transfers.find((log) => log.args.to.toLowerCase() === recipientLower)
      : undefined;
    return toRecipient ?? transfers[0] ?? null;
  }, [receiptQuery.data, recipient]);

  const tokenForRead: `0x${string}` | undefined = matchedTransfer
    ? matchedTransfer.address
    : undefined;
  const tokenValid = tokenForRead !== undefined && isAddress(tokenForRead);

  const symbolQuery = useReadContract({
    address: tokenForRead,
    abi: erc20Abi,
    functionName: "symbol",
    query: { enabled: tokenValid, staleTime: Infinity, gcTime: Infinity },
  });
  const decimalsQuery = useReadContract({
    address: tokenForRead,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: tokenValid, staleTime: Infinity, gcTime: Infinity },
  });

  return useMemo(() => {
    if (
      !matchedTransfer ||
      !symbolQuery.data ||
      decimalsQuery.data === undefined
    ) {
      return null;
    }
    const value = matchedTransfer.args.value;
    const formatted = Number(formatUnits(value, decimalsQuery.data));
    if (!Number.isFinite(formatted)) return null;
    return {
      amount: formatted.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
      symbol: symbolQuery.data,
    };
  }, [matchedTransfer, symbolQuery.data, decimalsQuery.data]);
}

function formatAmount(raw: string): string {
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diff = Date.now() - then;
  const s = Math.round(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
