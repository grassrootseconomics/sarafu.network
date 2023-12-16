import { QrCodeIcon } from "lucide-react";
import { useState } from "react";
import { getAddress, isAddress } from "viem";
import { parseEthUrl } from "~/lib/eth-url-parser";
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

const ScanAddressDialog = ({
  onAddress,
  button,
  disabled,
}: ScanAddressDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOnResult: OnResultFunction = (data) => {
    try {
      const result = data?.getText();
      if (!result) return;
      if (isAddress(result)) {
        onAddress(getAddress(result));
      } else {
        onAddress(getAddress(parseEthUrl(result).target_address));
      }
    } finally {
      setIsOpen(false); // close the dialog
    }
  };
  if (isMediaDevicesSupported() === false) return null;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {button ?? (
          <Button
            disabled={disabled}
            variant={"outline"}
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
