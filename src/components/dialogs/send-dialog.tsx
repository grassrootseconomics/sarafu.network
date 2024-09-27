import { zodResolver } from "@hookform/resolvers/zod";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { type WriteContractErrorType } from "@wagmi/core";
import React from "react";
import { toast } from "sonner";
import { erc20Abi, isAddress, parseGwei, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useSimulateContract,
  useWriteContract,
} from "wagmi";
import { useDebounce } from "~/hooks/useDebounce";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";
import { toUserUnits, toUserUnitsString } from "~/utils/units";
import { AddressField } from "../forms/fields/address-field";
import { SelectVoucherField } from "../forms/fields/select-voucher-field";
import { Loading } from "../loading";
import { ResponsiveModal } from "../modal";
import { TransactionStatus } from "../transactions/transaction-status";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useVoucherDetails } from "../pools/hooks";

const FormSchema = z.object({
  voucherAddress: z.string().refine(isAddress, "Invalid voucher address"),
  amount: z.coerce.number().positive(),
  recipientAddress: z.string().refine(isAddress, "Invalid recipient address"),
});
interface SendDialogProps {
  voucherAddress?: `0x${string}`;
  button?: React.ReactNode;
}

const SendForm = (props: {
  voucherAddress?: `0x${string}`;
  onSuccess?: (hash: `0x${string}`) => void;
  className?: string;
}) => {
  const [showAllVouchers, setShowAllVouchers] = useState(false);
  const { data: allVouchers } = api.voucher.list.useQuery(undefined, {});
  const { data: myVouchers } = api.me.vouchers.useQuery(undefined, {});
  const { data: me } = api.me.get.useQuery(undefined, {});

  const defaultVoucherAddress =
    props.voucherAddress ?? (me?.default_voucher as `0x${string}` | undefined);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      voucherAddress: defaultVoucherAddress,
    },
  });
  const defaultVoucher = allVouchers?.find((v) => v.voucher_address === defaultVoucherAddress);

  const isValid = form.formState.isValid;
  const voucherAddress = form.watch("voucherAddress");
  const recipientAddress = form.watch("recipientAddress");
  const amount = form.watch("amount");
  const debouncedAmount = useDebounce(amount, 500);
  const debouncedRecipientAddress = useDebounce(recipientAddress, 500);
  const {data:voucherDetails} = useVoucherDetails(voucherAddress)
  const simulateContract = useSimulateContract({
    address: voucherAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: [
      debouncedRecipientAddress,
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      parseUnits(debouncedAmount?.toString() ?? "", voucherDetails?.decimals!),
    ],
    query: {
      enabled: Boolean(
        voucherDetails?.decimals &&
        debouncedAmount &&
          debouncedRecipientAddress &&
          voucherAddress &&
          isValid
      ),
    },
    gas: 350_000n,
    maxFeePerGas: parseGwei("10"),
    maxPriorityFeePerGas: 5n,
  });

  const { data: hash, writeContractAsync, isPending } = useWriteContract();
  const account = useAccount();
  const balance = useBalance({
    address: account.address,
    token: voucherAddress,
  });
  const handleSubmit = () => {
    if (simulateContract.data?.request) {
      writeContractAsync?.(simulateContract.data.request).catch(
        (error: WriteContractErrorType) => {
          if (
            (error?.cause as { reason?: string })?.reason === "ERR_OVERSPEND"
          ) {
            form.setError("amount", {
              type: "manual",
              message: "Insufficient balance",
            });
          } else {
            toast.error(error.message);
          }
        }
      );
    }
  };

  const vouchers = React.useMemo(() => {
    if (showAllVouchers) {
      return allVouchers ?? []
    } else {
      if (
        defaultVoucher &&
        !myVouchers?.find((v) => v.voucher_address === defaultVoucher.voucher_address)
      ) {
        if (myVouchers) {
          return [defaultVoucher, ...myVouchers]
        }
        return [defaultVoucher]
      }
      return myVouchers ?? []
    }
  }, [allVouchers, showAllVouchers, defaultVoucher, myVouchers]);
  if (hash) {
    return <TransactionStatus hash={hash} />;
  }
  return (
    <Form {...form}>
      <form
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        className={cn("space-y-8", props.className)}
      >
        <div className="flex flex-col gap-2">
          <SelectVoucherField
            form={form}
            name="voucherAddress"
            label="Voucher"
            placeholder="Select voucher"
            className="flex-grow"
            getFormValue={(v) => v.voucher_address}
            searchableValue={ (x) => `${x.voucher_name} ${x.symbol}`}
            renderItem={ (x) => (
              <div className="flex justify-between w-full flex-wrap items-center">
                {x.voucher_name}
                <div className="ml-2 bg-gray-100 rounded-md px-2 py-1">
                  <strong>{x.symbol}</strong>
                </div>
              </div>
            )}
            renderSelectedItem={ (x) => `${x.voucher_name} (${x.symbol})`}
            items={vouchers}
          />
          <div className="flex  justify-end items-center ">
            <Checkbox
              checked={showAllVouchers}
              onCheckedChange={() => setShowAllVouchers((v) => !v)}
            />
            <span className="ml-2">Show all</span>
          </div>
        </div>

        <AddressField form={form} label="Recipient" name="recipientAddress" />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Amount"
                    {...field}
                    type="number"
                    value={field.value ?? ""}
                  />
                  <div
                    onClick={() => {
                      field.onChange(
                        toUserUnits(balance.data?.value, balance.data?.decimals)
                      );
                    }}
                    className="absolute right-2 top-2 text-slate-400"
                  >
                    {toUserUnitsString(
                      balance.data?.value,
                      balance.data?.decimals
                    )}{" "}
                    {balance.data?.symbol}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {simulateContract.error && (
          <div className="text-red-500 max-w-[100%] break-words">
            {(simulateContract.error as { shortMessage?: string })
              ?.shortMessage ?? "Sorry something went wrong"}
          </div>
        )}
        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-full"
            disabled={!simulateContract?.data?.request || isPending}
          >
            {isPending || simulateContract.isLoading ? <Loading /> : "Send"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export const SendDialog = (props: SendDialogProps) => {
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      button={props.button ?? <PaperPlaneIcon className="m-1" />}
      title="Send Voucher"
    >
      <SendForm className="px-4 mt-4" voucherAddress={props.voucherAddress} />
    </ResponsiveModal>
  );
};
