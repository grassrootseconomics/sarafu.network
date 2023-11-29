import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { isAddress, parseGwei, parseUnits } from "viem";
import { useAccount, useBalance, useWriteContract } from "wagmi";
import * as z from "zod";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { config } from "~/lib/web3";
import { AddressField } from "../forms/fields/address-field";
import { InputField } from "../forms/fields/input-field";
import { Loading } from "../loading";
import Hash from "../transactions/hash";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";
import { useToast } from "../ui/use-toast";

const FormSchema = z.object({
  amount: z.coerce.number().positive(),
  recipientAddress: z.string().refine(isAddress, "Invalid recipient address"),
});

const MintToDialog = ({
  voucher,
  button,
}: {
  voucher: {
    id: number;
    voucher_address: string;
  };
  button?: React.ReactNode;
}) => {
  const toast = useToast();
  const account = useAccount();
  const balance = useBalance({
    address: account.address,
    token: voucher.voucher_address as `0x${string}`,
    query: {
      enabled: !!account.address && !!voucher.voucher_address,
    },
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: {
      amount: 0,
    },
  });
  const mintTo = useWriteContract({
    config,
    mutation: {
      onError: (error) => {
        toast.toast({
          title: "Error",
          description: error.message,
        });
      },
      onSuccess: (hash) => {
        toast.toast({
          title: "Success",
          description: <Hash hash={hash} />,
        });
      },
    },
  });
  const handleSubmit = (data: z.infer<typeof FormSchema>) => {
    mintTo.writeContract({
      address: voucher.voucher_address as `0x${string}`,
      abi: abi,
      functionName: "mintTo",
      gas: 350_000n,
      maxFeePerGas: parseGwei("10"),
      maxPriorityFeePerGas: 5n,
      args: [
        data.recipientAddress,
        parseUnits(data.amount.toString() ?? "", balance.data?.decimals ?? 6),
      ],
    });
  };
  const MintToForm = (
    <Form {...form}>
      <form
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        className="space-y-8"
      >
        <AddressField form={form} label="Recipient" name="recipientAddress" />
        <InputField form={form} name="amount" label="Amount" />

        <div className="flex justify-center">
          <Button type="submit" disabled={mintTo.isPending}>
            {mintTo.isPending ? <Loading /> : "MintTo"}
          </Button>
        </div>
      </form>
    </Form>
  );
  return (
    <Dialog>
      <DialogTrigger asChild>
        {button ? button : <Button variant={"ghost"}>Mint To</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>MintTo</DialogTitle>
          <DialogDescription>Mint to an Address</DialogDescription>
        </DialogHeader>
        {mintTo.isPending ? <Loading /> : MintToForm}
      </DialogContent>
    </Dialog>
  );
};

export default MintToDialog;
