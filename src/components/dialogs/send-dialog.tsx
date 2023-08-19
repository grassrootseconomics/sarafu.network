import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  PaperPlaneIcon,
  Share1Icon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Check, ChevronsUpDown } from "lucide-react";
import React from "react";
import { getAddress, isAddress, parseUnits } from "viem";
import {
  erc20ABI,
  useAccount,
  useBalance,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useUser } from "~/hooks/useAuth";
import { useIsMounted } from "~/hooks/useIsMounted";
import useWebShare from "~/hooks/useWebShare";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";
import { celoscanUrl } from "~/utils/celo";
import { toUserUnits, toUserUnitsString } from "~/utils/units";
import Hash from "../hash";
import { Loading } from "../loading";
import { Button, buttonVariants } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useToast } from "../ui/use-toast";

const FormSchema = z.object({
  voucherAddress: z.string().refine(isAddress, "Invalid voucher address"),
  amount: z.number().positive(),
  recipientAddress: z.string().refine(isAddress, "Invalid recipient address"),
});
interface SendDialogProps {
  voucherAddress?: `0x${string}`;
}
const SendDialog = (props: SendDialogProps) => {
  const [open, setOpen] = useState(false);
  const vouchersQuery = api.voucher.all.useQuery(undefined, {});
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: {
      voucherAddress: props.voucherAddress,
      amount: 0,
    },
  });
  const toast = useToast();
  const voucherAddress = form.watch("voucherAddress");
  const {
    data: sentData,
    isLoading,
    write,
    reset,
  } = useContractWrite({
    address: voucherAddress,
    abi: erc20ABI,
    functionName: "transfer",
    onError: (error) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (error.cause?.reason === "ERR_OVERSPEND") {
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
    },
  });

  const account = useAccount();
  const balance = useBalance({
    address: account.address,
    token: voucherAddress,
  });
  const vouchers = React.useMemo(() => {
    if (vouchersQuery.data) {
      return vouchersQuery.data.map((voucher) => ({
        label: voucher.voucher_name,
        value: getAddress(voucher.voucher_address),
      }));
    }
    return [];
  }, [vouchersQuery.data]);
  const handleSubmit = (data: z.infer<typeof FormSchema>) => {
    write({
      args: [
        data.recipientAddress,
        parseUnits(data.amount.toString() ?? "", 6),
      ],
    });
  };
  const handleOpenChanged = (open: boolean) => {
    if (open) {
      setOpen(open);
    } else {
      reset();
      form.reset();
      setOpen(false);
    }
  };
  const renderForm = () => (
    <>
      <DialogHeader>
        <DialogTitle>Send</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="voucherAddress"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Voucher</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? vouchers.find((v) => v.value === field.value)?.label
                          : "Select Voucher"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Search vouchers..." />
                      <CommandEmpty>No vouchers found.</CommandEmpty>
                      <CommandGroup>
                        {vouchers.map((v) => (
                          <CommandItem
                            value={v.label}
                            key={v.value}
                            onSelect={() => {
                              form.setValue(
                                "voucherAddress",
                                getAddress(v.value)
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                v.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {v.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="recipientAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient</FormLabel>
                <FormControl>
                  <Input placeholder="0x..." {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={() => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Amount"
                      {...form.register("amount", {
                        valueAsNumber: true,
                      })}
                    />
                    <div
                      onClick={() => {
                        form.setValue(
                          "amount",
                          toUserUnits(
                            balance.data?.value,
                            balance.data?.decimals
                          )
                        );
                      }}
                      className="absolute right-1 top-2 text-slate-400"
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
          <div className="flex justify-center">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loading /> : "Send"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
  return (
    <Dialog modal open={open} onOpenChange={handleOpenChanged}>
      <DialogTrigger
        className={cn(buttonVariants({ variant: "default" }), "m-1")}
      >
        <PaperPlaneIcon />
      </DialogTrigger>
      <DialogContent className="max-w-md">
        {sentData?.hash ? (
          <WaitForTransaction hash={sentData.hash} />
        ) : (
          renderForm()
        )}
      </DialogContent>
    </Dialog>
  );
};
function WaitForTransaction({ hash }: { hash: `0x${string}` }) {
  const { data, isError, isLoading, error } = useWaitForTransaction({
    hash: hash,
  });
  const share = useWebShare();
  if (isLoading)
    return (
      <div className="flex flex-col  justify-center align-middle items-center">
        <Loading status={`Waiting for Transaction`} />
        <div className="mt-2">
          <Hash hash={hash} />
        </div>
      </div>
    );
  if (isError)
    return (
      <div className="flex flex-col justify-center align-middle items-center">
        <CrossCircledIcon color="red" width={40} height={40} />
        <div className="text-lg text-center font-semibold">Error</div>
        <div className="text-md">{error?.name}</div>
        <div className="text-sm">{error?.message}</div>
      </div>
    );
  if (!data)
    return <div className="text-lg text-center">Transaction not found 🤔</div>;
  return (
    <div className="flex flex-col justify-center align-middle items-center">
      <CheckCircledIcon color="lightgreen" width={40} height={40} />
      <div className="text-lg text-center font-semibold">Success</div>
      <div className="mt-2 flex items-center justify-center ">
        <Hash hash={hash} />
        {share.isSupported && (
          <Button
            variant={"ghost"}
            className="ml-2"
            onClick={() =>
              share.share({
                title: "Voucher Sent",
                text: `Voucher sent to ${data?.to ?? ""}`,
                url: celoscanUrl.tx(hash),
              })
            }
          >
            <Share1Icon />
          </Button>
        )}
      </div>
    </div>
  );
}
export const PageSendButton = (props: SendDialogProps) => {
  const mounted = useIsMounted();
  const user = useUser();
  if (!mounted || !user) return null;
  return (
    <div className="fixed bottom-0 right-0 z-[9999] m-3">
      <SendDialog {...props} />
    </div>
  );
};
