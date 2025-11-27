import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt } from "@wagmi/core";
import { RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { erc20Abi, isAddress, parseUnits } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { z } from "zod";
import { Loading } from "~/components/loading";
import { ResponsiveModal } from "~/components/responsive-modal";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { VoucherChip } from "~/components/voucher/voucher-chip";
import { defaultReceiptOptions } from "~/config/viem.config.server";
import { swapPoolAbi } from "~/contracts/swap-pool/contract";
import { useDivviReferral } from "~/hooks/useDivviReferral";
import { trpc } from "~/lib/trpc";
import { celoscanUrl } from "~/utils/celo";
import { truncateByDecimalPlace } from "~/utils/units/number";
import { SwapField } from "../swap-field";
import { type SwapPool, type SwapPoolVoucher } from "../types";
import { convert } from "../utils";

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

    // Validate amounts are greater than 0
    if (amountNum === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount must be greater than 0",
        path: ["amount"],
      });
    }
    if (toAmountNum === 0) {
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

// Helper functions
const isVoucherLike = (
  value: unknown
): value is Pick<SwapPoolVoucher, "address"> =>
  typeof value === "object" &&
  value !== null &&
  "address" in value &&
  typeof (value as { address?: unknown }).address === "string";

const getVoucherAddressKey = (value: unknown) =>
  isVoucherLike(value) ? value.address : value;

const DEMURRAGE_BUFFER = 1005n / 1000n; // 0.5% buffer for demurrage

interface SwapFormProps {
  pool: SwapPool | undefined;
  onSuccess?: () => void;
  initial?: {
    toAddress?: `0x${string}`;
    fromAddress?: `0x${string}`;
    toAmount?: string;
  };
}

export function SwapForm({ pool, onSuccess, initial }: SwapFormProps) {
  const config = useConfig();
  const utils = trpc.useUtils();
  const write = useWriteContract({ config });
  const { submitReferral } = useDivviReferral();

  const form = useForm<z.infer<typeof swapFormSchema>>({
    resolver: zodResolver(swapFormSchema),
    mode: "all",
    defaultValues: {
      amount: "0",
      toAmount: "0",
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
    "amount"
  );
  const lastInitialToAddressRef = useRef<`0x${string}` | undefined>(undefined);
  const lastInitialFromAddressRef = useRef<`0x${string}` | undefined>(
    undefined
  );
  const lastInitialToAmountRef = useRef<string | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize tokens from initial addresses
  useEffect(() => {
    if (!pool?.voucherDetails || !initial?.toAddress) {
      lastInitialToAddressRef.current = undefined;
      return;
    }
    if (lastInitialToAddressRef.current === initial.toAddress) return;

    const voucher = pool.voucherDetails.find(
      (x) => x.address === initial.toAddress
    );
    if (voucher) {
      lastInitialToAddressRef.current = initial.toAddress;
      // @ts-expect-error TS2322
      setValue("toToken", voucher, { shouldValidate: true });
    }
  }, [initial?.toAddress, pool?.voucherDetails, setValue]);

  useEffect(() => {
    if (!pool?.voucherDetails || !initial?.fromAddress) {
      lastInitialFromAddressRef.current = undefined;
      return;
    }
    if (lastInitialFromAddressRef.current === initial.fromAddress) return;

    const voucher = pool.voucherDetails.find(
      (x) => x.address === initial.fromAddress
    );
    if (voucher) {
      lastInitialFromAddressRef.current = initial.fromAddress;
      // @ts-expect-error TS2322
      setValue("fromToken", voucher, { shouldValidate: true });
    }
  }, [initial?.fromAddress, pool?.voucherDetails, setValue]);

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
      const converted = convert(amount, fromToken, toToken)?.formatted ?? "";
      setValue("toAmount", converted, { shouldValidate: true });
    } else {
      const converted = convert(toAmount, toToken, fromToken)?.formatted ?? "";
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

  // Calculate maximum swappable amount
  const max = useMemo(() => {
    if (!fromToken || !toToken) return 0;

    const toAmountMax = convert(
      toToken.poolBalance?.formatted,
      toToken,
      fromToken
    );
    return (
      truncateByDecimalPlace(
        Math.max(
          0,
          Math.min(
            fromToken.swapLimit?.formattedNumber ?? 0,
            fromToken.userBalance?.formattedNumber ?? 0,
            toAmountMax?.formattedNumber ?? 0
          )
        ),
        2
      ) ?? 0
    );
  }, [fromToken, toToken]);

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

      const showToast = (
        variant: "info" | "loading" | "success" | "error",
        description: string,
        action?: { label: string; onClick: () => void }
      ) => {
        const config = {
          id: "swap",
          description,
          duration:
            variant === "success" || variant === "error" ? undefined : 15000,
          action: action ?? null,
        };
        if (variant === "loading") toast.loading(description, config);
        else if (variant === "success") toast.success("Success", config);
        else if (variant === "error") toast.error("Error", config);
        else toast.info(description, config);
      };

      try {
        const amountWithBuffer =
          parseUnits(data.amount, data.fromToken.decimals) * DEMURRAGE_BUFFER;

        // Step 1: Reset approval
        showToast("info", "Please confirm the approval reset in your wallet.");
        const resetHash = await write.writeContractAsync({
          address: data.fromToken.address,
          abi: erc20Abi,
          functionName: "approve",
          args: [pool.address, BigInt(0)],
        });
        showToast("loading", "Waiting for reset confirmation");
        await waitForTransactionReceipt(config, {
          hash: resetHash,
          ...defaultReceiptOptions,
        });

        // Step 2: Approve amount
        showToast("info", "Please confirm the approval in your wallet.");
        const approvalHash = await write.writeContractAsync({
          address: data.fromToken.address,
          abi: erc20Abi,
          functionName: "approve",
          args: [pool.address, amountWithBuffer],
        });
        showToast("loading", "Waiting for approval confirmation");
        await waitForTransactionReceipt(config, {
          hash: approvalHash,
          ...defaultReceiptOptions,
        });

        // Step 3: Execute swap
        showToast(
          "info",
          "Please confirm the swap transaction in your wallet."
        );
        const swapHash = await write.writeContractAsync({
          address: pool.address,
          abi: swapPoolAbi,
          functionName: "withdraw",
          args: [
            data.toToken.address,
            data.fromToken.address,
            parseUnits(data.amount, data.fromToken.decimals),
          ],
        });

        // Submit Divvi referral for transaction attribution (non-blocking)
        void submitReferral(swapHash);

        const txAction = {
          label: "View Transaction",
          onClick: () => window.open(celoscanUrl.tx(swapHash), "_blank"),
        };
        showToast("loading", "Waiting for swap confirmation");
        await waitForTransactionReceipt(config, {
          hash: swapHash,
          ...defaultReceiptOptions,
        });

        showToast(
          "success",
          `You have successfully swapped ${data.amount} ${data.fromToken.symbol} for ${data.toAmount} ${data.toToken.symbol}.`,
          txAction
        );

        void utils.me.events.invalidate();
        void utils.me.vouchers.invalidate();
        onSuccess?.();
      } catch (error) {
        console.error(error);
        showToast("error", "An error occurred while swapping");
      }
    },
    [pool, write, config, utils, onSuccess, submitReferral]
  );

  // Render voucher chip
  const renderVoucherChip = useCallback(
    (voucher: SwapPoolVoucher) => (
      <VoucherChip voucher_address={voucher.address} />
    ),
    []
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
    []
  );

  const filteredFromTokens = useMemo(
    () =>
      pool?.voucherDetails?.filter((x) => x.address !== toToken?.address) ?? [],
    [pool?.voucherDetails, toToken?.address]
  );

  const filteredToTokens = useMemo(
    () =>
      pool?.voucherDetails?.filter((x) => x.address !== fromToken?.address) ??
      [],
    [pool?.voucherDetails, fromToken?.address]
  );

  const feeAmount = useMemo(
    () => Number(amount ?? "0") * ((pool?.feePercentage ?? 0) / 100),
    [amount, pool?.feePercentage]
  );
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
            placeholder: "Amount",
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
            placeholder: "Amount",
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
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      title="Swap"
      button={
        <Button disabled={Number(pool?.tokenIndex.entryCount) === 0}>
          <RefreshCcw className="mr-2 h-5 w-5" />
          Swap
        </Button>
      }
    >
      <SwapForm pool={pool} onSuccess={() => setOpen(false)} />
    </ResponsiveModal>
  );
}
