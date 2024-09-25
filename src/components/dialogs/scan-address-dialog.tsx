"use client";
import { QrCodeIcon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useIsMounted } from "~/hooks/useIsMounted";
import { addressFromQRContent } from "~/utils/paper-wallet";
import QrReader from "../qr-code/reader";
import { type OnResultFunction } from "../qr-code/reader/types";
import { isMediaDevicesSupported } from "../qr-code/reader/utils";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

interface ScanAddressDialogProps {
  disabled?: boolean;
  onAddress: (address: `0x${string}`) => void;
  button?: React.ReactNode;
}

const ScanAddressDialog: React.FC<ScanAddressDialogProps> = ({
  onAddress,
  button,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMounted = useIsMounted();
  const handleOnResult: OnResultFunction = (data) => {
    const result = data?.getText();
    if (!result) return;

    try {
      const address = addressFromQRContent(result);
      onAddress(address);
    } catch (error) {
      console.error("Error processing QR code result:", error);
      toast.error((error as Error).message);
    } finally {
      setIsOpen(false);
    }
  };

  if (!isMediaDevicesSupported() || !isMounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {button || (
          <Button
            disabled={disabled}
            variant="outline"
            onClick={() => setIsOpen(true)}
          >
            <QrCodeIcon />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="p-0">
        <QrReader className="overflow-clip" onResult={handleOnResult} />
      </DialogContent>
    </Dialog>
  );
};

export default ScanAddressDialog;
