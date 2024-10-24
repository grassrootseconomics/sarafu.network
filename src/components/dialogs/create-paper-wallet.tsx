"use client";

import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import React from "react";
import { CreatePaperWallet } from "../paper";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

interface SendDialogProps {
  voucherAddress?: `0x${string}`;
  button?: React.ReactNode;
}
export const CreatePaperDialog = (props: SendDialogProps) => {
  const [open, setOpen] = useState(false);

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
      <DialogContent className="p-2 md:p-4">
        <CreatePaperWallet />
      </DialogContent>
    </Dialog>
  );
};
