import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExternalLinkIcon,
  Share1Icon,
} from "@radix-ui/react-icons";
import { waitForTransactionReceipt } from "@wagmi/core";
import { RefreshCcw, Send } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { erc20Abi, isAddress, parseUnits } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { z } from "zod";
import { SendForm } from "~/components/dialogs/send-dialog";
import { Loading } from "~/components/loading";
import { ResponsiveModal } from "~/components/responsive-modal";
import Hash from "~/components/transactions/hash";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { VoucherChip } from "~/components/voucher/voucher-chip";
import { defaultReceiptOptions } from "~/config/viem.config.server";
import { swapPoolAbi } from "~/contracts/swap-pool/contract";
import { useDivviReferral } from "~/hooks/useDivviReferral";
import useWebShare from "~/hooks/useWebShare";
import { trpc } from "~/lib/trpc";
import { celoscanUrl } from "~/utils/celo";
import { SwapField } from "../swap-field";
import { type SwapPool, type SwapPoolVoucher } from "../types";
import {
  MIN_SWAP_AMOUNT,
  convert,
  findBestFromToken,
  getMaxSwappable,
  getSwapErrorMessage,
  getVoucherAddressKey,
} from "../utils";

// Schema definitions
const zodBalance = z.object({
  value: z.bigint(),
  formatted: z.string(),
  formattedNumber: z.number(),
});

export const zodPoolVoucher = z.object({
  address: z.custom<`0x${string}`>(isAddress, "Invalid address"),
  priceIndex: z.bigint(),
  poolBalance: zodBalance,
  userBalance: zodBalance,
  swapLimit: zodBalance,
  limitOf: zodBalance,
  symbol: z.string(),
  decimals: z.number(),
  allowance: zodBalance.optional(),
  name: z.string().optional(),
});

const swapFormSchema = z
  .object({
    fromToken: zodPoolVoucher.optional(),
    toToken: zodPoolVoucher.optional(),
    amount: z.string(),
    toAmount: z.string(),
  })
  .superRefine((data, ctx) => {
    const { fromToken, toToken, amount, toAmount } = data;
    if (!fromToken || !toToken) return;

    const amountNum = Number(amount);
    const toAmountNum = Number(toAmount);

    // Validate amounts are greater than 0 (skip empty strings to avoid errors on mount)
    if (amount !== "" && amountNum <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount must be greater than 0",
        path: ["amount"],
      });
    }
    if (toAmount !== "" && toAmountNum <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount must be greater than 0",
        path: ["toAmount"],
      });
    }

    // Validate limits
    const priceRatio =
      Number(fromToken.priceIndex) / Number(toToken.priceIndex);
    const exceedsPoolBalance =
      amountNum * priceRatio > toToken.poolBalance.formattedNumber;
    const exceedsSwapLimit = amountNum > Number(fromToken.swapLimit?.formatted);
    const exceedsUserBalance =
      amountNum > Number(fromToken.userBalance?.formatted);

    if (exceedsPoolBalance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The pool does not have enough ${toToken.symbol} to swap`,
        path: ["amount"],
      });
    }
    if (exceedsSwapLimit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The pool has a limit of ${fromToken.limitOf.formatted} ${fromToken.symbol} and a balance of ${fromToken.poolBalance.formatted} ${fromToken.symbol} so the maximum you can swap is ${fromToken.swapLimit?.formatted} ${fromToken.symbol}`,
        path: ["amount"],
      });
    }
    if (exceedsUserBalance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You are trying to swap more than you have",
        path: ["amount"],
      });
    }
  });

const DEMURRAGE_BUFFER = 1005n / 1000n; // 0.5% buffer for demurrage

interface SwapResult {
  fromAmount: string;
  fromSymbol: string;
  toAmount: string;
  toSymbol: string;
  toAddress: `0x${string}`;
  txHash: `0x${string}`;
}

type SwapState =
  | { status: "form" }
  | { status: "progress"; progress: { step: string; hash?: `0x${string}` } }
  | { status: "error"; error: string }
  | { status: "success"; result: SwapResult }
  | { status: "send"; result: SwapResult };

type SwapAction =
  | { type: "SET_PROGRESS"; step: string; hash?: `0x${string}` }
  | { type: "SET_ERROR"; error: string }
  | { type: "SET_SUCCESS"; result: SwapResult }
  | { type: "GO_SEND" }
  | { type: "GO_BACK" }
  | { type: "RESET" };

function swapReducer(state: SwapState, action: SwapAction): SwapState {
  switch (action.type) {
    case "SET_PROGRESS":
      return {
        status: "progress",
        progress: { step: action.step, hash: action.hash },
      };
    case "SET_ERROR":
      return { status: "error", error: action.error };
    case "SET_SUCCESS":
      return { status: "success", result: action.result };
    case "GO_SEND":
      return state.status === "success"
        ? { status: "send", result: state.result }
        : state;
    case "GO_BACK":
      return state.status === "send"
        ? { status: "success", result: state.result }
        : state;
    case "RESET":
      return { status: "form" };
    default:
      return state;
  }
}

interface SwapFormProps {
  pool: SwapPool | undefined;
  onSuccess?: () => void;
  initial?: {
    toAddress?: `0x${string}`;
    fromAddress?: `0x${string}`;
    toAmount?: string;
  };
}

function SwapSuccessScreen({
  result,
  onDone,
  onSend,
}: {
  result: SwapResult;
  onDone: () => void;
  onSend: () => void;
}) {
  const share = useWebShare();

  return (
    <div className="space-y-6 p-6 text-center">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircledIcon className="w-12 h-12 text-green-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-green-700">Swap Successful!</h2>
        <p className="text-gray-600">
          You swapped{" "}
          <span className="font-semibold">
            {result.fromAmount} {result.fromSymbol}
          </span>{" "}
          for{" "}
          <span className="font-semibold">
            {result.toAmount} {result.toSymbol}
          </span>
        </p>
      </div>

      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <Hash hash={result.txHash} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => window.open(celoscanUrl.tx(result.txHash), "_blank")}
          className="flex items-center gap-2"
        >
          <ExternalLinkIcon className="w-4 h-4" />
          View on Celo Explorer
        </Button>

        {share.isSupported && (
          <Button
            variant="outline"
            onClick={() =>
              share.share({
                title: "Swap Successful",
                text: `Swapped ${result.fromAmount} ${result.fromSymbol} for ${result.toAmount} ${result.toSymbol}`,
                url: celoscanUrl.tx(result.txHash),
              })
            }
            className="flex items-center gap-2"
          >
            <Share1Icon className="w-4 h-4" />
            Share
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={onSend}
          className="w-full flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send {result.toSymbol}
        </Button>
        <Button variant="outline" onClick={onDone} className="w-full">
          Done
        </Button>
      </div>
    </div>
  );
}

function SwapProgressScreen({
  progress,
}: {
  progress: { step: string; hash?: `0x${string}` };
}) {
  if (!progress.hash) {
    return (
      <div className="space-y-6 p-6 text-center">
        <div className="mx-auto w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center">
          <Loading />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            {progress.step}
          </h2>
          <p className="text-sm text-gray-600">
            Please confirm the transaction in your wallet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 text-center">
      <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
        <Loading />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">{progress.step}</h2>
        <p className="text-sm text-gray-600">
          Waiting for blockchain confirmation
        </p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <Hash hash={progress.hash} />
      </div>
    </div>
  );
}

function SwapErrorScreen({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="space-y-6 p-6 text-center">
      <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
        <CrossCircledIcon className="w-12 h-12 text-red-600" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-red-900">Swap Failed</h2>
        <p className="text-sm text-red-600 max-w-sm mx-auto leading-relaxed">
          {error}
        </p>
      </div>
      <Button onClick={onRetry} className="w-full">
        Try Again
      </Button>
    </div>
  );
}

export function SwapForm({ pool, onSuccess, initial }: SwapFormProps) {
  const config = useConfig();
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();
  const write = useWriteContract({ config });
  const { submitReferral, getReferralTag } = useDivviReferral();

  const form = useForm<z.infer<typeof swapFormSchema>>({
    resolver: zodResolver(swapFormSchema),
    mode: "all",
    defaultValues: {
      amount: "",
      toAmount: "",
      toToken: undefined,
      fromToken: undefined,
    },
  });

  const { watch, handleSubmit, setValue, formState } = form;
  const { isSubmitting, isValid } = formState;

  const fromToken = watch("fromToken");
  const toToken = watch("toToken");
  const amount = watch("amount");
  const toAmount = watch("toAmount");

  const [lastEditedField, setLastEditedField] = useState<"amount" | "toAmount">(
    "amount",
  );
  const lastInitialToAddressRef = useRef<`0x${string}` | undefined>(undefined);
  const lastInitialFromAddressRef = useRef<`0x${string}` | undefined>(
    undefined,
  );
  const lastInitialToAmountRef = useRef<string | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(false);
  const [swapState, dispatch] = useReducer(swapReducer, { status: "form" });
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const safeDispatch = useCallback((action: SwapAction) => {
    if (mountedRef.current) dispatch(action);
  }, []);

  // Initialize tokens from initial addresses
  useEffect(() => {
    const toAddress = initial?.toAddress;
    if (!pool?.voucherDetails || !toAddress) {
      lastInitialToAddressRef.current = undefined;
      return;
    }
    if (lastInitialToAddressRef.current === toAddress) return;

    const voucher = pool.voucherDetails.find(
      (x) => x.address.toLowerCase() === toAddress.toLowerCase(),
    );
    if (voucher) {
      lastInitialToAddressRef.current = toAddress;
      setValue("toToken", voucher as z.infer<typeof zodPoolVoucher>);
    }
  }, [initial?.toAddress, pool?.voucherDetails, setValue]);

  useEffect(() => {
    if (!pool?.voucherDetails || !initial?.fromAddress) {
      lastInitialFromAddressRef.current = undefined;
      return;
    }
    if (lastInitialFromAddressRef.current === initial.fromAddress) return;

    const voucher = pool.voucherDetails.find(
      (x) => x.address === initial.fromAddress,
    );
    if (voucher) {
      lastInitialFromAddressRef.current = initial.fromAddress;
      setValue("fromToken", voucher as z.infer<typeof zodPoolVoucher>);
    }
  }, [initial?.fromAddress, pool?.voucherDetails, setValue]);

  // Auto-select the from token that yields the most of the to token.
  // Re-runs when toToken or voucher balances change (e.g., after wallet connects).
  const optimizedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!pool?.voucherDetails || !toToken || !initial?.toAddress) return;

    // Build a stable key from meaningful inputs so optimization re-runs when data changes
    const optimizationKey = `${toToken.address}-${pool.voucherDetails.map((v) => `${v.address}:${v.userBalance?.formatted}`).join(",")}`;
    if (optimizedForRef.current === optimizationKey) return;
    optimizedForRef.current = optimizationKey;

    const bestVoucher = findBestFromToken(pool.voucherDetails, toToken as SwapPoolVoucher);

    if (bestVoucher && bestVoucher.address !== fromToken?.address) {
      setValue("fromToken", bestVoucher as z.infer<typeof zodPoolVoucher>);
    }
  }, [pool?.voucherDetails, toToken, fromToken, initial?.toAddress, setValue]);

  /**
   * Bidirectional conversion between amounts
   *
   * This effect handles the automatic conversion between the "from amount" and "to amount"
   * fields based on which field was last edited by the user. It uses the token price indices
   * from the pool to calculate the conversion rate.
   *
   * The conversion is skipped during initialization to prevent race conditions with
   * the initial amount setting effect below.
   */
  useEffect(() => {
    if (!fromToken || !toToken) {
      setValue(lastEditedField === "amount" ? "toAmount" : "amount", "", {
        shouldValidate: true,
      });
      return;
    }

    // Skip conversion during initialization to prevent race conditions
    if (isInitializing) {
      return;
    }

    if (lastEditedField === "amount") {
      const converted = amount
        ? (convert(amount, fromToken, toToken)?.formatted ?? "")
        : "";
      setValue("toAmount", converted, { shouldValidate: true });
    } else {
      const converted = toAmount
        ? (convert(toAmount, toToken, fromToken)?.formatted ?? "")
        : "";
      setValue("amount", converted, { shouldValidate: true });
    }
  }, [
    amount,
    toAmount,
    fromToken,
    toToken,
    setValue,
    lastEditedField,
    isInitializing,
  ]);

  /**
   * Initialize toAmount from product price (after tokens are initialized)
   *
   * This effect runs when a product is selected from the pool products list and handles
   * pre-populating the swap form with the product's price as the "to amount".
   *
   * Flow:
   * 1. Wait for both tokens (from/to) to be initialized
   * 2. Set isInitializing flag to prevent bidirectional conversion from interfering
   * 3. Set toAmount to the product price
   * 4. Calculate and set the corresponding "from amount" using pool price indices
   * 5. Use setTimeout to clear initialization flag after state updates settle
   *
   * Why this approach?
   * - Setting isInitializing blocks the conversion effect from running
   * - We set both form values directly with the correct amounts
   * - setTimeout(fn, 0) ensures the flag is cleared AFTER all state updates
   *   and effect re-runs have completed, preventing the conversion effect
   *   from overwriting our initialized values
   * - This is more reliable than useLayoutEffect + queueMicrotask because
   *   it guarantees the conversion effect won't run until the next event loop tick
   */
  useEffect(() => {
    if (!initial?.toAmount || !fromToken || !toToken) {
      lastInitialToAmountRef.current = undefined;
      setIsInitializing(false);
      return;
    }

    // Only initialize once per unique toAmount value
    if (lastInitialToAmountRef.current === initial.toAmount) {
      return;
    }

    lastInitialToAmountRef.current = initial.toAmount;

    // Set initializing flag to prevent conversion effect from running
    setIsInitializing(true);

    // Set the form values
    setLastEditedField("toAmount");
    setValue("toAmount", initial.toAmount, { shouldValidate: false });

    // Calculate the corresponding from amount based on pool price ratio
    const converted =
      convert(initial.toAmount, toToken, fromToken)?.formatted ?? "";
    setValue("amount", converted, { shouldValidate: true });

    // Clear initialization flag after all effects have run
    // setTimeout ensures this happens after React's effect cycle completes
    // This prevents the conversion effect from overwriting our initialized values
    const timeoutId = setTimeout(() => {
      setIsInitializing(false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [initial?.toAmount, fromToken, toToken, setValue]);

  const max = useMemo(
    () => getMaxSwappable(fromToken as SwapPoolVoucher | undefined, toToken as SwapPoolVoucher | undefined),
    [
      fromToken,
      toToken,
      fromToken?.swapLimit?.formattedNumber,
      fromToken?.userBalance?.formattedNumber,
      toToken?.poolBalance?.formattedNumber,
    ],
  );

  // Handle max button click
  const handleSetMax = useCallback(() => {
    if (fromToken?.userBalance && fromToken.decimals) {
      setValue("amount", max.toString(), { shouldValidate: true });
      setLastEditedField("amount");
    }
  }, [fromToken, max, setValue]);
  // Execute swap transaction
  const onSubmit = useCallback(
    async (data: z.infer<typeof swapFormSchema>) => {
      if (!data.fromToken || !data.toToken || !pool) return;
      if (!data.amount || Number(data.amount) <= 0) return;

      try {
        const amountWithBuffer =
          parseUnits(data.amount, data.fromToken.decimals) * DEMURRAGE_BUFFER;

        // Step 1: Reset approval
        safeDispatch({ type: "SET_PROGRESS", step: "Resetting approval..." });
        const resetHash = await write.writeContractAsync({
          address: data.fromToken.address,
          abi: erc20Abi,
          functionName: "approve",
          args: [pool.address, BigInt(0)],
          dataSuffix: getReferralTag(),
        });
        safeDispatch({
          type: "SET_PROGRESS",
          step: "Waiting for reset confirmation...",
          hash: resetHash,
        });
        await waitForTransactionReceipt(config, {
          hash: resetHash,
          ...defaultReceiptOptions,
        });

        // Step 2: Approve amount
        safeDispatch({
          type: "SET_PROGRESS",
          step: "Approving token spend...",
        });
        const approvalHash = await write.writeContractAsync({
          address: data.fromToken.address,
          abi: erc20Abi,
          functionName: "approve",
          args: [pool.address, amountWithBuffer],
          dataSuffix: getReferralTag(),
        });
        safeDispatch({
          type: "SET_PROGRESS",
          step: "Waiting for approval confirmation...",
          hash: approvalHash,
        });
        await waitForTransactionReceipt(config, {
          hash: approvalHash,
          ...defaultReceiptOptions,
        });

        // Step 3: Execute swap
        safeDispatch({ type: "SET_PROGRESS", step: "Executing swap..." });
        const swapHash = await write.writeContractAsync({
          address: pool.address,
          abi: swapPoolAbi,
          functionName: "withdraw",
          args: [
            data.toToken.address,
            data.fromToken.address,
            parseUnits(data.amount, data.fromToken.decimals),
          ],
          dataSuffix: getReferralTag(),
        });

        // Submit Divvi referral for transaction attribution (non-blocking)
        void submitReferral(swapHash);

        safeDispatch({
          type: "SET_PROGRESS",
          step: "Waiting for swap confirmation...",
          hash: swapHash,
        });
        await waitForTransactionReceipt(config, {
          hash: swapHash,
          ...defaultReceiptOptions,
        });

        void utils.me.events.invalidate();
        void utils.me.vouchers.invalidate();
        void queryClient.invalidateQueries({ queryKey: ["readContract"] });
        void queryClient.invalidateQueries({ queryKey: ["readContracts"] });
        void queryClient.invalidateQueries({ queryKey: ["swapPool"] });

        safeDispatch({
          type: "SET_SUCCESS",
          result: {
            fromAmount: data.amount,
            fromSymbol: data.fromToken.symbol,
            toAmount: data.toAmount,
            toSymbol: data.toToken.symbol,
            toAddress: data.toToken.address,
            txHash: swapHash,
          },
        });
      } catch (error) {
        console.error(error);
        safeDispatch({ type: "SET_ERROR", error: getSwapErrorMessage(error) });
      }
    },
    [pool, write, config, utils, queryClient, submitReferral, getReferralTag, safeDispatch],
  );

  // Render voucher chip
  const renderVoucherChip = useCallback(
    (voucher: SwapPoolVoucher) => (
      <VoucherChip voucher_address={voucher.address} />
    ),
    [],
  );

  // Render voucher item with balance
  const renderVoucherItem = useCallback(
    (voucher: SwapPoolVoucher, balanceKey: "userBalance" | "poolBalance") => (
      <div className="flex justify-between w-full flex-wrap items-center">
        <VoucherChip voucher_address={voucher.address} />
        <div className="ml-2 px-2 py-1">
          {voucher[balanceKey]?.formatted}&nbsp;
        </div>
      </div>
    ),
    [],
  );

  const filteredFromTokens = useMemo(
    () =>
      pool?.voucherDetails?.filter(
        (x) =>
          x.address !== toToken?.address &&
          (x.swapLimit?.formattedNumber ?? 0) > 0 &&
          (x.userBalance?.formattedNumber ?? 0) > MIN_SWAP_AMOUNT,
      ) ?? [],
    [pool?.voucherDetails, toToken?.address],
  );

  const filteredToTokens = useMemo(
    () =>
      pool?.voucherDetails?.filter(
        (x) =>
          x.address !== fromToken?.address &&
          (x.poolBalance?.formattedNumber ?? 0) > MIN_SWAP_AMOUNT,
      ) ?? [],
    [pool?.voucherDetails, fromToken?.address],
  );

  const feeAmount = useMemo(
    () => Number(amount ?? "0") * ((pool?.feePercentage ?? 0) / 100),
    [amount, pool?.feePercentage],
  );
  if (swapState.status === "progress") {
    return <SwapProgressScreen progress={swapState.progress} />;
  }

  if (swapState.status === "error") {
    return (
      <SwapErrorScreen
        error={swapState.error}
        onRetry={() => dispatch({ type: "RESET" })}
      />
    );
  }

  if (swapState.status === "success") {
    return (
      <SwapSuccessScreen
        result={swapState.result}
        onDone={() => onSuccess?.()}
        onSend={() => dispatch({ type: "GO_SEND" })}
      />
    );
  }

  if (swapState.status === "send") {
    return (
      <div className="space-y-4 m-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "GO_BACK" })}
        >
          &larr; Back
        </Button>
        <SendForm voucherAddress={swapState.result.toAddress} />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 m-1">
        <SwapField
          form={form}
          selectProps={{
            name: "fromToken",
            form,
            getFormValue: (voucher) => voucher,
            searchableValue: (x) => `${x.symbol} ${x.name}`,
            getSelectedValue: getVoucherAddressKey,
            placeholder: "From",
            renderItem: (x) => renderVoucherItem(x, "userBalance"),
            renderSelectedItem: renderVoucherChip,
            items: filteredFromTokens,
          }}
          inputProps={{
            name: "amount",
            label: "From",
            placeholder: "0",
            type: "number",
            onChange: () => setLastEditedField("amount"),
          }}
        />

        <div className="flex justify-end">
          <strong>Max &nbsp;</strong>
          <span className="cursor-pointer" onClick={handleSetMax}>
            {max} {fromToken?.symbol ?? ""}
          </span>
        </div>

        <SwapField
          form={form}
          selectProps={{
            name: "toToken",
            form,
            getFormValue: (voucher) => voucher,
            searchableValue: (x) => `${x.symbol} ${x.name}`,
            getSelectedValue: getVoucherAddressKey,
            placeholder: "To",
            renderItem: (x) => renderVoucherItem(x, "poolBalance"),
            renderSelectedItem: renderVoucherChip,
            items: filteredToTokens,
          }}
          inputProps={{
            name: "toAmount",
            label: "To",
            placeholder: "0",
            type: "number",
            onChange: () => setLastEditedField("toAmount"),
          }}
        />

        <div className="flex justify-between text-gray-400">
          <span>Fee</span>
          <span>{pool?.feePercentage?.toString()} %</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Fee Amount</span>
          <span>
            {feeAmount.toString()} {fromToken?.symbol ?? ""}
          </span>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={write.isPending || isSubmitting || !isValid}
        >
          {write.isPending || isSubmitting ? <Loading /> : "Swap"}
        </Button>
      </form>
    </Form>
  );
}

export function SwapDialog({ pool }: { pool: SwapPool }) {
  const [open, setOpen] = useState(false);
  const [swapKey, setSwapKey] = useState(0);
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      title="Swap"
      preventDismiss
      button={
        <Button disabled={Number(pool?.tokenIndex.entryCount) === 0}>
          <RefreshCcw className="mr-2 h-5 w-5" />
          Swap
        </Button>
      }
    >
      <SwapForm
        key={swapKey}
        pool={pool}
        onSuccess={() => {
          setOpen(false);
          setSwapKey((k) => k + 1);
        }}
      />
    </ResponsiveModal>
  );
}
