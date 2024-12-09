"use client";

import {
  DownloadIcon,
  PaperPlaneIcon,
  Share1Icon,
} from "@radix-ui/react-icons";
import { useState } from "react";

import React from "react";
import { useAccount } from "wagmi";
import { useAuth } from "~/hooks/useAuth";
import useWebShare from "~/hooks/useWebShare";
import { downloadSVGAsPNG, svgToPNG } from "../../utils/svg-to-png-converter";
import Address from "../address";
import { ResponsiveModal } from "../modal";
import AddressQRCode from "../qr-code/address-qr-code";
import { Button } from "../ui/button";

interface ReceiveDialogProps {
  button?: React.ReactNode;
}
export const ReceiveDialog = (props: ReceiveDialogProps) => {
  const [open, setOpen] = useState(false);

  const { address } = useAccount();
  const auth = useAuth();
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
    <ResponsiveModal
      title="Receive"
      button={
        props.button ? (
          props.button
        ) : (
          <Button variant={"default"}>
            <PaperPlaneIcon className="m-1" />
          </Button>
        )
      }
      open={open}
      onOpenChange={handleOpenChanged}
    >
      <div className="flex flex-col space-y-4">
        {auth?.user?.vpa && (
          <div className="text-center break-all text-md font-semibold text-gray-800">
            {auth.user?.vpa}
          </div>
        )}
        <Address
          address={address}
          className="text-center break-all text-md font-semibold text-gray-700"
        />
        <AddressQRCode
          id="addressQRCodeId"
          size={256}
          className="mx-auto"
          address={address ?? ""}
        />

        <div className="flex m-2  py-4 justify-evenly">
          {isSupported && (
            <Button variant="outline" onClick={handleShare}>
              <Share1Icon className="mr-2" />
              Share
            </Button>
          )}

          <Button
            variant="outline"
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
    </ResponsiveModal>
  );
};
