import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import React from "react";
import { useAccount } from "wagmi";
import Address from "../address";
import AddressQRCode from "../qr-code/address-qr-code";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface ReceiveDialogProps {
  button?: React.ReactNode;
}
export const ReceiveDialog = (props: ReceiveDialogProps) => {
  const [open, setOpen] = useState(false);

  const { address } = useAccount();
  const handleOpenChanged = (open: boolean) => {
    setOpen(open);
  };

  return (
    <Dialog modal open={open} onOpenChange={handleOpenChanged}>
      <DialogTrigger asChild>
        {props.button ? (
          props.button
        ) : (
          <Button variant={"default"}>
            <PaperPlaneIcon className="m-1" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receive</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <AddressQRCode size={256} className="mx-auto" address={address!} />
          <Address address={address} className="text-center break-all" />
        </div>
      </DialogContent>
    </Dialog>
  );
};
