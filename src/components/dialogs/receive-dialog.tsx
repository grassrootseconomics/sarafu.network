"use client";

import {
  DownloadIcon,
  PaperPlaneIcon,
  Share1Icon,
} from "@radix-ui/react-icons";
import { useState } from "react";

import React from "react";
import { useAccount } from "wagmi";
import useWebShare from "~/hooks/useWebShare";
import { downloadSVGAsPNG, svgToPNG } from "../../utils/svg-to-png-converter";
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
  const { share, isSupported } = useWebShare();
  const handleShare = () => {
    svgToPNG(
      document.getElementById("addressQRCodeId") as unknown as SVGSVGElement,
      "address.png"
    )
      .then((file) => {
        const filesArray = [file];
        const shareData = {
          title: "My Sarafu Address",
          text: address!,
          files: filesArray,
        };
        share(shareData);
      })
      .catch((error) => {
        console.error(error);
      });
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
          <AddressQRCode
            id="addressQRCodeId"
            size={256}
            className="mx-auto"
            address={address ?? ""}
          />
          <Address address={address} className="text-center break-all" />
          <div className="flex m-2 justify-evenly">
            {isSupported && (
              <Button variant="ghost" onClick={handleShare}>
                <Share1Icon className="mr-2" />
                Share
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => {
                downloadSVGAsPNG(
                  document.getElementById(
                    "addressQRCodeId"
                  ) as unknown as SVGSVGElement,
                  "address.png"
                ).catch((error) => {
                  console.error(error);
                });
              }}
            >
              <DownloadIcon className="mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
