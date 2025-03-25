"use client";
import { type Result } from "@zxing/library";
import { QrCodeIcon } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { useIsMounted } from "~/hooks/useIsMounted";
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
  const isMounted = useIsMounted();

  const handleOnResult = useCallback(
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
    []
  );
  if (!isMediaDevicesSupported() || !isMounted) {
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
      title="Scan QR Code"
      description="Point your camera at a QR code to scan a wallet address."
    >
      {isOpen && (
        <div className="p-0">
          <QrReader className="overflow-clip" onResult={handleOnResult} />
        </div>
      )}
    </ResponsiveModal>
  );
}

export default ScanAddressDialog;
