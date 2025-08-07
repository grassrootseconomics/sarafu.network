import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useTranslations } from "next-intl";
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

const createFormSchema = (t: (key: string) => string) => z.object({
  amount: z.coerce.number().positive(),
  recipientAddress: z.string().refine(isAddress, t("validation.invalidRecipientAddress")),
});

const MintToForm = ({ voucher_address }: { voucher_address: string }) => {
  const t = useTranslations("dialogs.mint");
  const tForms = useTranslations("forms");
  const config = useConfig();
  const account = useAccount();
  const balance = useBalance({
    address: account.address,
    token: voucher_address as `0x${string}`,
    query: {
      enabled: !!account.address && !!voucher_address,
    },
  });
  const FormSchema = createFormSchema(tForms);
  const form = useForm<
    z.input<typeof FormSchema>,
    unknown,
    z.output<typeof FormSchema>
  >({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: {
      amount: 0,
    },
  });
  const mintTo = useWriteContract();

  const handleSubmit = async (data: z.infer<typeof FormSchema>) => {
    const toastId = "mintToast";

    try {
      toast.info(t("mintingAmount", { amount: data.amount, symbol: balance.data?.symbol }), {
        id: toastId,
        description: t("confirmTransaction"),
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
      toast.loading(t("waitingConfirmation"), {
        id: toastId,
        description: "",
        duration: 15000,
      });
      await waitForTransactionReceipt(config, {
        hash: txHash,
        ...defaultReceiptOptions,
      });

      toast.success(t("mintingSuccess"), {
        id: toastId,
        duration: undefined,
        action: {
          label: t("viewTransaction"),
          onClick: () => window.open(celoscanUrl.tx(txHash), "_blank"),
        },
        description: t("mintingSuccessDescription", { amount: data.amount, symbol: balance.data?.symbol }),
      });
    } catch (error) {
      console.error(error);
      toast.error(t("error"), {
        id: toastId,
        description: t("mintingError"),
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
        <AddressField form={form} label={tForms("recipient")} name="recipientAddress" />
        <InputField form={form} name="amount" label={tForms("amount")} />

        <div className="flex justify-center">
          <Button type="submit" disabled={mintTo.isPending}>
            {form.formState.isSubmitting ? <Loading /> : t("mint")}
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
  const t = useTranslations("dialogs.mint");
  
  return (
    <ResponsiveModal
      button={button ?? <Button variant={"ghost"}>{t("mintTo")}</Button>}
      title={t("mint")}
      description={t("mintDescription")}
    >
      <MintToForm voucher_address={voucher_address} />
    </ResponsiveModal>
  );
};
export default MintToDialog;
