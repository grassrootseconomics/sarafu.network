import { zodResolver } from "@hookform/resolvers/zod";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { WriteContractErrorType } from "@wagmi/core";
import React from "react";
import { erc20Abi, isAddress, parseGwei, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useSimulateContract,
  useWriteContract,
} from "wagmi";
import { useDebounce } from "~/hooks/useDebounce";
import { api } from "~/utils/api";
import { toUserUnits, toUserUnitsString } from "~/utils/units";
import { AddressField } from "../forms/fields/address-field";
import { SelectField } from "../forms/fields/select-field";
import { Loading } from "../loading";
import { TransactionStatus } from "../transactions/transaction-status";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

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
}) => {
  const [showAllVouchers, setShowAllVouchers] = useState(false);
  const { data: allVouchers } = api.voucher.list.useQuery(undefined, {});
  const { data: myVouchers } = api.me.vouchers.useQuery(undefined, {});
  const { data: me } = api.me.get.useQuery(undefined, {});

  const toast = useToast();
  const defaultVoucher =
    props.voucherAddress ?? (me?.default_voucher as `0x${string}` | undefined);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      voucherAddress: defaultVoucher,
    },
  });
  const voucherAddress = form.watch("voucherAddress");
  const recipientAddress = form.watch("recipientAddress");
  const amount = form.watch("amount");
  const deboucedAmount = useDebounce(amount, 500);
  const deboucedRecipientAddress = useDebounce(recipientAddress, 500);
  const simulateContract = useSimulateContract({
    address: voucherAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: [
      deboucedRecipientAddress,
      parseUnits(deboucedAmount?.toString() ?? "", 6),
    ],
    query: {
      enabled: Boolean(
        deboucedAmount && deboucedRecipientAddress && voucherAddress
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
            toast.toast({
              title: "Error",
              description: error.message,
            });
          }
        }
      );
    }
  };

  const vouchers = React.useMemo(() => {
    let items: {
      label: string;
      value: `0x${string}`;
    }[] = [];
    const dv = allVouchers?.find((v) => v.voucher_address === defaultVoucher);
    if (showAllVouchers) {
      items = (allVouchers ?? [])?.map((v) => {
        return {
          label: `${v.voucher_name} (${v.symbol})`,
          value: v.voucher_address as `0x${string}`,
        };
      });
    } else {
      if (
        dv &&
        !myVouchers?.find((v) => v.voucher_address === dv?.voucher_address)
      ) {
        items.push({
          label: `${dv?.voucher_name} (${dv?.symbol})`,
          value: dv?.voucher_address as `0x${string}`,
        });
      }
      (myVouchers ?? []).forEach((v) => {
        items.push({
          label: `${v.voucher_name} (${v.symbol})`,
          value: v.voucher_address as `0x${string}`,
        });
      });
    }
    return items;
  }, [allVouchers, showAllVouchers, myVouchers, me?.default_voucher]);
  if (hash) {
    return <TransactionStatus hash={hash} />;
  }
  return (
    <>
      <DialogHeader>
        <DialogTitle>Send</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
          className="space-y-8"
        >
          <div className="flex flex-col gap-2">
            <SelectField
              form={form}
              name="voucherAddress"
              label="Voucher"
              className="flex-grow"
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
                          toUserUnits(
                            balance.data?.value,
                            balance.data?.decimals
                          )
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
            <div className="text-red-500">
              {simulateContract.error.message}
            </div>
          )}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={!simulateContract?.data?.request || isPending}
            >
              {isPending || simulateContract.isLoading ? <Loading /> : "Send"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export const SendDialog = (props: SendDialogProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={Boolean(props.button)}>
        {props.button ? props.button : <PaperPlaneIcon className="m-1" />}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <SendForm
          onSuccess={() => setOpen(false)}
          voucherAddress={props.voucherAddress}
        />
      </DialogContent>
    </Dialog>
  );
};
