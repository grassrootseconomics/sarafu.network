"use client";
import { ChevronLeftIcon, Scan } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { Address, isAddress } from "viem";
import { NfcReader } from "~/lib/nfc/nfc-reader";
import { addressFromQRContent } from "~/utils/paper-wallet";
import QrReader from "../qr-code/reader";
import { Button } from "../ui/button";

export function ScanAddressInterface(props: {
  method: "qr" | "nfc";
  onScanResult: (data: Address) => void;
  onBack: () => void;
}) {
  const { method, onScanResult, onBack } = props;

  const handleScannedData = useCallback(
    (data: string) => {
      if (!data || typeof data !== "string" || data.trim().length === 0) {
        toast.error("No valid data received from scan");
        return;
      }
      try {
        let address: `0x${string}`;
        try {
          address = addressFromQRContent(data);
        } catch {
          return;
        }

        if (!isAddress(address)) {
          toast.error("Invalid wallet address format");
          return;
        }

        if (address === "0x0000000000000000000000000000000000000000") {
          toast.error("Cannot scan zero address");
          return;
        }

        onScanResult(address);
      } catch (error) {
        console.error("Error processing scanned data:", error);
        toast.error("Failed to process scanned wallet data");
      }
    },
    [onScanResult]
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
      handleScannedData(result.text);
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
            Point your camera at the QR code
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

      <NfcReader onResult={(data) => handleScannedData(data)} />
    </div>
  );
}
