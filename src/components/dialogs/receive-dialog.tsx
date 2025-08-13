"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  DownloadIcon,
  PaperPlaneIcon,
  Share1Icon,
} from "@radix-ui/react-icons";
import { NfcIcon, QrCodeIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { erc20Abi, isAddress, parseGwei, parseUnits } from "viem";
import { useAccount, useSimulateContract, useWriteContract } from "wagmi";
import * as z from "zod";

import React from "react";
import { useBalance } from "~/contracts/react";
import { useDebounce } from "~/hooks/use-debounce";
import { useAuth } from "~/hooks/useAuth";
import useWebShare from "~/hooks/useWebShare";
import { useNFC } from "~/lib/nfc/use-nfc";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { PaperWallet, addressFromQRContent } from "~/utils/paper-wallet";
import { downloadSVGAsPNG, svgToPNG } from "../../utils/svg-to-png-converter";
import Address from "../address";
import { SelectVoucherField } from "../forms/fields/select-voucher-field";
import { Loading } from "../loading";
import { ResponsiveModal } from "../modal";
import { useVoucherDetails } from "../pools/hooks";
import AddressQRCode from "../qr-code/address-qr-code";
import QrReader from "../qr-code/reader";
import { isMediaDevicesSupported } from "../qr-code/reader/utils";
import { TransactionStatus } from "../transactions/transaction-status";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { VoucherSelectItem } from "../voucher/select-voucher-item";

const RequestFormSchema = z.object({
  voucherAddress: z.custom<`0x${string}`>(isAddress, "Invalid voucher address"),
  amount: z.coerce.number().positive(),
});

interface ReceiveDialogProps {
  voucherAddress?: `0x${string}`;
  button?: React.ReactNode;
}

interface ScannedWallet {
  address: `0x${string}`;
  paperWallet?: PaperWallet;
  balance?: string;
  formattedBalance?: string;
}

// Custom hook for handling temporary paper wallets
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

const RequestForm = (props: {
  voucherAddress?: `0x${string}`;
  onSuccess?: () => void;
  className?: string;
}) => {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const [showAllVouchers, setShowAllVouchers] = useState(false);
  const [scannedWallet, setScannedWallet] = useState<ScannedWallet | null>(
    null
  );
  const [scanMode, setScanMode] = useState<"qr" | "nfc" | null>(null);

  const { data: allVouchers } = trpc.voucher.list.useQuery({}, {});
  const { data: myVouchers } = trpc.me.vouchers.useQuery(undefined, {
    enabled: Boolean(auth?.session?.address),
  });

  const { address: currentUserAddress } = useAccount();
  const {
    nfcStatus,
    readData,
    error: nfcError,
    startReading,
    stopReading,
    clearData,
  } = useNFC();
  const { createPaperWallet, clearStorage } = useTempPaperWallet();

  const defaultVoucherAddress =
    props.voucherAddress ??
    (auth?.user?.default_voucher as `0x${string}` | undefined);

  const form = useForm<
    z.input<typeof RequestFormSchema>,
    unknown,
    z.output<typeof RequestFormSchema>
  >({
    resolver: zodResolver(RequestFormSchema),
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
  const amount = form.watch("amount");
  const debouncedAmount = useDebounce(amount, 500);

  const { data: voucherDetails } = useVoucherDetails(voucherAddress);

  // Get scanned wallet balance in selected token
  const scannedWalletBalance = useBalance({
    address: scannedWallet?.address,
    token: voucherAddress,
  });

  // Transaction simulation for sending from scanned wallet to current user
  const simulateContract = useSimulateContract({
    address: voucherAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: currentUserAddress
      ? [
          currentUserAddress,
          parseUnits(
            debouncedAmount?.toString() ?? "",
            voucherDetails?.decimals ?? 0
          ),
        ]
      : undefined,
    query: {
      enabled: Boolean(
        scannedWallet?.paperWallet &&
          debouncedAmount &&
          currentUserAddress &&
          voucherAddress &&
          voucherDetails?.decimals &&
          debouncedAmount > 0
      ),
    },
    gas: 350_000n,
    maxFeePerGas: parseGwei("27"),
    maxPriorityFeePerGas: 5n,
  });

  const { data: hash, writeContractAsync, isPending } = useWriteContract();

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

  const handleScannedData = useCallback(
    (data: string) => {
      if (!data || typeof data !== "string" || data.trim().length === 0) {
        toast.error("No valid data received from scan");
        return;
      }

      try {
        // Security check: prevent scanning of current user's own wallet
        if (
          currentUserAddress &&
          data.toLowerCase().includes(currentUserAddress.toLowerCase())
        ) {
          toast.error("Cannot scan your own wallet");
          return;
        }

        // Try to parse as paper wallet first
        let address: `0x${string}`;
        let paperWallet: PaperWallet | undefined;

        try {
          paperWallet = createPaperWallet(data);
          address = paperWallet.getAddress();
        } catch (walletError) {
          // If not a paper wallet, try to extract address directly
          try {
            address = addressFromQRContent(data);
          } catch (addressError) {
            console.error("Failed to parse wallet data:", {
              walletError,
              addressError,
            });
            toast.error("Invalid wallet QR code or NFC data format");
            return;
          }
        }

        // Validate the extracted address
        if (!isAddress(address)) {
          toast.error("Invalid wallet address format");
          return;
        }

        // Security check: prevent scanning the same wallet as current user
        if (
          currentUserAddress &&
          address.toLowerCase() === currentUserAddress.toLowerCase()
        ) {
          toast.error("Cannot scan your own wallet address");
          return;
        }

        // Additional security: check for zero address
        if (address === "0x0000000000000000000000000000000000000000") {
          toast.error("Cannot scan zero address");
          return;
        }

        setScannedWallet({
          address,
          paperWallet,
        });
      } catch (error) {
        console.error("Error processing scanned data:", error);
        toast.error("Failed to process scanned wallet data");
      }
    },
    [currentUserAddress, createPaperWallet]
  );

  // Handle NFC read data
  useEffect(() => {
    if (readData) {
      handleScannedData(readData);
      // Clear data after processing to prevent re-processing
      setTimeout(() => clearData(), 100);
    }
  }, [readData, clearData, handleScannedData]);

  // Handle NFC errors
  useEffect(() => {
    if (nfcError) {
      toast.error(nfcError);
    }
  }, [nfcError]);

  // Auto-start NFC scanning when NFC mode is selected
  useEffect(() => {
    if (
      scanMode === "nfc" &&
      nfcStatus.isSupported &&
      !nfcStatus.isReading &&
      !readData &&
      !scannedWallet
    ) {
      void startReading();
    }
  }, [
    scanMode,
    nfcStatus.isSupported,
    nfcStatus.isReading,
    readData,
    startReading,
    scannedWallet,
  ]);

  // Stop NFC scanning when tab switches
  useEffect(() => {
    if (scanMode !== "nfc" && nfcStatus.isReading) {
      void stopReading();
      clearData();
    }
  }, [scanMode, nfcStatus.isReading, stopReading, clearData]);

  const handleQRResult = (result: unknown, error: unknown) => {
    if (error) {
      // Filter out common scanning errors that are expected during continuous scanning
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "Unknown error";

      // Only show user-facing errors, not technical scanning errors
      if (
        !errorMessage.includes("ChecksumException") &&
        !errorMessage.includes("FormatException") &&
        !errorMessage.includes("NotFoundException")
      ) {
        console.warn("QR Reader error:", errorMessage);
        toast.error("QR scan error: " + errorMessage);
      }
      console.log("still ticking", result);
      return;
    }

    if (
      result &&
      typeof result === "object" &&
      result !== null &&
      "text" in result &&
      typeof result.text === "string"
    ) {
      handleScannedData(result.text);
    }
  };

  const handleSubmit = async () => {
    if (!scannedWallet?.paperWallet) {
      toast.error("No paper wallet available for transaction");
      return;
    }

    if (!simulateContract.data?.request) {
      toast.error("Transaction simulation failed - cannot proceed");
      return;
    }

    try {
      // Get the account from the paper wallet
      const account = await scannedWallet.paperWallet.getAccount();

      if (!account || !account.address) {
        toast.error("Failed to access paper wallet account");
        return;
      }

      // Security check: verify the account address matches the scanned wallet
      if (
        account.address.toLowerCase() !== scannedWallet.address.toLowerCase()
      ) {
        toast.error("Security error: wallet address mismatch");
        return;
      }

      // Create the transaction request with the paper wallet account
      const txRequest = {
        ...simulateContract.data.request,
        account,
      };

      await writeContractAsync(txRequest);

      // Clear temporary storage and reset form
      try {
        clearData();
        clearStorage();
      } catch (error) {
        console.warn("Error clearing temporary data:", error);
      }

      form.reset();
      setScannedWallet(null);

      // Wait for transaction to propagate before invalidating queries
      setTimeout(() => {
        void utils.me.events.invalidate();
        void utils.me.vouchers.invalidate();
        void utils.me.get.invalidate();
      }, 2000);

      props.onSuccess?.();
    } catch (error) {
      console.error("Transaction error:", error);

      // More specific error handling
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

  const maxBalance = scannedWalletBalance.data?.formattedNumber || "0";

  if (hash) {
    return <TransactionStatus hash={hash} />;
  }

  if (!scannedWallet) {
    // Show scanning interface when scan mode is selected
    if (scanMode) {
      return (
        <div className={cn("space-y-4", props.className)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              {scanMode === "qr" ? "Scan QR Code" : "Scan NFC Card"}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScanMode(null)}
            >
              Back to Form
            </Button>
          </div>

          {scanMode === "qr" && (
            <>
              {isMediaDevicesSupported() ? (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      Point your camera at a paper wallet QR code
                    </p>
                    <p className="text-xs text-gray-500">
                      Hold steady for best results. Scanning errors are normal
                      during focusing.
                    </p>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                    <QrReader
                      className="w-full h-64"
                      onResult={handleQRResult}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Camera not supported on this device
                </p>
              )}
            </>
          )}

          {scanMode === "nfc" && (
            <div className="p-4 text-center space-y-4 min-h-[40vh]">
              <div className="text-sm text-muted-foreground">
                {nfcStatus.message}
              </div>
              <div className="space-y-2">
                <div className="flex justify-center">
                  <NfcIcon
                    className={`w-8 h-8 ${
                      nfcStatus.isReading
                        ? "animate-pulse text-blue-500"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                {nfcStatus.isReading ? (
                  <>
                    <p className="text-sm">
                      Hold your device near an NFC card...
                    </p>
                    <Button
                      variant="outline"
                      onClick={stopReading}
                      className="w-full"
                    >
                      Stop Reading
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {nfcStatus.isSupported
                      ? "Ready to scan NFC cards"
                      : "NFC not supported"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Show form when no scan mode is selected
    return (
      <div className={cn("space-y-6", props.className)}>
        <Form {...form}>
          <div className="space-y-4">
            {/* Voucher Selection */}
            <div className="flex flex-col gap-2">
              <SelectVoucherField
                form={form}
                name="voucherAddress"
                label="Voucher"
                placeholder="Select voucher"
                className="flex-grow"
                getFormValue={(v) => v.voucher_address}
                searchableValue={(x) => `${x.symbol} ${x.voucher_name}`}
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

            {/* Amount Input */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to Request</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Amount"
                      {...field}
                      type="number"
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  {voucherDetails && (
                    <p className="text-xs text-gray-500 mt-1">
                      Amount in {voucherDetails.symbol}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scanning Options */}
            <div>
              <Label className="text-sm font-medium">Scan Wallet</Label>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Fill out the form above, then click a button below to scan a
                paper wallet
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setScanMode("qr")}
                  disabled={!isValid || !isMediaDevicesSupported()}
                  className="flex items-center gap-2 py-3"
                >
                  <QrCodeIcon className="w-4 h-4" />
                  <span className="text-sm">Scan QR Code</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setScanMode("nfc")}
                  disabled={!isValid || !nfcStatus.isSupported}
                  className="flex items-center gap-2 py-3"
                >
                  <NfcIcon className="w-4 h-4" />
                  <span className="text-sm">Scan NFC</span>
                </Button>
              </div>

              {!isValid && (
                <p className="text-xs text-amber-600 mt-2">
                  Please complete the form above to enable scanning
                </p>
              )}
            </div>
          </div>
        </Form>
      </div>
    );
  }

  // Transaction Summary
  return (
    <Form {...form}>
      <div className={cn("space-y-4 max-w-full", props.className)}>
        <Card className="border border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <PaperPlaneIcon className="w-3 h-3 text-white" />
              </div>
              Transaction Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {/* Transaction Flow - Compact */}
            <div className="flex items-center justify-between gap-1 overflow-hidden">
              <div className="flex flex-col items-center space-y-1 flex-1 min-w-0 max-w-[40%] overflow-hidden">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center border border-orange-200">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
                <Label className="text-xs text-gray-600 uppercase tracking-wide whitespace-nowrap">
                  From
                </Label>
                <div className="w-full overflow-hidden">
                  <Address
                    forceTruncate
                    address={scannedWallet.address}
                    className="text-xs text-gray-700 font-mono block w-full text-center min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                  />
                </div>
              </div>

              <div className="flex-shrink-0">
                <PaperPlaneIcon className="w-4 h-4 text-blue-500" />
              </div>

              <div className="flex flex-col items-center space-y-1 flex-1 min-w-0 max-w-[40%] overflow-hidden">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <Label className="text-xs text-gray-600 uppercase tracking-wide whitespace-nowrap">
                  To You
                </Label>
                <div className="w-full overflow-hidden">
                  <Address
                    forceTruncate
                    address={currentUserAddress}
                    className="text-xs text-gray-700 font-mono block w-full text-center min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                  />
                </div>
              </div>
            </div>

            {/* Transaction Details - Single Column for Mobile */}
            <div className="space-y-3">
              {/* Amount to Receive */}
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <Label className="text-xs font-medium text-green-800 uppercase tracking-wide block mb-1">
                  Amount to Receive
                </Label>
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            value={field.value ?? ""}
                            className="text-xl font-bold text-green-700 bg-transparent border-none p-0 h-auto shadow-none focus-visible:ring-0"
                            placeholder="0"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <p className="text-sm font-medium text-green-600">
                    {voucherDetails?.symbol}
                  </p>
                </div>
              </div>

              {/* Available Balance */}
              {scannedWalletBalance.data && voucherDetails && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <Label className="text-xs font-medium text-blue-800 uppercase tracking-wide block mb-1">
                    Available Balance
                  </Label>
                  <div className="flex items-baseline gap-1">
                    <p className="text-xl font-bold text-blue-700">
                      {scannedWalletBalance.data.formatted}
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                      {voucherDetails.symbol}
                    </p>
                  </div>
                  {parseFloat(String(amount) || "0") >
                    parseFloat(scannedWalletBalance.data.formatted) && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      ⚠️ Insufficient funds
                    </p>
                  )}
                </div>
              )}

              {/* Voucher Info - Compact */}
              {voucherDetails && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <Label className="text-xs font-medium text-gray-700 uppercase tracking-wide block mb-2">
                    Voucher
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">
                        {voucherDetails.symbol?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {voucherDetails.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {voucherDetails.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Display - Compact */}
            {simulateContract.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs font-medium text-red-800 block mb-1">
                      Error
                    </Label>
                    <p className="text-xs text-red-700">
                      {(() => {
                        const error = simulateContract.error as {
                          shortMessage?: string;
                          message?: string;
                        };
                        // Handle specific error cases
                        if (error.message?.includes("insufficient funds"))
                          return "Insufficient funds in scanned wallet";
                        if (
                          error.message?.includes(
                            "gas required exceeds allowance"
                          )
                        )
                          return "Transaction would exceed gas limits";
                        // Return shortMessage if available, otherwise fallback to a user-friendly message
                        return (
                          error.shortMessage ??
                          "Unable to process transaction. Please verify your inputs and try again"
                        );
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons - Compact */}
            {scannedWallet.paperWallet && (
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setScannedWallet(null);
                    form.reset();
                  }}
                  className="flex-1 py-2 text-sm font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !amount ||
                    amount <= 0 ||
                    amount > parseFloat(maxBalance.toString()) ||
                    isPending ||
                    !simulateContract.data?.request
                  }
                  className="flex-1 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
                >
                  {isPending || simulateContract.isLoading ? (
                    <div className="flex items-center gap-1">
                      <Loading />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <PaperPlaneIcon className="w-3 h-3" />
                      <span>Execute</span>
                    </div>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Form>
  );
};

const ShowQRForm = (props: { className?: string }) => {
  const { address: currentUserAddress } = useAccount();
  const { share, isSupported } = useWebShare();

  const handleShare = () => {
    svgToPNG(
      document.getElementById("addressQRCodeId") as unknown as SVGSVGElement,
      "address.png"
    )
      .then((file) => {
        const filesArray = [file];
        const shareData = {
          title: "My Sarafu Address",
          text: currentUserAddress!,
          files: filesArray,
        };
        share(shareData);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className={cn("flex flex-col space-y-4", props.className)}>
      <Address
        address={currentUserAddress}
        className="text-center break-all text-md font-semibold text-gray-700"
      />
      <AddressQRCode
        id="addressQRCodeId"
        size={256}
        className="mx-auto"
        address={currentUserAddress ?? ""}
      />

      <div className="flex m-2 py-4 justify-evenly">
        {isSupported && (
          <Button variant="outline" onClick={handleShare}>
            <Share1Icon className="mr-2" />
            Share
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => {
            downloadSVGAsPNG(
              document.getElementById(
                "addressQRCodeId"
              ) as unknown as SVGSVGElement,
              "address.png"
            ).catch((error) => {
              console.error(error);
            });
          }}
        >
          <DownloadIcon className="mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
};

export const ReceiveDialog = (props: ReceiveDialogProps) => {
  const [mode, setMode] = useState<"qr_code" | "request">("request");

  return (
    <ResponsiveModal
      button={props.button ?? <PaperPlaneIcon className="m-1" />}
      title="Receive Voucher"
    >
      <Tabs
        value={mode}
        onValueChange={(value) => setMode(value as "qr_code" | "request")}
      >
        <TabsList className="grid w-full grid-cols-2 mt-4">
          <TabsTrigger value="request">Request Payment</TabsTrigger>
          <TabsTrigger value="qr_code">Show QR Code</TabsTrigger>
        </TabsList>

        {/* QR Code Mode */}
        <TabsContent value="qr_code">
          <ShowQRForm className="px-4 mt-4" />
        </TabsContent>

        {/* Request Payment Mode */}
        <TabsContent value="request">
          <RequestForm
            className="px-4 mt-4"
            voucherAddress={props.voucherAddress}
          />
        </TabsContent>
      </Tabs>
    </ResponsiveModal>
  );
};
