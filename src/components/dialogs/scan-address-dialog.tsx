"use client";
import { QrCodeIcon } from "lucide-react";
import React, { useState } from "react";
import { ResponsiveModal } from "~/components/responsive-modal";
import { addressFromQRContent } from "~/utils/paper-wallet";
import { ScanAddressInterface } from "../scan/scan-address-interface";
import { ScanMethodSelection } from "../scan/scan-method-selection";
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
  const [scanMode, setScanMode] = useState<"qr" | "nfc" | undefined>();

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
      title=""
      description=""
    >
      <div className="space-y-4">
        {/* Scan Mode Selector */}
        {!scanMode && (
          <ScanMethodSelection
            onBack={() => setIsOpen(false)}
            onSelectMethod={setScanMode}
          />
        )}
        {scanMode && (
          <ScanAddressInterface
            method={scanMode}
            onScanResult={(result) => {
              const address = addressFromQRContent(result);
              onAddress(address);
              setIsOpen(false);
            }}
            onBack={() => {
              setScanMode(undefined);
            }}
          />
        )}
      </div>
    </ResponsiveModal>
  );
}

export default ScanAddressDialog;
