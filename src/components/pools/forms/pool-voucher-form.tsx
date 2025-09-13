// Add and edit pool vouchers form
// Add an address
// Add a voucher code
// Add a voucher type
// Add a voucher amount
// Add a voucher expiration date

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
  exchange_rate: z.coerce.number(), // Exchange rate of the voucher
  limitInDefaultVoucherUnits: z.coerce.number(), // Maximum number of vouchers that are allowd in the pool
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
  const form = useForm<
    z.input<typeof schema>,
    unknown,
    z.output<typeof schema>
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      pool_address: pool.address,
      voucher_address: voucher?.address,
      exchange_rate: voucher?.priceIndex
        ? Number(voucher.priceIndex) / 10000
        : undefined,
      limitInDefaultVoucherUnits:
        (voucher?.limitOf?.formattedNumber ?? 0) *
        (voucher?.priceIndex ? Number(voucher.priceIndex) / 10000 : 1),
      manual_address: false,
    },
  });
  const queryClient = useQueryClient();

  const { data: vouchers } = trpc.voucher.list.useQuery({});
  const defaultVoucherSymbol = useVoucherSymbol({
    address: metadata?.default_voucher,
  });
  const add = useAddPoolVoucher();
  const remove = useRemovePoolVoucher();
  const updateVoucherLimit = useUpdatePoolVoucherLimit();
  const updateExchangeRate = useUpdatePoolVoucherExchangeRate();
  const limit = form.watch("limitInDefaultVoucherUnits");
  const selectedVoucherAddress = form.watch("voucher_address");
  const selectedVoucherSymbol = useVoucherSymbol({
    address: selectedVoucherAddress,
  });
  const exchangeRate = form.watch("exchange_rate");
  const limitInSelectedVoucherUnits = limit / exchangeRate;

  const onSubmit = async (data: z.output<typeof schema>) => {
    try {
      if (!client) {
        toast.error("Client not found. Please try again later.");
        return;
      }
      const decimals = await getDecimals(client, data.voucher_address);
      if (typeof decimals !== "number") {
        throw new Error("Invalid decimals format");
      }
      const limitInSelectedVoucherUnits =
        data.limitInDefaultVoucherUnits / data.exchange_rate;

      const hasLimitChanged =
        !voucher?.limitOf ||
        limitInSelectedVoucherUnits !== voucher.limitOf.formattedNumber;
      const hasExchangeRateChanged =
        !voucher?.priceIndex ||
        data.exchange_rate !== Number(voucher.priceIndex) / 10000;
      if (voucher) {
        if (hasLimitChanged) {
          await updateVoucherLimit.mutateAsync({
            swapPoolAddress: pool.address,
            voucherAddress: data.voucher_address,
            limit: parseUnits(limitInSelectedVoucherUnits.toString(), decimals),
          });
        }
        if (hasExchangeRateChanged) {
          await updateExchangeRate.mutateAsync({
            swapPoolAddress: pool.address,
            voucherAddress: data.voucher_address,
            exchangeRate: BigInt(data.exchange_rate * 10000),
          });
        }
      } else {
        await add.mutateAsync({
          swapPoolAddress: pool.address,
          voucherAddress: data.voucher_address,
          limit: parseUnits(limitInSelectedVoucherUnits.toString(), decimals),
          exchangeRate: BigInt(data.exchange_rate * 10000),
        });
      }
      toast.success(`${voucher ? "Updated" : "Added"} Pool Voucher`);

      await queryClient.invalidateQueries({
        queryKey: ["swapPool"],
        refetchType: "all",
      });

      onSuccess();
    } catch (error) {
      console.error("Error adding voucher to pool:", error);
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
    } catch (error) {
      toast.error("Error removing voucher from pool", { id, duration: 4000 });
      console.error("Error removing voucher from pool:", error);
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
                  {selectedVoucherSymbol.data || "..."}
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
                  {defaultVoucherSymbol.data || "..."}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Exchange rate relative to the default voucher (
              {defaultVoucherSymbol.data})
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
                <div className="flex items-center gap-2 text-sm">
                  <span>{limitInSelectedVoucherUnits}</span>
                  <span className="font-semibold px-2 py-1">
                    {selectedVoucherSymbol.data || "..."}
                  </span>
                </div>
                <div className="text-muted-foreground">=</div>

                <div className="flex flex-1 items-center gap-2 text-sm">
                  <InputField
                    form={form}
                    name="limitInDefaultVoucherUnits"
                    description=""
                    label=""
                    placeholder="e.g. 100"
                    className="flex-1"
                  />
                  <span className="font-semibold px-2 py-1">
                    {defaultVoucherSymbol.data || "..."}
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
