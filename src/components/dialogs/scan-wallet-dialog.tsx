"use client";

import { QrCodeIcon, Smartphone, CreditCard } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { isAddress, parseUnits } from "viem";
import { useAccount, useSimulateContract, useWriteContract } from "wagmi";
import { erc20Abi } from "viem";
import { PaperWallet, addressFromQRContent } from "~/utils/paper-wallet";
import { useBalance } from "~/contracts/react";
import { useAuth } from "~/hooks/useAuth";
import { trpc } from "~/lib/trpc";
import { useNFC } from "~/lib/nfc/use-nfc";
import { useVoucherDetails } from "../pools/hooks";
import QrReader from "../qr-code/reader";
import { type OnResultFunction } from "../qr-code/reader/types";
import { isMediaDevicesSupported } from "../qr-code/reader/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ResponsiveModal } from "../modal";
import { Loading } from "../loading";
import Address from "../address";
import { NFCErrorBoundary } from "../error-boundaries";

interface ScannedWallet {
  address: `0x${string}`;
  paperWallet?: PaperWallet;
  balance?: string;
  formattedBalance?: string;
}

interface ScanWalletDialogProps {
  button?: React.ReactNode;
}

const ScanWalletDialog = ({ button }: ScanWalletDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("qr");
  const [scannedWallet, setScannedWallet] = useState<ScannedWallet | null>(null);
  const [amount, setAmount] = useState("");

  const auth = useAuth();
  const { address: currentUserAddress } = useAccount();
  const utils = trpc.useUtils();
  const { nfcStatus, readData, error: nfcError, startReading, clearData } = useNFC();

  // Get current user's default voucher
  const defaultVoucherAddress = auth?.user?.default_voucher as `0x${string}` | undefined;
  const { data: voucherDetails } = useVoucherDetails(defaultVoucherAddress);

  // Get scanned wallet balance in the current user's default voucher
  const scannedWalletBalance = useBalance({
    address: scannedWallet?.address,
    token: defaultVoucherAddress!,
  });

  // Transaction simulation for sending from scanned wallet to current user
  const simulateContract = useSimulateContract({
    address: defaultVoucherAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: currentUserAddress ? [
      currentUserAddress,
      parseUnits(amount || "0", voucherDetails?.decimals ?? 0),
    ] : undefined,
    query: {
      enabled: Boolean(
        scannedWallet?.paperWallet &&
        amount &&
        currentUserAddress &&
        defaultVoucherAddress &&
        voucherDetails?.decimals
      ),
    },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const handleScannedData = useCallback((data: string) => {
    // Validate input data
    if (!data || typeof data !== 'string' || data.trim().length === 0) {
      toast.error("No valid data received from scan");
      return;
    }

    try {

      // Security check: prevent scanning of current user's own wallet
      if (currentUserAddress && data.toLowerCase().includes(currentUserAddress.toLowerCase())) {
        toast.error("Cannot scan your own wallet");
        return;
      }

      // Try to parse as paper wallet first
      let address: `0x${string}`;
      let paperWallet: PaperWallet | undefined;

      try {
        paperWallet = new PaperWallet(data);
        address = paperWallet.getAddress();
      } catch (walletError) {
        // If not a paper wallet, try to extract address directly
        try {
          address = addressFromQRContent(data);
        } catch (addressError) {
          console.error("Failed to parse wallet data:", { walletError, addressError });
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
      if (currentUserAddress && address.toLowerCase() === currentUserAddress.toLowerCase()) {
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

      toast.success("Wallet scanned successfully!");
    } catch (error) {
      console.error("Error processing scanned data:", error);
      toast.error("Failed to process scanned wallet data");
    }
  }, [currentUserAddress]);

  // Handle NFC read data
  useEffect(() => {
    if (readData) {
      handleScannedData(readData);
      clearData(); // Clear the data after processing
    }
  }, [readData, clearData, handleScannedData]);

  // Handle NFC errors
  useEffect(() => {
    if (nfcError) {
      toast.error(nfcError);
    }
  }, [nfcError]);

  const handleQRResult: OnResultFunction = (data, error) => {
    if (error) {
      toast.error(error.message);
      return;
    }

    if (data && data.getText()) {
      handleScannedData(data.getText());
    }
  };

  const handleNFCScan = async () => {
    if (!nfcStatus.isSupported) {
      toast.error("NFC is not supported on this device");
      return;
    }

    try {
      await startReading();
    } catch (error) {
      console.error("NFC scan error:", error);
      toast.error("Failed to start NFC scanning");
    }
  };

  const handleSendTransaction = async () => {
    // Comprehensive validation checks
    if (!scannedWallet?.paperWallet) {
      toast.error("No paper wallet available for transaction");
      return;
    }

    if (!simulateContract.data?.request) {
      toast.error("Transaction simulation failed - cannot proceed");
      return;
    }

    if (!currentUserAddress) {
      toast.error("No recipient address - please connect your wallet");
      return;
    }

    if (!defaultVoucherAddress) {
      toast.error("No default voucher configured");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > parseFloat(maxBalance.toString())) {
      toast.error("Amount exceeds available balance");
      return;
    }

    try {
      // Get the account from the paper wallet with proper error handling
      const account = await scannedWallet.paperWallet.getAccount();
      
      if (!account || !account.address) {
        toast.error("Failed to access paper wallet account");
        return;
      }

      // Security check: verify the account address matches the scanned wallet
      if (account.address.toLowerCase() !== scannedWallet.address.toLowerCase()) {
        toast.error("Security error: wallet address mismatch");
        return;
      }

      // Create the transaction request with the paper wallet account
      const txRequest = {
        ...simulateContract.data.request,
        account,
      };

      // Additional validation on the transaction request
      if (!txRequest.args || txRequest.args.length !== 2) {
        toast.error("Invalid transaction parameters");
        return;
      }

      const [recipient, transferAmount] = txRequest.args as [string, bigint];
      
      // Verify recipient is the current user
      if (recipient.toLowerCase() !== currentUserAddress.toLowerCase()) {
        toast.error("Security error: recipient address mismatch");
        return;
      }

      // Verify transfer amount matches input
      const expectedAmount = parseUnits(amount, voucherDetails?.decimals ?? 0);
      if (transferAmount !== expectedAmount) {
        toast.error("Security error: amount mismatch");
        return;
      }

      await writeContractAsync(txRequest);
      
      toast.success("Transaction sent successfully!");
      
      // Reset form and close dialog
      setScannedWallet(null);
      setAmount("");
      setIsOpen(false);
      
      // Invalidate queries to refresh balances
      void utils.me.events.invalidate();
      void utils.me.vouchers.invalidate();
      
    } catch (error) {
      console.error("Transaction error:", error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes("insufficient funds")) {
          toast.error("Insufficient funds in scanned wallet");
        } else if (error.message.includes("user rejected")) {
          toast.error("Transaction was cancelled");
        } else if (error.message.includes("nonce")) {
          toast.error("Transaction nonce error - please try again");
        } else {
          toast.error(`Transaction failed: ${error.message}`);
        }
      } else {
        toast.error("Unknown transaction error occurred");
      }
    }
  };

  const maxBalance = scannedWalletBalance.data?.formattedNumber || "0";

  return (
    <ResponsiveModal
      button={
        button ?? (
          <Button variant="outline">
            <QrCodeIcon className="w-4 h-4 mr-2" />
            Scan Wallet
          </Button>
        )
      }
      title="Scan Paper Wallet"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="p-4 space-y-4">
        {!scannedWallet ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="qr" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                QR Code
              </TabsTrigger>
              <TabsTrigger 
                value="nfc" 
                disabled={!nfcStatus.isSupported}
                className="flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                NFC
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qr" className="mt-4">
              {isMediaDevicesSupported() ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">
                    Point your camera at a paper wallet QR code
                  </p>
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
            </TabsContent>

            <TabsContent value="nfc" className="mt-4">
              <NFCErrorBoundary
                onError={(error, errorInfo) => {
                  console.error("NFC Error in ScanWalletDialog:", error, errorInfo);
                  toast.error("NFC operation failed. Please try again or use QR code scanning.");
                }}
              >
                <div className="space-y-4 text-center">
                  <p className="text-sm text-gray-600">
                    {nfcStatus.message}
                  </p>
                  <Button
                    onClick={handleNFCScan}
                    disabled={nfcStatus.isReading || !nfcStatus.isSupported}
                    className="w-full"
                  >
                    {nfcStatus.isReading ? (
                      <>
                        <Loading />
                        Scanning NFC...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Start NFC Scan
                      </>
                    )}
                  </Button>
                  {!nfcStatus.isSupported && (
                    <p className="text-sm text-red-500">
                      NFC is not supported on this device
                    </p>
                  )}
                </div>
              </NFCErrorBoundary>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scanned Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <Address 
                    address={scannedWallet.address}
                    className="text-sm break-all mt-1"
                  />
                </div>
                
                {scannedWalletBalance.data && voucherDetails && (
                  <div>
                    <Label className="text-sm font-medium">
                      Balance ({voucherDetails.symbol})
                    </Label>
                    <p className="text-lg font-semibold mt-1">
                      {scannedWalletBalance.data.formatted} {voucherDetails.symbol}
                    </p>
                  </div>
                )}

                {scannedWallet.paperWallet && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium">Send to Your Account</h3>
                    
                    <div>
                      <Label htmlFor="amount">Amount to Send</Label>
                      <div className="relative mt-1">
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          max={maxBalance}
                          step="0.01"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-8 text-xs"
                          onClick={() => setAmount(maxBalance.toString())}
                        >
                          MAX
                        </Button>
                      </div>
                      {voucherDetails && (
                        <p className="text-xs text-gray-500 mt-1">
                          Available: {maxBalance.toString()} {voucherDetails.symbol}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setScannedWallet(null);
                          setAmount("");
                        }}
                        className="flex-1"
                      >
                        Scan Another
                      </Button>
                      <Button
                        onClick={handleSendTransaction}
                        disabled={
                          !amount || 
                          parseFloat(amount) <= 0 || 
                          parseFloat(amount) > parseFloat(maxBalance.toString()) ||
                          isPending ||
                          !simulateContract.data?.request
                        }
                        className="flex-1"
                      >
                        {isPending ? <Loading /> : "Send"}
                      </Button>
                    </div>

                    {simulateContract.error && (
                      <p className="text-sm text-red-500 mt-2">
                        {simulateContract.error.message}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
};

export default ScanWalletDialog;