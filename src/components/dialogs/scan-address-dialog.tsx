import { QrCodeIcon } from "lucide-react";
import React, { useState } from "react";
import { getAddress, isAddress } from "viem";
import { parseEthUrl } from "~/lib/eth-url-parser";
import QrReader from "../qr-code/reader";
import { type OnResultFunction } from "../qr-code/reader/types";
import { isMediaDevicesSupported } from "../qr-code/reader/utils";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { useToast } from "../ui/use-toast";

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
  const toast = useToast();
  const tryParseEthUrl = (result: string) => {
    try {
      const ethUrlResult = parseEthUrl(result);
      if (ethUrlResult && ethUrlResult.target_address) {
        return getAddress(ethUrlResult.target_address);
      }
    } catch (error) {
      console.error("Error parsing ETH URL:", error);
    }
    return undefined;
  };
  const tryParseJson = (result: string) => {
    try {
      const jsonResult = JSON.parse(result) as { address?: string };
      if (jsonResult.address && isAddress(jsonResult.address)) {
        return getAddress(jsonResult.address);
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
    return undefined;
  };
  const tryParseAddress = (result: string) => {
    try {
      if (isAddress(result)) {
        return getAddress(result);
      }
    } catch (error) {
      console.error("Error parsing address:", error);
    }
    return undefined;
  };
  const handleOnResult: OnResultFunction = (data) => {
    const result = data?.getText();
    if (!result) return;

    try {
      let address: `0x${string}` | undefined;
      address = tryParseEthUrl(result);
      if (!address) {
        address = tryParseJson(result);
      }
      if (!address) {
        address = tryParseAddress(result);
      }
      if (address) {
        onAddress(address);
      } else {
        throw new Error("Invalid address");
      }
    } catch (error) {
      console.error("Error processing QR code result:", error);
      toast.toast({
        title: "Error",
        description: (error as Error).message,
        type: "foreground",
        variant: "destructive",
      });
    } finally {
      setIsOpen(false);
    }
  };

  if (!isMediaDevicesSupported()) {
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
