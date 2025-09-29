import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAddress, parseUnits } from "viem";
import { usePublicClient } from "wagmi";
import { z } from "zod";
import AreYouSureDialog from "~/components/dialogs/are-you-sure";
import { CheckBoxField } from "~/components/forms/fields/checkbox-field";
import { InputField } from "~/components/forms/fields/input-field";
import { SelectVoucherField } from "~/components/forms/fields/select-voucher-field";
import { Loading } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { VoucherChip } from "~/components/voucher/voucher-chip";
import { useVoucherSymbol } from "~/components/voucher/voucher-name";
import { type RouterOutputs, trpc } from "~/lib/trpc";
import { truncateByDecimalPlace } from "~/utils/units/number";
import {
  fromRawPriceIndex,
  PRICE_INDEX_SCALE,
  toRawPriceIndex,
} from "~/utils/units/pool";
import { getDecimals } from "../contract-functions";
import {
  useAddPoolVoucher,
  useDecimals,
  useRemovePoolVoucher,
  useUpdatePoolVoucherExchangeRate,
  useUpdatePoolVoucherLimit,
} from "../hooks";
import { type SwapPool, type SwapPoolVoucher } from "../types";
// Add a voucher redemption limit
const schema = z.object({
  pool_address: z.string().refine(isAddress, {
    message: "Invalid address",
  }),
  voucher_address: z.string().refine(isAddress, {
    message: "Invalid address",
  }),
  // Use strings to preserve precision; validate they are positive decimals
  exchange_rate: z
    .string()
    .trim()
    .refine((v) => v.length > 0 && !Number.isNaN(Number(v)), {
      message: "Enter a valid number",
    })
    // Max Decimal Places is PRICE_INDEX_SCALE
    .refine(
      (v) => {
        console.log(v?.split(".")[1]?.length ?? 0, PRICE_INDEX_SCALE);
        return v?.split(".")[1]?.length ?? 0 <= PRICE_INDEX_SCALE;
      },
      {
        message: `Enter a valid number with ${PRICE_INDEX_SCALE} decimal places or less`,
      }
    )
    .refine((v) => Number(v) > 0, { message: "Must be greater than 0" }),
  // Limit is entered in default voucher units as a decimal string
  dv_limit: z
    .string()
    .trim()
    .refine((v) => v.length > 0 && !Number.isNaN(Number(v)), {
      message: "Enter a valid number",
    })
    .refine((v) => Number(v) >= 0, { message: "Must be 0 or greater" }),
  manual_address: z.boolean(),
});

export function PoolVoucherForm({
  pool,
  metadata,
  voucher,
  onSuccess,
}: {
  pool: SwapPool;
  metadata: RouterOutputs["pool"]["get"];
  voucher: SwapPoolVoucher | null;
  onSuccess: () => void;
}) {
  const client = usePublicClient();
  const getSvLimit = (dvLimit: string, rate: string, svDecimals: number) => {
    return Number(rate) !== 0
      ? truncateByDecimalPlace(Number(dvLimit ?? 0) / Number(rate), svDecimals)
      : 0;
  };
  const getDvLimit = (svLimit: string, rate: string) => {
    return rate ? Number(svLimit ?? 0) * Number(rate) : 0;
  };
  const initialSvRate = fromRawPriceIndex(voucher?.priceIndex);
  const initialSvLimit = voucher?.limitOf?.formattedNumber ?? 0;

  const initialSvRateString: string | undefined = initialSvRate.toString();

  const form = useForm<
    z.input<typeof schema>,
    unknown,
    z.output<typeof schema>
  >({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      pool_address: pool.address,
      voucher_address: voucher?.address,
      exchange_rate: initialSvRateString ?? "",
      // Prefill using precise math: defaultUnits = voucherUnits * rate
      dv_limit: getDvLimit(
        initialSvLimit.toString(),
        initialSvRateString ?? "0"
      ).toString(),
      manual_address: false,
    },
  });
  const queryClient = useQueryClient();

  const { data: vouchers } = trpc.voucher.list.useQuery({});
  const dvSymbol = useVoucherSymbol({
    address: metadata?.default_voucher,
  });
  const add = useAddPoolVoucher();
  const remove = useRemovePoolVoucher();
  const updateVoucherLimit = useUpdatePoolVoucherLimit();
  const updateExchangeRate = useUpdatePoolVoucherExchangeRate();

  const dvLimit = form.watch("dv_limit");
  const svAddress = form.watch("voucher_address");
  const svSymbol = useVoucherSymbol({
    address: svAddress,
  });
  const svDecimals = useDecimals(svAddress as `0x${string}`);

  const rate = form.watch("exchange_rate");

  const svLimit = getSvLimit(dvLimit, rate, svDecimals?.data ?? 0);

  // Truncate the decimal places to PRICE_INDEX_SCALE
  useEffect(() => {
    const decimals = rate?.split(".")[1];
    if (decimals && decimals.length > PRICE_INDEX_SCALE) {
      form.setValue(
        "exchange_rate",
        rate.split(".")[0] + "." + decimals.slice(0, PRICE_INDEX_SCALE)
      );
    }
  }, [rate]);
  const onSubmit = async (data: z.output<typeof schema>) => {
    try {
      if (!client) {
        toast.error("Client not found. Please try again later.");
        return;
      }
      const svDecimals: number = Number(
        await getDecimals(client, data.voucher_address)
      );
      if (Number.isNaN(svDecimals)) {
        throw new Error("Invalid decimals format");
      }

      if (
        pool.vouchers.length &&
        pool.vouchers.includes(data.voucher_address) &&
        !voucher
      ) {
        toast.error("Voucher already in pool");
        return;
      }

      const rawExchangeRate = toRawPriceIndex(Number(data.exchange_rate));
      const svLimit = getSvLimit(data.dv_limit, data.exchange_rate, svDecimals);
      const rawLimit = parseUnits(svLimit.toString(), svDecimals);

      const hasLimitChanged = rawLimit !== voucher?.limitOf?.value;
      const hasExchangeRateChanged = rawExchangeRate !== voucher?.priceIndex;
      console.log({
        hasLimitChanged,
        hasExchangeRateChanged,
        rawLimit,
        rawExchangeRate,
        voucher,
      });
      if (voucher) {
        if (hasLimitChanged) {
          await updateVoucherLimit.mutateAsync({
            swapPoolAddress: pool.address,
            voucherAddress: data.voucher_address,
            limit: rawLimit,
          });
        }
        if (hasExchangeRateChanged) {
          await updateExchangeRate.mutateAsync({
            swapPoolAddress: pool.address,
            voucherAddress: data.voucher_address,
            exchangeRate: rawExchangeRate,
          });
        }
      } else {
        await add.mutateAsync({
          swapPoolAddress: pool.address,
          voucherAddress: data.voucher_address,
          limit: rawLimit,
          exchangeRate: rawExchangeRate,
        });
      }
      toast.success(`${voucher ? "Updated" : "Added"} Pool Voucher`);

      await queryClient.invalidateQueries({
        queryKey: ["swapPool"],
        refetchType: "all",
      });

      onSuccess();
    } catch (err: unknown) {
      console.error("Error adding voucher to pool:", err);
      toast.error("Error adding voucher to pool");
    }
  };
  const handleRemove = async () => {
    if (!voucher) return;
    const id = "remove-voucher";
    try {
      toast.loading("Removing voucher from pool", {
        id,
        duration: 10000,
      });
      await remove.mutateAsync({
        swapPoolAddress: pool.address,
        voucherAddress: voucher.address,
      });

      toast.success("Removed voucher from pool", { id, duration: undefined });
      onSuccess();
    } catch (err: unknown) {
      toast.error("Error removing voucher from pool", { id, duration: 4000 });
      console.error("Error removing voucher from pool:", err);
    }
  };
  const isPending =
    add.isPending ||
    updateVoucherLimit.isPending ||
    updateExchangeRate.isPending ||
    remove.isPending;

  const vouchersNotInPool = useMemo(
    () =>
      vouchers?.filter(
        (v) =>
          !pool.vouchers.some(
            (pv) => pv.toLowerCase() === v.voucher_address.toLowerCase()
          )
      ),
    [vouchers, pool.vouchers]
  );
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <CheckBoxField
          form={form}
          name="manual_address"
          label="Enter voucher address manually"
        />

        {form.watch("manual_address") ? (
          <InputField
            form={form}
            name="voucher_address"
            label="Voucher Address"
            placeholder="Enter voucher address"
            description="Enter the Address of the Voucher"
          />
        ) : (
          <SelectVoucherField
            form={form}
            name="voucher_address"
            label="Voucher"
            placeholder="Select voucher"
            className="flex-grow"
            getFormValue={(v) => v.voucher_address}
            // disabled={!!vouchersNotInPool}
            searchableValue={(x) => `${x.symbol} ${x.voucher_name}`}
            renderItem={(x) => (
              <VoucherChip
                voucher_address={x.voucher_address as `0x${string}`}
              />
            )}
            renderSelectedItem={(x) => (
              <VoucherChip
                voucher_address={x.voucher_address as `0x${string}`}
              />
            )}
            items={vouchersNotInPool ?? []}
          />
        )}
        <div className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Exchange Rate
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span>1</span>
                <span className="font-semibold px-2 py-1">
                  {svSymbol.data || "..."}
                </span>
              </div>
              <div className="text-muted-foreground">=</div>

              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1">
                  <InputField
                    form={form}
                    name="exchange_rate"
                    type="number"
                    step={`0.${"0".repeat(PRICE_INDEX_SCALE - 1)}1`}
                    description=""
                    label=""
                    placeholder="e.g. 1"
                  />
                </div>
                <span className="font-semibold px-2 py-1 text-sm">
                  {dvSymbol.data || "..."}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Exchange rate relative to the default voucher ({dvSymbol.data})
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Credit Limit
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span>{svLimit ?? "..."}</span>
                  <span className="font-semibold px-2 py-1">
                    {svSymbol.data || "..."}
                  </span>
                </div>

                <div className="text-muted-foreground">=</div>

                <div className="flex flex-1 items-center gap-2 text-sm">
                  <InputField
                    form={form}
                    name="dv_limit"
                    description=""
                    label=""
                    placeholder="e.g. 100"
                    className="flex-1"
                  />
                  <span className="font-semibold px-2 py-1">
                    {dvSymbol.data || "..."}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              How much value in <strong>{dvSymbol.data ?? "..."}</strong> can be
              swapped from the pool using{" "}
              <strong>{svSymbol.data ?? "..."}</strong> Vouchers?
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center space-x-4">
          <Button
            type="submit"
            className="w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isPending}
          >
            {isPending ? <Loading /> : voucher ? "Update" : "Approve"}
          </Button>
          {voucher && (
            <AreYouSureDialog
              disabled={isPending}
              title="Are you sure?"
              description="This will remove the voucher from the Pool Index"
              onYes={handleRemove}
            />
          )}
        </div>
      </form>
    </Form>
  );
}
