"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { type WriteContractErrorType } from "@wagmi/core";
import React from "react";
import { toast } from "sonner";
import { erc20Abi, isAddress, parseGwei, parseUnits } from "viem";
import { useAccount, useSimulateContract, useWriteContract } from "wagmi";
import { useBalance } from "~/contracts/react";
import { useDebounce } from "~/hooks/use-debounce";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { AddressField } from "../forms/fields/address-field";
import { SelectVoucherField } from "../forms/fields/select-voucher-field";
import { Loading } from "../loading";
import { ResponsiveModal } from "../modal";
import { useVoucherDetails } from "../pools/hooks";
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
import { VoucherSelectItem } from "../voucher/select-voucher-item";
const createFormSchema = (t: (key: string) => string) => z.object({
  voucherAddress: z.custom<`0x${string}`>(isAddress, t("validation.invalidVoucherAddress")),
  amount: z.coerce.number().positive(),
  recipientAddress: z.custom<`0x${string}`>(
    isAddress,
    t("validation.invalidRecipientAddress")
  ),
});
interface SendDialogProps {
  voucherAddress?: `0x${string}`;
  button?: React.ReactNode;
}

const SendForm = (props: {
  voucherAddress?: `0x${string}`;
  onSuccess?: () => void;
  className?: string;
}) => {
  const t = useTranslations("forms");
  const auth = useAuth();
  const utils = trpc.useUtils();
  const [showAllVouchers, setShowAllVouchers] = useState(false);
  const { data: allVouchers } = trpc.voucher.list.useQuery({}, {});
  const { data: myVouchers } = trpc.me.vouchers.useQuery(undefined, {
    enabled: Boolean(auth?.session?.address),
  });
  const defaultVoucherAddress =
    props.voucherAddress ??
    (auth?.user?.default_voucher as `0x${string}` | undefined);
  const FormSchema = createFormSchema(t);
  const form = useForm<
    z.input<typeof FormSchema>,
    unknown,
    z.output<typeof FormSchema>
  >({
    resolver: zodResolver(FormSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      voucherAddress: defaultVoucherAddress,
    },
  });
  const defaultVoucher = allVouchers?.find(
    (v) => v.voucher_address === defaultVoucherAddress
  );

  const isValid = form.formState.isValid;
  const voucherAddress = form.watch("voucherAddress");
  const recipientAddress = form.watch("recipientAddress");
  const amount = form.watch("amount");
  const debouncedAmount = useDebounce(amount, 500);
  const debouncedRecipientAddress = useDebounce(recipientAddress, 500);
  const { data: voucherDetails } = useVoucherDetails(voucherAddress);
  const simulateContract = useSimulateContract({
    address: voucherAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: [
      debouncedRecipientAddress,
      parseUnits(
        debouncedAmount?.toString() ?? "",
        voucherDetails?.decimals ?? 0
      ),
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
    maxFeePerGas: parseGwei("27"),
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
      void writeContractAsync?.(simulateContract.data.request)
        .catch((error: WriteContractErrorType) => {
          if (
            (error?.cause as { reason?: string })?.reason === "ERR_OVERSPEND"
          ) {
            form.setError("amount", {
              type: "manual",
              message: t("validation.insufficientBalance"),
            });
          } else {
            console.error(error.message);
            toast.error(error.message);
          }
        })
        .then(() => {
          form.reset();
          void utils.me.events.invalidate();
          void utils.me.vouchers.invalidate();
          props.onSuccess?.();
        });
    }
  };

  const vouchers = React.useMemo(() => {
    if (showAllVouchers) {
      return allVouchers ?? [];
    } else {
      if (
        defaultVoucher &&
        !myVouchers?.find(
          (v) => v.voucher_address === defaultVoucher.voucher_address
        )
      ) {
        if (myVouchers) {
          return [defaultVoucher, ...myVouchers];
        }
        return [defaultVoucher];
      }
      return myVouchers ?? [];
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
            label={t("voucher")}
            placeholder={t("selectVoucher")}
            className="flex-grow"
            getFormValue={(v) => v.voucher_address}
            searchableValue={(x) => `${x.voucher_name} ${x.symbol}`}
            renderItem={(x) => (
              <VoucherSelectItem
                voucher={{
                  address: x.voucher_address as `0x${string}`,
                  name: x.voucher_name,
                  symbol: x.symbol,
                  icon: x.icon_url,
                }}
              />
            )}
            renderSelectedItem={(x) => (
              <VoucherSelectItem
                showBalance={false}
                voucher={{
                  address: x.voucher_address as `0x${string}`,
                  name: x.voucher_name,
                  symbol: x.symbol,
                  icon: x.icon_url,
                }}
              />
            )}
            items={vouchers}
          />
          <div className="flex  justify-end items-center ">
            <Checkbox
              checked={showAllVouchers}
              onCheckedChange={() => setShowAllVouchers((v) => !v)}
            />
            <span className="ml-2">{t("showAll")}</span>
          </div>
        </div>

        <AddressField form={form} label={t("recipient")} name="recipientAddress" />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("amount")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder={t("amount")}
                    {...field}
                    type="number"
                    value={field.value ?? ""}
                  />
                  <div
                    onClick={() => {
                      field.onChange(balance.data?.formattedNumber);
                    }}
                    className="absolute right-2 top-2 text-slate-400 cursor-pointer"
                  >
                    {balance.data?.formatted} {voucherDetails?.symbol}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {simulateContract.error && (
          <div className="text-red-500 max-w-[100%] break-words">
            {(() => {
              const error = simulateContract.error as {
                shortMessage?: string;
                message?: string;
              };
              // Handle specific error cases
              if (error.message?.includes("insufficient funds"))
                return t("validation.insufficientFunds");
              if (error.message?.includes("gas required exceeds allowance"))
                return t("validation.gasLimitExceeded");
              // Return shortMessage if available, otherwise fallback to a user-friendly message
              return (
                error.shortMessage ??
                t("validation.transactionError")
              );
            })()}
          </div>
        )}
        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-full"
            disabled={!simulateContract?.data?.request || isPending}
          >
            {isPending || simulateContract.isLoading ? <Loading /> : t("send")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export const SendDialog = (props: SendDialogProps) => {
  const t = useTranslations("dialogs.sendVoucher");
  
  return (
    <ResponsiveModal
      button={props.button ?? <PaperPlaneIcon className="m-1" />}
      title={t("title")}
    >
      <SendForm className="px-4 mt-4" voucherAddress={props.voucherAddress} />
    </ResponsiveModal>
  );
};
