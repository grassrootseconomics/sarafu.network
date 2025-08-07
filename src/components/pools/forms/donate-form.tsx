import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt } from "@wagmi/core";
import { ChevronLeft, CreditCard, SproutIcon, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { erc20Abi, isAddress, parseUnits } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { z } from "zod";
import { ResponsiveModal } from "~/components/modal";
import { swapPoolAbi } from "~/contracts/swap-pool/contract";
import { useAuth } from "~/hooks/useAuth";
import { cn } from "~/lib/utils";
import { celoscanUrl } from "~/utils/celo";
import { truncateByDecimalPlace } from "~/utils/number";
import { Loading } from "../../loading";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";
import { SwapField } from "../swap-field";
import { type SwapPool } from "../types";
import { DonationSuccessModal } from "./donation-success-modal";
import { NormieDonationForm } from "./normie-donation-form";
import { zodPoolVoucher } from "./swap-form";
import { defaultReceiptOptions } from "~/config/viem.config.server";

const FormSchema = z
  .object({
    poolAddress: z.string().refine(isAddress, "Invalid pool address"),
    voucher: zodPoolVoucher.optional(),
    amount: z.string(),
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
    if (Number(data.amount) > data.voucher.swapLimit.formattedNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `You are trying to deposit more tokens than are allowed. You can deposit ${data.voucher.swapLimit.formattedNumber}`,
        path: ["amount"],
      });
    }
  });
interface DonateToPoolProps {
  pool: SwapPool;
  button?: React.ReactNode;
}
export const DonateToPoolButton = (props: DonateToPoolProps) => {
  const t = useTranslations("pools.donate");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"square" | "web3">();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const auth = useAuth();
  const hasVouchers = Number(props.pool.tokenIndex.entryCount) > 0;
  const searchParams = useSearchParams();

  useEffect(() => {
    const transactionId = searchParams.get("transactionId");
    const orderId = searchParams.get("orderId");

    if (transactionId && orderId) {
      setShowSuccessModal(true);
    }
  }, [searchParams]);

  return (
    <>
      <ResponsiveModal
        button={
          <Button
            variant={"outline"}
            className="hover:bg-primary hover:text-white transition-colors"
            disabled={!hasVouchers}
          >
            <SproutIcon className="size-5 mr-2" />
            {t("supportThisPool")}
          </Button>
        }
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setType(undefined);
        }}
        title={
          type
            ? t("supportWith", { method: type === "web3" ? t("tokens") : t("card") })
            : t("supportThisPool")
        }
        description={
          !type
            ? t("chooseMethod")
            : type === "web3"
            ? t("supportWithWallet")
            : t("supportWithCard")
        }
      >
        {!type ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="group p-8 h-auto flex flex-col gap-4 hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={() => setType("square")}
              >
                <CreditCard className="h-12 w-12 group-hover:text-primary transition-colors" />
                <div className="space-y-2 text-center">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {t("creditCard")}
                  </h3>
                  <p className="text-sm text-muted-foreground text-wrap">
                    {t("quickAndEasy")}
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className={cn(
                  "group p-8 h-auto flex flex-col gap-4 hover:border-primary hover:bg-primary/5 transition-colors",
                  !auth?.session && "opacity-50"
                )}
                onClick={() => setType("web3")}
                disabled={!auth?.session}
              >
                <Wallet className="h-12 w-12 group-hover:text-primary transition-colors" />
                <div className="space-y-2 text-center">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {t("web3Wallet")}
                  </h3>
                  <p className="text-sm text-muted-foreground text-wrap">
                    {auth?.session
                      ? t("supportWithWallet")
                      : t("connectWalletToEnable")}
                  </p>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-muted-foreground hover:text-foreground"
              onClick={() => setType(undefined)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("backToOptions")}
            </Button>

            {type === "square" ? (
              <NormieDonationForm
                pool={props.pool}
                onSuccess={() => setOpen(false)}
              />
            ) : (
              <DonateToPoolForm
                onSuccess={() => setOpen(false)}
                pool={props.pool}
              />
            )}
          </div>
        )}
      </ResponsiveModal>

      <DonationSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
      />
    </>
  );
};

/**
 * Pools donate to pool form
 * @param {
 *   pool,
 *   onSuccess,
 * }
 * @returns
 */
const DonateToPoolForm = ({
  pool,
  onSuccess,
}: {
  pool: SwapPool;
  onSuccess: () => void;
}) => {
  const form = useForm<
    z.input<typeof FormSchema>,
    unknown,
    z.output<typeof FormSchema>
  >({
    resolver: zodResolver(FormSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      poolAddress: pool?.address,
    },
  });
  const voucher = form.watch("voucher");
  const config = useConfig();
  const max = voucher
    ? truncateByDecimalPlace(
        Math.min(
          voucher.swapLimit?.formattedNumber,
          voucher.userBalance?.formattedNumber
        ),
        2
      )
    : 0;
  const donate = useWriteContract({
    config: config,
  });
  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = form;
  async function onSubmit(data: z.output<typeof FormSchema>) {
    if (!data.voucher) return;
    const toastId = "donate";

    try {
      toast.info("Waiting for Approval Reset ", {
        id: toastId,
        action: null,
        description: "Please confirm the transaction in your wallet.",
        duration: 15000,
      });
      const approvalResetHash = await donate.writeContractAsync({
        address: data.voucher.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [data.poolAddress, BigInt(0)],
      });
      toast.loading("Waiting for Confirmation", {
        id: toastId,
        description: "",
        duration: 15000,
      });
      await waitForTransactionReceipt(config, {
        hash: approvalResetHash,
        ...defaultReceiptOptions,
      });
      toast.info("Waiting for Approval of Transaction", {
        id: toastId,
        description: "Please confirm the transaction in your wallet.",
        duration: 15000,
      });
      const hash2 = await donate.writeContractAsync({
        address: data.voucher.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          data.poolAddress,
          parseUnits(data.amount, Number(data.voucher.decimals)),
        ],
      });
      toast.loading("Waiting for Confirmation", {
        id: toastId,
        description: "",
        duration: 15000,
      });
      await waitForTransactionReceipt(config, {
        hash: hash2,
        ...defaultReceiptOptions,
      });
      const hash = await donate.writeContractAsync({
        abi: swapPoolAbi,
        address: data.poolAddress,
        functionName: "deposit",
        args: [
          data.voucher.address,
          parseUnits(data.amount, data.voucher.decimals),
        ],
      });
      toast.loading("Waiting for Confirmation", {
        id: toastId,
        description: "",
        duration: 15000,
      });
      await waitForTransactionReceipt(config, {
        hash,
        ...defaultReceiptOptions,
      });

      toast.success("Success", {
        id: toastId,
        duration: undefined,
        action: {
          label: "View Transaction",
          onClick: () => window.open(celoscanUrl.tx(hash), "_blank"),
        },
        description: `You have successfully supported with ${data.amount} ${data.voucher.symbol}.`,
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        id: toastId,
        description: "An error occurred while donating",
        duration: undefined,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Available Tokens</h4>
            <SwapField
              selectProps={{
                name: "voucher",
                placeholder: "Select a token",
                items: pool?.voucherDetails ?? [],
                searchableValue: (x) => `${x.name} ${x.symbol}`,
                form: form,
                renderItem: (x) => (
                  <div className="flex justify-between w-full items-center py-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{x.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ({x.symbol})
                      </div>
                    </div>
                    <div className="bg-primary/10 text-primary rounded-md px-3 py-1 text-sm">
                      {x.userBalance?.formatted}
                    </div>
                  </div>
                ),
                renderSelectedItem: (x) => `${x.name} (${x.symbol})`,
                getFormValue: (x) => x,
              }}
              inputProps={{
                name: "amount",
                label: "Amount",
                placeholder: "Enter amount",
                type: "number",
              }}
              form={form}
            />
          </div>

          {voucher && (
            <div className="flex justify-between items-center px-4 py-2 bg-muted/20 rounded-lg">
              <span className="text-sm text-muted-foreground">Maximum</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="font-medium hover:text-primary"
                onClick={() => {
                  form.setValue("amount", max.toString(), {
                    shouldValidate: true,
                  });
                }}
              >
                {max} {voucher.symbol}
              </Button>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full font-medium"
          disabled={donate.isPending || isSubmitting || !isValid}
        >
          {donate.isPending || isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loading />
              Redirecting to Payment...
            </div>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  );
};
