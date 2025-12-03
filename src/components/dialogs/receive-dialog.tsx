"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircledIcon,
  ChevronLeftIcon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";
import { Smartphone } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { erc20Abi, parseGwei, parseUnits } from "viem";
import { useAccount, useSimulateContract, useWriteContract } from "wagmi";
import { z } from "zod";

import React from "react";
import { ResponsiveModal } from "~/components/responsive-modal";
import { useBalance } from "~/contracts/react";
import { useDebounce } from "~/hooks/use-debounce";
import { useDivviReferral } from "~/hooks/useDivviReferral";
import { useENS } from "~/lib/sarafu/resolver";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import Address from "../address";
import { Copyable } from "../copyable";
import { SelectVoucherField } from "../forms/fields/select-voucher-field";
import { Loading } from "../loading";
import { useVoucherDetails } from "../pools/hooks";
import AddressQRCode from "../qr-code/address-qr-code";
import { ScanMethodSelection } from "../scan/scan-method-selection";
import {
  ScanWalletInterface,
  type WalletScanResult,
} from "../scan/scan-wallet-interface";
import { useTempPaperWallet } from "../scan/use-temp-paper-wallet";
import { TransactionStatus } from "../transactions/transaction-status";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { VoucherChip } from "../voucher/voucher-chip";

type FlowStep =
  | "scan_method"
  | "scanning"
  | "amount_entry"
  | "confirm"
  | "processing"
  | "success";

interface ReceiveDialogProps {
  voucherAddress?: `0x${string}`;
  button?: React.ReactNode;
}

const receiveFormSchema = z.object({
  voucher: z.string().min(1, "Please select a voucher"),
  amount: z.string().min(1, "Please enter an amount"),
});

type ReceiveFormData = z.infer<typeof receiveFormSchema>;

interface VoucherData {
  voucher_address: string;
  symbol: string;
  voucher_name: string;
  icon_url: string | null;
  voucher_type: string;
}

function AmountEntry(props: {
  walletResult: WalletScanResult;
  voucherAddress?: `0x${string}`;
  onConfirm: (amount: string, voucherAddress: `0x${string}`) => void;
  onBack: () => void;
}) {
  const { data: tempWalletVouchers } = trpc.voucher.vouchersByAddress.useQuery(
    {
      address: props.walletResult.address,
    },
    {
      enabled: Boolean(props.walletResult.address),
    }
  );

  const vouchers = tempWalletVouchers ?? [];

  const form = useForm<ReceiveFormData>({
    resolver: zodResolver(receiveFormSchema),
    defaultValues: {
      voucher: props.voucherAddress || "",
      amount: "",
    },
  });

  const selectedVoucher = form.watch("voucher") as `0x${string}` | undefined;
  const amount = form.watch("amount");

  const onSubmit = (data: ReceiveFormData) => {
    if (data.voucher && data.amount) {
      props.onConfirm(data.amount, data.voucher as `0x${string}`);
    }
  };

  const { data: voucherDetails } = useVoucherDetails(selectedVoucher);
  const walletBalance = useBalance({
    address: props.walletResult.address,
    token: selectedVoucher!,
  });

  const canProceed = selectedVoucher && amount && parseFloat(amount) > 0;
  const hasInsufficientFunds =
    walletBalance.data &&
    parseFloat(amount) > parseFloat(walletBalance.data.formatted);

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Enter Amount</h2>
        <Button variant="outline" size="sm" onClick={props.onBack}>
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-blue-700">
          <CheckCircledIcon className="w-5 h-5" />
          <span className="font-medium">Wallet Scanned</span>
        </div>
        <Address
          address={props.walletResult.address}
          className="text-sm text-blue-600 font-mono break-all"
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <SelectVoucherField<VoucherData, typeof form>
            form={form}
            name="voucher"
            label="Select Voucher"
            placeholder="Choose a voucher from the temporary wallet"
            items={vouchers}
            getFormValue={(item) => item.voucher_address}
            searchableValue={(item) =>
              `${item.voucher_name} ${item.symbol} ${item.voucher_address}`
            }
            renderSelectedItem={(item) => (
              <VoucherChip
                voucher_address={item.voucher_address as `0x${string}`}
              />
            )}
            renderItem={(item) => (
              <VoucherChip
                voucher_address={item.voucher_address as `0x${string}`}
              />
            )}
          />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Amount to Request</Label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                step="any"
                placeholder="0"
                {...form.register("amount")}
                className="text-2xl font-semibold h-14 pr-16"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg font-medium text-gray-500">
                {voucherDetails?.symbol || ""}
              </div>
            </div>
          </div>

          {walletBalance.data && voucherDetails && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Available Balance:
                </span>
                <span className="font-semibold">
                  {walletBalance.data.formatted} {voucherDetails.symbol}
                </span>
              </div>
              {hasInsufficientFunds && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ Insufficient funds
                </p>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={!canProceed || hasInsufficientFunds}
            className="w-full h-12 text-lg font-semibold"
          >
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
}

function ConfirmTransaction(props: {
  walletResult: WalletScanResult;
  amount: string;
  voucherAddress: `0x${string}`;
  onConfirm: () => void;
  onBack: () => void;
  isProcessing: boolean;
}) {
  const { address: currentUserAddress } = useAccount();
  const { data: voucherDetails } = useVoucherDetails(props.voucherAddress);
  const walletBalance = useBalance({
    address: props.walletResult.address,
    token: props.voucherAddress,
  });

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Confirm Request</h2>
        <Button variant="outline" size="sm" onClick={props.onBack}>
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>

      <div className="space-y-4">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-700 mb-1">
            {props.amount} {voucherDetails?.symbol}
          </div>
          <div className="text-sm text-green-600">Amount to receive</div>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <Smartphone className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-xs text-gray-600">From Wallet</div>
              <Address
                address={props.walletResult.address}
                className="text-xs text-gray-700 font-mono mt-1"
                forceTruncate
              />
            </div>

            <PaperPlaneIcon className="w-6 h-6 text-blue-500" />

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <div className="w-6 h-6 bg-green-600 rounded-full" />
              </div>
              <div className="text-xs text-gray-600">To You</div>
              <Address
                address={currentUserAddress}
                className="text-xs text-gray-700 font-mono mt-1"
                forceTruncate
              />
            </div>
          </div>
        </div>

        {walletBalance.data && (
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Wallet Balance:</span>
              <span className="font-semibold text-blue-800">
                {walletBalance.data.formatted} {voucherDetails?.symbol}
              </span>
            </div>
          </div>
        )}

        {voucherDetails && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-600">
                  {voucherDetails.symbol?.charAt(0) || "?"}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  {voucherDetails.name}
                </div>
                <div className="text-sm text-gray-600">
                  {voucherDetails.symbol}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={props.onConfirm}
        disabled={props.isProcessing}
        className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
      >
        {props.isProcessing ? (
          <div className="flex items-center gap-2">
            <Loading />
            Processing...
          </div>
        ) : (
          "Execute Transaction"
        )}
      </Button>
    </div>
  );
}

const RequestForm = (props: {
  voucherAddress?: `0x${string}`;
  onSuccess?: () => void;
  className?: string;
  onClose?: () => void;
}) => {
  const utils = trpc.useUtils();
  const { submitReferral, getReferralTag } = useDivviReferral();
  const [currentStep, setCurrentStep] = useState<FlowStep>("scan_method");
  const [walletResult, setWalletResult] = useState<WalletScanResult | null>(
    null
  );
  const [selectedAmount, setSelectedAmount] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState<
    `0x${string}` | undefined
  >();
  const [scanMethod, setScanMethod] = useState<"qr" | "nfc">("qr");

  const { address: currentUserAddress } = useAccount();
  const { clearStorage } = useTempPaperWallet();
  const debouncedAmount = useDebounce(
    selectedAmount ? parseFloat(selectedAmount) : 0,
    500
  );

  const { data: voucherDetails } = useVoucherDetails(selectedVoucher);

  const isSimulateEnabled = Boolean(
    walletResult?.paperWallet &&
      debouncedAmount > 0 &&
      currentUserAddress &&
      selectedVoucher &&
      voucherDetails?.decimals
  );

  const simulateContract = useSimulateContract({
    address: selectedVoucher,
    abi: erc20Abi,
    functionName: "transfer",
    args:
      currentUserAddress && selectedVoucher && debouncedAmount > 0
        ? [
            currentUserAddress,
            parseUnits(
              debouncedAmount.toString(),
              voucherDetails?.decimals ?? 0
            ),
          ]
        : undefined,
    dataSuffix: getReferralTag(),
    query: {
      enabled: isSimulateEnabled,
    },
    account: walletResult?.address,
    gas: 350_000n,
    maxFeePerGas: parseGwei("27"),
    maxPriorityFeePerGas: 5n,
  });

  const { data: hash, writeContractAsync, isPending } = useWriteContract();

  const handleScanResult = useCallback((result: WalletScanResult) => {
    setWalletResult(result);
    setCurrentStep("amount_entry");
  }, []);

  const handleAmountConfirm = useCallback(
    (amount: string, voucherAddress: `0x${string}`) => {
      setSelectedAmount(amount);
      setSelectedVoucher(voucherAddress);
      setCurrentStep("confirm");
    },
    []
  );

  const handleTransactionConfirm = async () => {
    if (!walletResult?.paperWallet) {
      toast.error("Source wallet not ready");
      return;
    }

    if (!simulateContract.data?.request) {
      console.error("Transaction not ready");
      console.error(simulateContract.error);
      toast.error("Transaction not ready");
      return;
    }

    try {
      setCurrentStep("processing");

      const account = await walletResult.paperWallet.getAccount();

      if (!account || !account.address) {
        toast.error("Failed to access paper wallet account");
        setCurrentStep("confirm");
        return;
      }

      if (
        account.address.toLowerCase() !== walletResult.address.toLowerCase()
      ) {
        toast.error("Security error: wallet address mismatch");
        setCurrentStep("confirm");
        return;
      }

      const txRequest = {
        ...simulateContract.data.request,
        account,
      };

      const txHash = await writeContractAsync(txRequest);

      // Submit Divvi referral for transaction attribution (non-blocking)
      if (txHash) {
        void submitReferral(txHash);
      }

      try {
        clearStorage();
      } catch (error) {
        console.warn("Error clearing temporary data:", error);
      }

      setTimeout(() => {
        void utils.me.events.invalidate();
        void utils.me.vouchers.invalidate();
        void utils.me.get.invalidate();
      }, 2000);

      setTimeout(() => {
        props.onSuccess?.();
      }, 1000);
    } catch (error) {
      console.error("Transaction error:", error);
      setCurrentStep("confirm");

      if (error instanceof Error) {
        if (error.message.includes("insufficient funds")) {
          toast.error("Insufficient funds in scanned wallet");
        } else if (error.message.includes("user rejected")) {
          toast.error("Transaction was cancelled");
        } else if (error.message.includes("password")) {
          toast.error("Password entry cancelled or incorrect");
        } else {
          toast.error(`Transaction failed: ${error.message}`);
        }
      } else {
        toast.error("Unknown transaction error occurred");
      }
    }
  };

  if (currentStep === "processing") {
    return <TransactionStatus hash={hash} />;
  }
  if (currentStep === "scan_method") {
    return (
      <ScanMethodSelection
        onSelectMethod={(method) => {
          setScanMethod(method);
          setCurrentStep("scanning");
        }}
        onBack={() => props.onClose?.()}
      />
    );
  }

  if (currentStep === "scanning") {
    return (
      <ScanWalletInterface
        method={scanMethod}
        onScanResult={handleScanResult}
        onBack={() => setCurrentStep("scan_method")}
      />
    );
  }

  if (currentStep === "amount_entry" && walletResult) {
    return (
      <AmountEntry
        walletResult={walletResult}
        voucherAddress={props.voucherAddress}
        onConfirm={handleAmountConfirm}
        onBack={() => {
          setCurrentStep("scanning");
          setWalletResult(null);
        }}
      />
    );
  }

  if (currentStep === "confirm" && walletResult && selectedVoucher) {
    return (
      <ConfirmTransaction
        walletResult={walletResult}
        amount={selectedAmount}
        voucherAddress={selectedVoucher}
        onConfirm={handleTransactionConfirm}
        onBack={() => setCurrentStep("amount_entry")}
        isProcessing={isPending || simulateContract.isPending}
      />
    );
  }

  // Default intro screen
  return (
    <div className={cn("space-y-6 p-4", props.className)}>
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <PaperPlaneIcon className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Request Payment</h2>
          <p className="text-gray-600">
            Scan a wallet to request voucher payment, or share your address
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => setCurrentStep("scan_method")}
          className="w-full h-12 text-lg font-semibold"
        >
          Start Request
        </Button>
      </div>
    </div>
  );
};

export function ReceiveDialog(props: ReceiveDialogProps) {
  const [type, setType] = useState<"request" | "qr">("qr");
  const { address: currentUserAddress } = useAccount();
  const ensName = useENS({ address: currentUserAddress! });
  const title = type === "qr" ? "Receive" : "Request Payment";
  const description =
    type === "qr" ? "Share your wallet address to receive vouchers" : "";
  return (
    <ResponsiveModal
      button={props.button ?? <PaperPlaneIcon className="m-1" />}
      title={title}
      description={description}
    >
      {type === "qr" ? (
        <div className="space-y-6 p-4">
          <div className="flex justify-center">
            <AddressQRCode
              address={currentUserAddress!}
              className="w-[280px] max-w-full"
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <Copyable
              text={ensName?.data?.name || ""}
              disabled={!ensName.data?.name}
            >
              <div className="space-y-2 flex flex-col ">
                <Label className="text-xs font-medium text-gray-600 mr-4">
                  ENS Name:
                </Label>
                <span className="text-sm text-gray-700">
                  {ensName?.data?.name ? ensName.data.name : "Not set"}
                </span>
              </div>
            </Copyable>
            <Copyable text={currentUserAddress!}>
              <div className="space-y-2 flex flex-col ">
                <Label className="text-xs mr-4 font-medium text-gray-600 ">
                  Address
                </Label>
                <Address
                  address={currentUserAddress}
                  disableENS={true}
                  className="font-mono text-sm text-gray-700 break-all"
                />
              </div>
            </Copyable>
          </div>
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-sm text-gray-500">OR</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => setType("request")}
              className="w-full h-12"
              variant="outline"
            >
              Request Payment from Another Wallet
            </Button>
            <p className="text-xs text-center text-gray-500">
              *Only for NFC/Paper wallets
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-0">
          <RequestForm
            voucherAddress={props.voucherAddress}
            onClose={() => setType("qr")}
          />
        </div>
      )}
    </ResponsiveModal>
  );
}
