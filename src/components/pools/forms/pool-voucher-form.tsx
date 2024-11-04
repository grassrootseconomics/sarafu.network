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
import { useConfig } from "wagmi";
import { z } from "zod";
import AreYouSureDialog from "~/components/dialogs/are-you-sure";
import { CheckBoxField } from "~/components/forms/fields/checkbox-field";
import { InputField } from "~/components/forms/fields/input-field";
import { SelectVoucherField } from "~/components/forms/fields/select-voucher-field";
import { Loading } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { trpc } from "~/lib/trpc";
import { getDecimals } from "../contract-functions";
import {
  useAddPoolVoucher,
  useRemovePoolVoucher,
  useUpdatePoolVoucher,
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
  limit: z.coerce.number(), // Maximum number of vouchers that are allowd in the pool
  manual_address: z.boolean(),
});

type PoolVoucherFormType = z.infer<typeof schema>;
export function PoolVoucherForm({
  pool,
  voucher,
  onSuccess,
}: {
  pool: SwapPool;
  voucher: SwapPoolVoucher | null;
  onSuccess: () => void;
}) {
  const config = useConfig();
  const form = useForm<PoolVoucherFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      pool_address: pool.address,
      voucher_address: voucher?.address,
      exchange_rate: voucher?.priceIndex
        ? Number(voucher.priceIndex) / 10000
        : undefined,
      limit: voucher?.limitOf?.formattedNumber,
      manual_address: false,
    },
  });
  const queryClient = useQueryClient();

  const { data: vouchers } = trpc.voucher.list.useQuery();
  const add = useAddPoolVoucher();
  const remove = useRemovePoolVoucher();
  const update = useUpdatePoolVoucher();
  const onSubmit = async (data: PoolVoucherFormType) => {
    try {
      const decimals = await getDecimals(config, data.voucher_address);
      if (voucher) {
        await update.mutateAsync({
          swapPoolAddress: pool.address,
          voucherAddress: data.voucher_address,
          limit: parseUnits(data.limit.toString(), decimals),
          exchangeRate: BigInt(data.exchange_rate * 10000),
        });
      } else {
        await add.mutateAsync({
          swapPoolAddress: pool.address,
          voucherAddress: data.voucher_address,
          limit: parseUnits(data.limit.toString(), decimals),
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
  const isPending = add.isPending || update.isPending || remove.isPending;
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
            searchableValue={(x) => `${x.voucher_name} ${x.symbol}`}
            renderItem={(x) => (
              <div className="flex justify-between w-full flex-wrap items-center">
                {x.voucher_name}
                <div className="ml-2 bg-gray-100 rounded-md px-2 py-1">
                  <strong>{x.symbol}</strong>
                </div>
              </div>
            )}
            renderSelectedItem={(x) => `${x.voucher_name} (${x.symbol})`}
            items={vouchers ?? []}
          />
        )}

        <InputField
          form={form}
          name="limit"
          description="Maximum number of vouchers that can enter the pool"
          label="Limit"
          placeholder="e.g. 100"
        />
        <InputField
          form={form}
          name="exchange_rate"
          description="Exchange rate of the voucher"
          label="Exchange rate"
          placeholder="e.g. 1"
        />
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
