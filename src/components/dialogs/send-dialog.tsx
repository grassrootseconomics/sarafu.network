import { zodResolver } from "@hookform/resolvers/zod";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import React from "react";
import { getAddress, isAddress, parseGwei, parseUnits } from "viem";
import {
  erc20ABI,
  useAccount,
  useBalance,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { useDebounce } from "~/hooks/useDebounce";
import { api } from "~/utils/api";
import { toUserUnits, toUserUnitsString } from "~/utils/units";
import { AddressField } from "../forms/fields/address-field";
import { SelectField } from "../forms/fields/select-field";
import { Loading } from "../loading";
import { TransactionStatus } from "../transactions/transaction-status";
import { Button } from "../ui/button";
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
import { Toggle } from "../ui/toggle";
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
  const vouchersQuery = api.voucher.list.useQuery(undefined, {});
  const { data: myVouchers } = api.me.vouchers.useQuery(undefined, {});
  const toast = useToast();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      voucherAddress: props.voucherAddress,
    },
  });
  const voucherAddress = form.watch("voucherAddress");
  const recipientAddress = form.watch("recipientAddress");
  const amount = form.watch("amount");
  const deboucedAmount = useDebounce(amount, 500);
  const deboucedRecipientAddress = useDebounce(recipientAddress, 500);
  const { config, error } = usePrepareContractWrite({
    address: voucherAddress,
    abi: erc20ABI,
    gas: BigInt(350000),
    maxFeePerGas: parseGwei("10"),
    maxPriorityFeePerGas: BigInt(5),
    functionName: "transfer",
    args: [
      deboucedRecipientAddress,
      parseUnits(deboucedAmount?.toString() ?? "", 6),
    ],
    enabled: Boolean(
      deboucedAmount && deboucedRecipientAddress && voucherAddress
    ),
  });

  const { data, writeAsync, isLoading } = useContractWrite(config);
  const account = useAccount();
  const balance = useBalance({
    address: account.address,
    token: voucherAddress,
    cacheTime: 0,
  });
  const handleSubmit = () => {
    writeAsync?.().catch((error: Error) => {
      toast.toast({
        title: "Error",
        description: error.message,
      });
    });
  };

  const vouchers = React.useMemo(() => {
    if (vouchersQuery.data && showAllVouchers) {
      return vouchersQuery.data
        .filter((v) => isAddress(v.voucher_address))
        .map((voucher) => ({
          label: `${voucher.voucher_name} (${voucher.symbol})`,
          value: getAddress(voucher.voucher_address),
        }));
    }
    if (myVouchers && !showAllVouchers) {
      return myVouchers
        .filter((v) => isAddress(v.voucher_address))
        .map((voucher) => ({
          label: `${voucher.voucher_name} (${voucher.symbol})`,
          value: getAddress(voucher.voucher_address),
        }));
    }
    return [];
  }, [vouchersQuery.data, showAllVouchers, myVouchers]);
  if (data) {
    return <TransactionStatus hash={data?.hash} />;
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
          <div className="flex gap-2">
            <SelectField
              form={form}
              name="voucherAddress"
              label="Voucher"
              className="flex-grow"
              items={vouchers}
            />
            <Toggle
              className="mt-auto"
              pressed={showAllVouchers}
              onPressedChange={(e) => setShowAllVouchers(e)}
            >
              Show All
            </Toggle>
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
          {error && form.formState.isValid && (
            <div className="text-red-500">{error.message}</div>
          )}
          <div className="flex justify-center">
            <Button type="submit" disabled={!writeAsync || isLoading}>
              {isLoading ? <Loading /> : "Send"}
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
