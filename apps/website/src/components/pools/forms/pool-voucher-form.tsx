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
import { z } from "zod";
import { InputField } from "~/components/forms/fields/input-field";
import { SelectVoucherField } from "~/components/forms/fields/select-voucher-field";
import { Loading } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { api } from "~/utils/api";
import { useAddPoolVoucher, useUpdatePoolVoucher } from "../hooks";
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
  const form = useForm<PoolVoucherFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      pool_address: pool.address,
      voucher_address: voucher?.address,
      exchange_rate: voucher?.priceIndex
        ? Number(voucher.priceIndex) / 10000
        : undefined,
      limit: voucher?.limitOf?.formattedNumber,
    },
  });
  const queryClient = useQueryClient();

  const { data: vouchers } = api.voucher.list.useQuery();
  const { mutateAsync: addVoucherToPool, isPending: addVoucherToPoolPending } =
    useAddPoolVoucher();
  const {
    mutateAsync: updatePoolVoucher,
    isPending: updatePoolVoucherPending,
  } = useUpdatePoolVoucher();

  const onSubmit = async (data: PoolVoucherFormType) => {
    try {
      if (voucher) {
        await updatePoolVoucher({
          swapPoolAddress: pool.address,
          voucherAddress: data.voucher_address,
          limit: parseUnits(data.limit.toString(), 6),
          exchangeRate: BigInt(data.exchange_rate * 10000),
        });
      } else {
        await addVoucherToPool({
          swapPoolAddress: pool.address,
          voucherAddress: data.voucher_address,
          limit: parseUnits(data.limit.toString(), 6),
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
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <SelectVoucherField
          form={form}
          name="voucher_address"
          label="Voucher"
          placeholder="Select voucher"
          className="flex-grow"
          getFormValue={(v) => v.voucher_address}
          searchableValue={(v) => `${v.voucher_name}`}
          disabled={!!voucher}
          renderSelectedItem={(v) => (
            <div className="flex justify-between">
              <div>{v.voucher_name}</div>
            </div>
          )}
          renderItem={(v) => (
            <div className="flex justify-between">
              <div>{v.voucher_name}</div>
            </div>
          )}
          items={vouchers ?? []}
        />
        <InputField
          form={form}
          name="limit"
          description="Maximum number of vouchers that can be redeemed"
          label="Limit"
          placeholder="Maximum number of vouchers that can be redeemed"
        />
        <InputField
          form={form}
          name="exchange_rate"
          description="Exchange rate of the voucher"
          label="Exchange rate"
          placeholder="Exchange rate of the voucher"
        />

        <Button
          type="submit"
          disabled={addVoucherToPoolPending || updatePoolVoucherPending}
        >
          {addVoucherToPoolPending || updatePoolVoucherPending ? (
            <Loading />
          ) : voucher ? (
            "Update"
          ) : (
            "Add"
          )}
        </Button>
      </form>
    </Form>
  );
}
