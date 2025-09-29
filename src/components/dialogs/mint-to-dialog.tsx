import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt } from "@wagmi/core";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAddress, parseGwei, parseUnits } from "viem";
import { useAccount, useBalance, useConfig, useWriteContract } from "wagmi";
import * as z from "zod";
import { defaultReceiptOptions } from "~/config/viem.config.server";
import { abi } from "~/contracts/erc20-demurrage-token/contract";
import { celoscanUrl } from "~/utils/celo";
import { AddressField } from "../forms/fields/address-field";
import { InputField } from "../forms/fields/input-field";
import { Loading } from "../loading";
import { ResponsiveModal } from "../modal";
import { Button } from "../ui/button";
import { Form } from "../ui/form";

const FormSchema = z.object({
  amount: z.coerce.number().positive(),
  recipientAddress: z.string().refine(isAddress, "Invalid recipient address"),
});

const MintToForm = ({ voucher_address }: { voucher_address: string }) => {
  const config = useConfig();
  const account = useAccount();
  const balance = useBalance({
    address: account.address,
    token: voucher_address as `0x${string}`,
    query: {
      enabled: !!account.address && !!voucher_address,
    },
  });
  const form = useForm<
    z.input<typeof FormSchema>,
    unknown,
    z.output<typeof FormSchema>
  >({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: {
      amount: 0,
      recipientAddress: account.address,
    },
  });
  const mintTo = useWriteContract();

  const handleSubmit = async (data: z.infer<typeof FormSchema>) => {
    const toastId = "mintToast";

    try {
      toast.info(`Minting ${data.amount} ${balance.data?.symbol}`, {
        id: toastId,
        description: "Please confirm the transaction in your wallet.",
        duration: 15000,
      });

      const txHash = await mintTo.writeContractAsync({
        address: voucher_address as `0x${string}`,
        abi: abi,
        functionName: "mintTo",
        gas: 350_000n,
        maxFeePerGas: parseGwei("27"),
        maxPriorityFeePerGas: 5n,
        args: [
          data.recipientAddress,
          parseUnits(data.amount.toString() ?? "", balance.data?.decimals ?? 6),
        ],
      });
      toast.loading("Waiting for Confirmation", {
        id: toastId,
        description: "",
        duration: 15000,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash,
        ...defaultReceiptOptions,
      });

      toast.success("Minting Successfully", {
        id: toastId,
        duration: undefined,
        action: {
          label: "View Transaction",
          onClick: () => window.open(celoscanUrl.tx(txHash), "_blank"),
        },
        description: `You have successfully minted ${data.amount} ${balance.data?.symbol}`,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        id: toastId,
        description: "An error occurred while minting",
        duration: undefined,
      });
    }
  };
  if (form.formState.isSubmitting) return <Loading />;
  return (
    <Form {...form}>
      <form
        onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
        className="space-y-8"
      >
        <AddressField form={form} label="Recipient" name="recipientAddress" />
        <InputField form={form} name="amount" label="Amount" />

        <div className="flex justify-center">
          <Button type="submit" disabled={mintTo.isPending}>
            {form.formState.isSubmitting ? <Loading /> : "Mint"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const MintToDialog = ({
  voucher_address,
  button,
}: {
  voucher_address: string;
  button?: React.ReactNode;
}) => {
  return (
    <ResponsiveModal
      button={button ?? <Button variant={"ghost"}>Mint To</Button>}
      title="Mint"
      description="Mint to an Address"
    >
      <MintToForm voucher_address={voucher_address} />
    </ResponsiveModal>
  );
};
export default MintToDialog;
