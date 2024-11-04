import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAddress } from "viem";
import { useConfig, useReadContract, useWriteContract } from "wagmi";
import { z } from "zod";
import { SelectVoucherField } from "~/components/forms/fields/select-voucher-field";
import { ResponsiveModal } from "~/components/modal";
import { swapPoolAbi } from "~/contracts/swap-pool/contract";
import { celoscanUrl } from "~/utils/celo";
import { toUserUnitsString } from "~/utils/units";
import { Loading } from "../../loading";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";
import { type SwapPool } from "../types";
import { zodPoolVoucher } from "./swap-form";
import Address from "~/components/address";
import { ZERO_ADDRESS } from "~/lib/contacts";

const FormSchema = z
  .object({
    poolAddress: z.string().refine(isAddress, "Invalid pool address"),
    voucher: zodPoolVoucher.optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.voucher) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `You must select a voucher`,
        path: ["amount"],
      });
      return;
    }
  });
interface WithdrawFromPoolProps {
  pool: SwapPool;
  button?: React.ReactNode;
}
export const WithdrawDialog = (props: WithdrawFromPoolProps) => {
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      title="Withdraw Fees"
      description="Withdraw fees from the pool to the Fee Address"
      button={
        props.button ? (
          props.button
        ) : (
          <Button variant={"outline"}>Take fees</Button>
        )
      }
    >
      <WithdrawFromPoolForm
        onSuccess={() => setOpen(false)}
        pool={props.pool}
      />
    </ResponsiveModal>
  );
};
export const WithdrawFromPoolForm = ({
  pool,
  onSuccess,
}: {
  pool: SwapPool;
  onSuccess: () => void;
}) => {
  const config = useConfig();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      poolAddress: pool?.address,
    },
  });
  const voucher = form.watch("voucher");
  const feesQuery = useReadContract({
    address: pool.address,
    abi: swapPoolAbi,
    functionName: "fees",
    args: [voucher?.address as `0x${string}`],
    query: {
      enabled: !!voucher,
    },
  });
  const feeAddressQuery = useReadContract({
    address: pool.address,
    abi: swapPoolAbi,
    functionName: "feeAddress",
  });
  const fees = toUserUnitsString(feesQuery.data ?? 0n, voucher?.decimals);
  const hasNoFees = feesQuery.data === 0n;
  const withdraw = useWriteContract({
    config: config,
  });
  const { handleSubmit, formState } = form;
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!data.voucher) return;

    const toastId = "withdraw";
    try {
      toast.info("Confirm Withdrawal", {
        id: toastId,
        description: `Withdrawing ${fees} ${data.voucher.symbol}`,
        duration: 15000,
      });
      const hash = await withdraw.writeContractAsync({
        abi: swapPoolAbi,
        address: data.poolAddress,
        functionName: "withdraw",
        args: [data.voucher.address],
      });
      toast.loading("Waiting for Confirmation", {
        id: toastId,
        description: "",
        duration: 15000,
      });
      await waitForTransactionReceipt(config, {
        hash,
      });
      toast.success("Withdrawal Complete", {
        id: toastId,
        duration: 5000,
        action: {
          label: "View Transaction",
          onClick: () => window.open(celoscanUrl.tx(hash), "_blank"),
        },
        description: `Successfully withdrew ${fees} ${data.voucher.symbol}`,
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Withdrawal Failed", {
        id: toastId,
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while withdrawing",
        duration: 5000,
      });
    }
  }
  const hasNoFeeAddress = !feeAddressQuery.data || feeAddressQuery.data === ZERO_ADDRESS

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <SelectVoucherField
          form={form}
          name="voucher"
          description="Select the token to withdraw"
          placeholder="Select token"
          items={pool?.voucherDetails || []}
          searchableValue={(x) => `${x.name} ${x.symbol}`}
          renderItem={(x) => (
            <div className="flex justify-between w-full flex-wrap items-center">
              {x.name}
              <div className="ml-2 bg-gray-100 rounded-md px-2 py-1">
                <strong>{x.symbol}</strong>
              </div>
            </div>
          )}
          renderSelectedItem={(x) => `${x.name} (${x.symbol})`}
          getFormValue={(x) => x}
          disabled={withdraw.isPending}
        />

        {/* Fee Address Display */}
        <div className="rounded-lg bg-gray-50 p-4 space-y-2">
          <div>
            <div className="text-sm text-gray-600 mb-1">Fee Address:</div>
            {feeAddressQuery.isLoading ? (
              <div className="h-6 animate-pulse bg-gray-200 rounded" />
            ) : hasNoFeeAddress ? (
              <div className="text-red-600">No fee address set. Please set a fee address first.</div>
            ) : (
              <div className="font-mono text-sm">
                <Address address={feeAddressQuery.data} />
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Available to withdraw:</div>
            {feesQuery.isLoading ? (
              <div className="h-6 animate-pulse bg-gray-200 rounded" />
            ) : (
              <div className="text-xl font-semibold">
                {fees} {voucher?.symbol}
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={
            withdraw.isPending ||
            form.formState.isSubmitting ||
            !form.formState.isValid ||
            hasNoFees ||
            hasNoFeeAddress ||
            feesQuery.isLoading
          }
        >
          {withdraw.isPending || formState.isSubmitting ? (
            <Loading />
          ) : hasNoFeeAddress ? (
            "Set Fee Address First"
          ) : hasNoFees ? (
            "No Fees Available"
          ) : (
            `Withdraw ${voucher?.symbol ?? ""}`
          )}
        </Button>
      </form>
    </Form>
  );
};
