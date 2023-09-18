import { QrCodeIcon } from "lucide-react";
import { useState } from "react";
import QrReader from "../qr-code/reader";
import { type OnResultFunction } from "../qr-code/reader/types";
import { isMediaDevicesSupported } from "../qr-code/reader/utils";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { useToast } from "../ui/use-toast";

interface ScanQRDialogProps {
  onScan: (address: string) => void;
}

const ScanQRDialog = ({ onScan }: ScanQRDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();
  const handleOnResult: OnResultFunction = (data, error) => {
    if (data && data.getText()) {
      onScan(data.getText());
      setIsOpen(false); // close the dialog
    }
    if (error) {
      toast.toast({
        title: "Error",
        description: error.message,
        type: "foreground",
        variant: "destructive",
      });
      onScan("");
    }
  };
  if (isMediaDevicesSupported() === false) return null;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} onClick={() => setIsOpen(true)}>
          <QrCodeIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <QrReader className="overflow-clip" onResult={handleOnResult} />
      </DialogContent>
    </Dialog>
  );
};

export default ScanQRDialog;
