"use client";

import * as htmlToImage from "html-to-image";
import { DownloadIcon, PrinterIcon } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import QRCard from "~/components/paper/qr-card";
import { Button } from "~/components/ui/button";
import { download } from "~/utils/download";
import type { CreatedWallet } from "./wallet-creation-types";

interface PaperWalletDisplayProps {
  wallet: CreatedWallet;
  onReset: () => void;
}

export function PaperWalletDisplay({
  wallet,
  onReset,
}: PaperWalletDisplayProps) {
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const downloadQRCard = () => {
    const qrCardElement = document.getElementById(
      "paperWalletQRCard"
    ) as HTMLElement;
    if (qrCardElement) {
      htmlToImage
        .toPng(qrCardElement)
        .then(function (dataUrl) {
          download(dataUrl, `${wallet.address}.png`);
        })
        .catch(console.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          {wallet.encryption === "encrypted" ? "Encrypted" : "Unencrypted"}{" "}
          Paper Wallet Created!
        </h3>
        <p className="text-sm text-red-600 font-semibold mb-4">
          ⚠️ Warning: Do not share your wallet. Loss of the wallet means loss of
          funds.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="scale-90 sm:scale-100">
          <QRCard
            ref={printRef}
            id="paperWalletQRCard"
            account={wallet.wallet}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Secure your wallet by printing or downloading it
          </p>

          <div className="flex justify-center gap-4 mb-6">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <PrinterIcon className="w-4 h-4" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={downloadQRCard}
              className="flex items-center gap-2"
            >
              <DownloadIcon className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700">ENS Name:</p>
              <p className="font-mono text-sm">{wallet.ensName}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Type:</p>
              <p className="capitalize">
                {wallet.medium} - {wallet.encryption}
              </p>
            </div>
          </div>
        </div>

        <Button onClick={onReset} variant="outline" className="w-full">
          Create Another Wallet
        </Button>
      </div>
    </div>
  );
}
