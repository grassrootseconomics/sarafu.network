"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircledIcon,
  ChevronLeftIcon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";
import { NfcIcon, QrCodeIcon, Scan, Smartphone } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { erc20Abi, isAddress, parseGwei, parseUnits } from "viem";
import { useAccount, useSimulateContract, useWriteContract } from "wagmi";
import { z } from "zod";

import React from "react";
import { useBalance } from "~/contracts/react";
import { useDebounce } from "~/hooks/use-debounce";
import { NfcReader } from "~/lib/nfc/nfc-reader";
import { nfcService } from "~/lib/nfc/nfc-service";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { PaperWallet } from "~/utils/paper-wallet";
import Address from "../address";
import { SelectVoucherField } from "../forms/fields/select-voucher-field";
import { Loading } from "../loading";
import { ResponsiveModal } from "../modal";
import { useVoucherDetails } from "../pools/hooks";
import QrReader from "../qr-code/reader";
import { isMediaDevicesSupported } from "../qr-code/reader/utils";
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

interface WalletScanResult {
  address: `0x${string}`;
  paperWallet?: PaperWallet;
  scanMethod: "qr" | "nfc";
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

function useTempPaperWallet() {
  const tempStorage = useMemo(() => {
    const storage = new Map<string, string>();
    return {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      },
      length: storage.size,
      key: (index: number) => Array.from(storage.keys())[index] ?? null,
    } as Storage;
  }, []);

  const createPaperWallet = useCallback(
    (data: string): PaperWallet => {
      return new PaperWallet(data, tempStorage);
    },
    [tempStorage]
  );

  const clearStorage = useCallback(() => {
    tempStorage.clear();
  }, [tempStorage]);

  return { createPaperWallet, clearStorage };
}

function ScanMethodSelection(props: {
  onSelectMethod: (method: "qr" | "nfc") => void;
  onBack: () => void;
}) {
  const isNFCSupported = nfcService.isNFCSupported();
  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Scan Wallet</h2>
        <p className="text-sm text-gray-600">
          Choose how you want to scan the wallet
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => props.onSelectMethod("qr")}
          disabled={!isMediaDevicesSupported()}
          className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200"
          variant="outline"
        >
          <QrCodeIcon className="w-8 h-8" />
          <div className="text-center">
            <div className="font-semibold">QR Code</div>
            <div className="text-xs text-blue-600">Camera scan</div>
          </div>
        </Button>

        <Button
          onClick={() => props.onSelectMethod("nfc")}
          disabled={!isNFCSupported}
          className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200"
          variant="outline"
        >
          <NfcIcon className="w-8 h-8" />
          <div className="text-center">
            <div className="font-semibold">NFC Card</div>
            <div className="text-xs text-purple-600">Tap to scan</div>
          </div>
        </Button>

        {(!isMediaDevicesSupported() || !isNFCSupported) && (
          <div className="text-xs text-gray-500 text-center mt-4">
            {!isMediaDevicesSupported() && "Camera not available. "}
            {!isNFCSupported && "NFC not supported. "}
          </div>
        )}
      </div>

      <Button variant="outline" onClick={props.onBack} className="w-full mt-6">
        <ChevronLeftIcon className="w-4 h-4 mr-2" />
        Back
      </Button>
    </div>
  );
}

function ScanningInterface(props: {
  method: "qr" | "nfc";
  onScanResult: (result: WalletScanResult) => void;
  onBack: () => void;
}) {
  const { method, onScanResult, onBack } = props;
  const { createPaperWallet } = useTempPaperWallet();
  const { address: currentUserAddress } = useAccount();

  const handleScannedData = useCallback(
    (data: string, scanMethod: "qr" | "nfc") => {
      if (!data || typeof data !== "string" || data.trim().length === 0) {
        toast.error("No valid data received from scan");
        return;
      }

      try {
        if (
          currentUserAddress &&
          data.toLowerCase().includes(currentUserAddress.toLowerCase())
        ) {
          toast.error("Cannot scan your own wallet");
          return;
        }

        let address: `0x${string}`;
        let paperWallet: PaperWallet | undefined;

        try {
          paperWallet = createPaperWallet(data);
          address = paperWallet.getAddress();
        } catch {
          return;
        }

        if (!isAddress(address)) {
          toast.error("Invalid wallet address format");
          return;
        }

        if (
          currentUserAddress &&
          address.toLowerCase() === currentUserAddress.toLowerCase()
        ) {
          toast.error("Cannot scan your own wallet address");
          return;
        }

        if (address === "0x0000000000000000000000000000000000000000") {
          toast.error("Cannot scan zero address");
          return;
        }

        onScanResult({
          address,
          paperWallet,
          scanMethod,
        });
      } catch (error) {
        console.error("Error processing scanned data:", error);
        toast.error("Failed to process scanned wallet data");
      }
    },
    [currentUserAddress, createPaperWallet, onScanResult]
  );

  const handleQRResult = (result: unknown, error: unknown) => {
    if (error) {
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "Unknown error";

      if (
        !errorMessage.includes("ChecksumException") &&
        !errorMessage.includes("FormatException") &&
        !errorMessage.includes("NotFoundException")
      ) {
        console.warn("QR Reader error:", errorMessage);
      }
      return;
    }

    if (
      result &&
      typeof result === "object" &&
      result !== null &&
      "text" in result &&
      typeof result.text === "string"
    ) {
      handleScannedData(result.text, "qr");
    }
  };

  if (method === "qr") {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Scan QR Code</h2>
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>

        <div className="text-center space-y-2 mb-4">
          <p className="text-sm text-gray-600">
            Point your camera at the Paper Wallet QR code
          </p>
        </div>

        <div className="relative bg-black rounded-2xl overflow-hidden aspect-square max-w-sm mx-auto">
          <QrReader className="w-full h-full" onResult={handleQRResult} />
          <div className="absolute inset-0 border-4 border-white/20 rounded-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-lg pointer-events-none" />
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-full text-sm text-blue-700">
            <Scan className="w-4 h-4 animate-pulse" />
            Scanning...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Scan NFC Card</h2>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>

      <NfcReader onResult={(data) => handleScannedData(data, "nfc")} />
    </div>
  );
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
}) => {
  const utils = trpc.useUtils();
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
    query: {
      enabled: isSimulateEnabled,
    },
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

      await writeContractAsync(txRequest);

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
        onBack={() => setCurrentStep("scan_method")}
      />
    );
  }

  if (currentStep === "scanning") {
    return (
      <ScanningInterface
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
  return (
    <ResponsiveModal
      button={props.button ?? <PaperPlaneIcon className="m-1" />}
      title=""
    >
      <div className="mt-4">
        <RequestForm voucherAddress={props.voucherAddress} />
      </div>
    </ResponsiveModal>
  );
}
