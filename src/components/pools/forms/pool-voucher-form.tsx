import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
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
import { fromRawPriceIndex, toRawPriceIndex } from "~/utils/units/pool";
import { getDecimals } from "../contract-functions";
import {
  useAddPoolVoucher,
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
    .refine((v) => Number(v) > 0, { message: "Must be greater than 0" }),
  // Limit is entered in default voucher units as a decimal string
  limit: z
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

  const initialSvRate = fromRawPriceIndex(voucher?.priceIndex);
  const initialSvLimit = voucher?.limitOf?.formattedNumber ?? 0;

  const initialSvRateString: string | undefined = initialSvRate.toString();

  const form = useForm<
    z.input<typeof schema>,
    unknown,
    z.output<typeof schema>
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      pool_address: pool.address,
      voucher_address: voucher?.address,
      exchange_rate: initialSvRateString ?? "",
      // Prefill using precise math: defaultUnits = voucherUnits * rate
      limit: initialSvLimit.toString(),
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

  const svLimit = form.watch("limit");
  const svAddress = form.watch("voucher_address");
  const svSymbol = useVoucherSymbol({
    address: svAddress,
  });
  const rate = form.watch("exchange_rate");
  const dvLimit = Number(svLimit ?? 0) * Number(rate ?? 0);

  const onSubmit = async (data: z.output<typeof schema>) => {
    try {
      if (!client) {
        toast.error("Client not found. Please try again later.");
        return;
      }
      const decimals: number = Number(
        await getDecimals(client, data.voucher_address)
      );
      if (Number.isNaN(decimals)) {
        throw new Error("Invalid decimals format");
      }
      const rawExchangeRate = toRawPriceIndex(Number(data.exchange_rate));
      const rawLimit = parseUnits(data.limit, decimals);

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
            disabled={!!voucher}
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
            items={vouchers ?? []}
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
                Pool Limit
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-1 items-center gap-2 text-sm">
                  <InputField
                    form={form}
                    name="limit"
                    description=""
                    label=""
                    placeholder="e.g. 100"
                    className="flex-1"
                  />
                  <span className="font-semibold px-2 py-1">
                    {svSymbol.data || "..."}
                  </span>
                </div>
                <div className="text-muted-foreground">=</div>
                <div className="flex items-center gap-2 text-sm">
                  <span>{dvLimit}</span>
                  <span className="font-semibold px-2 py-1">
                    {dvSymbol.data || "..."}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Maximum number of vouchers that can enter the pool
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
