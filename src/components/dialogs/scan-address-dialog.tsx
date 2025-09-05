"use client";
import { type Result } from "@zxing/library";
import { NfcIcon, QrCodeIcon } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { useIsMounted } from "~/hooks/useIsMounted";
import { NfcReader } from "~/lib/nfc/nfc-reader";
import { nfcService } from "~/lib/nfc/nfc-service";
import { addressFromQRContent } from "~/utils/paper-wallet";
import { ResponsiveModal } from "../modal";
import QrReader from "../qr-code/reader";
import { isMediaDevicesSupported } from "../qr-code/reader/utils";
import { Button } from "../ui/button";

interface ScanAddressDialogProps {
  disabled?: boolean;
  onAddress: (address: `0x${string}`) => void;
  button?: React.ReactNode;
}

function ScanAddressDialog({
  onAddress,
  button,
  disabled,
}: ScanAddressDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scanMode, setScanMode] = useState<"qr" | "nfc">("qr");
  const isMounted = useIsMounted();

  const handleQRResult = useCallback(
    (result?: Result | null, _error?: Error | null) => {
      const text = result?.getText();
      if (!text) return;
      try {
        const address = addressFromQRContent(text);
        onAddress(address);
      } catch (error) {
        console.error("Error processing QR code result:", error);
        toast.error((error as Error).message);
      } finally {
        setIsOpen(false);
      }
    },
    [onAddress]
  );
  const handleNFCResult = useCallback(
    (data: string) => {
      const address = addressFromQRContent(data);
      onAddress(address);
      setIsOpen(false);
    },
    [onAddress]
  );

  if (!isMounted) {
    return null;
  }

  const hasQRSupport = isMediaDevicesSupported();
  const hasNFCSupport = nfcService.isNFCSupported();
  if (!hasQRSupport && !hasNFCSupport) {
    return null;
  }

  const defaultButton = (
    <Button
      disabled={disabled}
      variant="outline"
      onClick={() => setIsOpen(true)}
    >
      <QrCodeIcon />
    </Button>
  );

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={setIsOpen}
      button={button || defaultButton}
      title="Scan Address"
      description="Choose your scanning method to read a wallet address."
    >
      {isOpen && (
        <div className="space-y-4">
          {/* Scan Mode Selector */}
          <div className="flex gap-2">
            {hasQRSupport && (
              <Button
                variant={scanMode === "qr" ? "default" : "outline"}
                onClick={() => setScanMode("qr")}
                className="flex-1"
              >
                <QrCodeIcon className="w-4 h-4 mr-2" />
                QR Code
              </Button>
            )}
            {hasNFCSupport && (
              <Button
                variant={scanMode === "nfc" ? "default" : "outline"}
                onClick={() => setScanMode("nfc")}
                className="flex-1"
              >
                <NfcIcon className="w-4 h-4 mr-2" />
                NFC
              </Button>
            )}
          </div>

          {/* Scan Content */}
          {scanMode === "qr" && hasQRSupport && (
            <div className="p-0">
              <QrReader className="overflow-clip" onResult={handleQRResult} />
            </div>
          )}

          {scanMode === "nfc" && hasNFCSupport && (
            <NfcReader onResult={handleNFCResult} />
          )}
        </div>
      )}
    </ResponsiveModal>
  );
}

export default ScanAddressDialog;
