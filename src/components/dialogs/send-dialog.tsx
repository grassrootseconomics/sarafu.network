"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, CornerDownLeft, Lock, Send, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { type WriteContractErrorType } from "@wagmi/core";
import React from "react";
import { toast } from "sonner";
import { erc20Abi, isAddress, parseUnits } from "viem";
import { useAccount, useSimulateContract, useWriteContract } from "wagmi";
import { ResponsiveModal } from "~/components/responsive-modal";
import { useBalance } from "~/contracts/react";
import { useAuth } from "~/hooks/use-auth";
import { useDebounce } from "~/hooks/use-debounce";
import { useDivviReferral } from "~/hooks/use-divvi-referral";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import Address from "../address";
import { AddressField } from "../forms/fields/address-field";
import { Loading } from "../loading";
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
import { VoucherSelectField } from "../voucher/voucher-select-field";

const FormSchema = z.object({
  voucherAddress: z.custom<`0x${string}`>(isAddress, "Invalid voucher address"),
  amount: z.coerce.number().positive(),
  recipientAddress: z.custom<`0x${string}`>(
    isAddress,
    "Invalid recipient address",
  ),
});

interface SendDialogProps {
  voucherAddress?: `0x${string}`;
  ownerAddress?: `0x${string}`;
  redeemMode?: boolean;
  button?: React.ReactNode;
}

export const SendForm = (props: {
  voucherAddress?: `0x${string}`;
  recipientAddress?: `0x${string}`;
  ownerAddress?: `0x${string}`;
  redeemMode?: boolean;
  onSuccess?: () => void;
  className?: string;
}) => {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const { submitReferral, getReferralTag } = useDivviReferral();
  const [showAllVouchers, setShowAllVouchers] = useState(false);
  const [recipientKey, setRecipientKey] = useState(0);
  const [showContacts, setShowContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{
    name: string;
    address: string;
  } | null>(null);

  const { data: allVouchers } = trpc.voucher.list.useQuery({}, {});
  const { data: myVouchers } = trpc.me.vouchers.useQuery(undefined, {
    enabled: Boolean(auth?.session?.address),
  });
  const { data: events } = trpc.me.events.useQuery(
    { limit: 50 },
    { enabled: Boolean(auth?.session?.address) },
  );

  const defaultVoucherAddress =
    props.voucherAddress ??
    (auth?.user?.default_voucher as `0x${string}` | undefined);

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
      recipientAddress: props.redeemMode
        ? props.ownerAddress
        : props.recipientAddress,
    },
  });

  const defaultVoucher = allVouchers?.find(
    (v) => v.voucher_address === defaultVoucherAddress,
  );

  // Derive recent send recipients from transaction history
  const contacts = React.useMemo(() => {
    if (!events?.events || !auth?.session?.address) return [];
    const currentAddress = auth.session.address.toLowerCase();
    const seen = new Set<string>();
    return events.events
      .filter(
        (tx) =>
          tx.event_type?.toLowerCase() === "token_transfer" &&
          typeof tx.from_address === "string" &&
          tx.from_address.toLowerCase() === currentAddress,
      )
      .map((tx) => tx.to_address)
      .filter(
        (addr: string) => addr && !seen.has(addr) && (seen.add(addr), true),
      )
      .slice(0, 5)
      .map((addr: string) => ({
        name: `${addr.slice(0, 6)}…${addr.slice(-4)}`,
        address: addr,
      }));
  }, [events, auth?.session?.address]);

  const isValid = form.formState.isValid;
  const voucherAddress = form.watch("voucherAddress");
  const recipientAddress = form.watch("recipientAddress");
  const amount = form.watch("amount");
  const debouncedAmount = useDebounce(amount, 500);
  const debouncedRecipientAddress = useDebounce(recipientAddress, 500);
  const { data: voucherDetails } = useVoucherDetails(voucherAddress);

  const currentVoucher = React.useMemo(
    () => allVouchers?.find((v) => v.voucher_address === voucherAddress),
    [allVouchers, voucherAddress],
  );

  // Use explicit ownerAddress prop if provided, otherwise derive from the selected voucher
  const effectiveOwnerAddress =
    props.ownerAddress ??
    (currentVoucher?.redemption_address as `0x${string}` | undefined);

  const simulateContract = useSimulateContract({
    address: voucherAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: [
      debouncedRecipientAddress,
      parseUnits(
        debouncedAmount?.toString() ?? "",
        voucherDetails?.decimals ?? 0,
      ),
    ],
    dataSuffix: getReferralTag(),
    query: {
      enabled: Boolean(
        voucherDetails?.decimals &&
        debouncedAmount &&
        debouncedRecipientAddress &&
        voucherAddress &&
        isValid,
      ),
    },
    gas: 350_000n,
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
              message: "Insufficient balance",
            });
          } else {
            console.error(error.message);
            toast.error(error.message);
          }
        })
        .then((txHash) => {
          if (txHash) {
            void submitReferral(txHash);
          }
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
          (v) => v.voucher_address === defaultVoucher.voucher_address,
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
  if (isPending) {
    return <TransactionStatus />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        className={cn("space-y-8", props.className)}
      >
        {/* ── Voucher section ── */}
        {props.redeemMode ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium leading-none">Voucher</p>
            <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2.5 text-sm">
              {defaultVoucher?.icon_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={defaultVoucher.icon_url}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded-full object-cover"
                />
              )}
              <span className="font-medium">
                {defaultVoucher?.voucher_name ?? "Voucher"}
              </span>
              {defaultVoucher?.symbol && (
                <span className="text-muted-foreground">
                  {defaultVoucher.symbol}
                </span>
              )}
              <Lock className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <VoucherSelectField
              form={form}
              name="voucherAddress"
              label="Voucher"
              placeholder="Select voucher"
              className="flex-grow"
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
            <div className="flex justify-end items-center">
              <Checkbox
                checked={showAllVouchers}
                onCheckedChange={() => setShowAllVouchers((v) => !v)}
              />
              <span className="ml-2">Show all</span>
            </div>
          </div>
        )}

        {/* ── Recipient section ── */}
        {props.redeemMode ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium leading-none">Recipient</p>
            <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Lock className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {effectiveOwnerAddress
                  ? `${effectiveOwnerAddress.slice(0, 6)}…${effectiveOwnerAddress.slice(-4)}`
                  : "Voucher owner"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <AddressField
              key={recipientKey}
              form={form}
              label="Recipient"
              name="recipientAddress"
              className="space-y-4"
              labelAction={
                effectiveOwnerAddress ? (
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[13px] font-normal text-primary hover:underline hover:underline-offset-2"
                    onClick={() => {
                      form.setValue("recipientAddress", effectiveOwnerAddress, {
                        shouldValidate: true,
                      });
                      setRecipientKey((k) => k + 1);
                      setSelectedContact(null);
                    }}
                  >
                    <CornerDownLeft className="h-3 w-3 shrink-0" />
                    Send to Voucher Owner (Redeem)
                  </button>
                ) : undefined
              }
            />

            {/* Helper text: voucher owner or recent send recipient */}
            {effectiveOwnerAddress &&
            recipientAddress === effectiveOwnerAddress &&
            currentVoucher ? (
              <p className="mt-1 text-xs text-primary">
                Sending {currentVoucher.symbol} to {currentVoucher.voucher_name}
              </p>
            ) : selectedContact &&
              recipientAddress === selectedContact.address ? (
              <p className="mt-1 text-xs text-primary">
                Sending to {selectedContact.name}
              </p>
            ) : null}

            {/* Contacts */}
            {contacts.length > 0 && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowContacts((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Users className="h-3 w-3" />
                  <span>Recent sends</span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform duration-150",
                      showContacts && "rotate-180",
                    )}
                  />
                </button>
                {showContacts && (
                  <div className="mt-1.5 overflow-hidden rounded-md border bg-card shadow-sm">
                    {contacts.map((contact) => (
                      <button
                        key={contact.address}
                        type="button"
                        onClick={() => {
                          form.setValue(
                            "recipientAddress",
                            contact.address as `0x${string}`,
                            { shouldValidate: true },
                          );
                          setRecipientKey((k) => k + 1);
                          setShowContacts(false);
                          setSelectedContact(contact);
                        }}
                        className="flex w-full items-center gap-3 border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {contact.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-none">
                            <Address
                              className="inline-block mr-1"
                              address={contact.address}
                              forceTruncate={true}
                              linkTo="none"
                            />
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {contact.address.slice(0, 6)}…
                            {contact.address.slice(-4)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Amount ── */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="relative mt-1.5">
                  <Input
                    placeholder="Amount"
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
              if (error.message?.includes("insufficient funds"))
                return "Insufficient funds to complete this transaction";
              if (error.message?.includes("gas required exceeds allowance"))
                return "Transaction would exceed gas limits";
              return (
                error.shortMessage ??
                "Unable to process transaction. Please verify your inputs and try again"
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
            {isPending || simulateContract.isLoading ? <Loading /> : "Send"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export const SendDialog = (props: SendDialogProps) => {
  return (
    <ResponsiveModal
      button={props.button ?? <Send className="m-1" />}
      title={props.redeemMode ? "Redeem Voucher" : "Send Voucher"}
    >
      <SendForm
        className="px-4 mt-4"
        voucherAddress={props.voucherAddress}
        ownerAddress={props.ownerAddress}
        redeemMode={props.redeemMode}
      />
    </ResponsiveModal>
  );
};
