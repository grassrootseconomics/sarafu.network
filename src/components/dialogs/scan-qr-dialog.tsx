import { QrCodeIcon } from "lucide-react";
import { useState } from "react";
import QrReader from "../qr-code/reader";
import { type OnResultFunction } from "../qr-code/reader/types";
import { isMediaDevicesSupported } from "../qr-code/reader/utils";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { toast } from "sonner";

interface ScanQRDialogProps {
  onScan: (text: string) => void;
  button?: React.ReactNode;
}

const ScanQRDialog = ({ onScan, button }: ScanQRDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOnResult: OnResultFunction = (data, error) => {
    if (data && data.getText()) {
      onScan(data.getText());
      setIsOpen(false); // close the dialog
    }
    if (error) {
      toast.error( error.message);
      onScan("");
    }
  };
  if (isMediaDevicesSupported() === false) return null;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {button ?? (
          <Button variant={"outline"} onClick={() => setIsOpen(true)}>
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

export default ScanQRDialog;
