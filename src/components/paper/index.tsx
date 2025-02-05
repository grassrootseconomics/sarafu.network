import { useRef, useState } from "react";

import {
  DownloadIcon,
  LockClosedIcon,
  LockOpen1Icon,
  TokensIcon,
} from "@radix-ui/react-icons";
import * as htmlToImage from "html-to-image";
import { PrinterIcon } from "lucide-react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import { EncryptedPaperWalletForm } from "~/components/forms/paper-wallet-form";
import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { download } from "~/utils/download";
import {
  PaperWallet,
  type PaperWalletQRCodeContent,
} from "~/utils/paper-wallet";
import QRCard from "./qr-card";

export const CreatePaperWallet = () => {
  const [data, setData] = useState<PaperWalletQRCodeContent | null>(null);
  const [type, setType] = useState<"encrypted" | "unencrypted">();
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleGenerateClick = (password?: string) => {
    PaperWallet.generate(password)
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.error(error);
        toast.error("An error occurred while generating the paper wallet");
      });
  };
  const downloadQRCard = () => {
    const privateKeyQRCode = document.getElementById(
      "qrCard"
    ) as unknown as HTMLElement;
    if (privateKeyQRCode) {
      htmlToImage
        .toPng(privateKeyQRCode)
        .then(function (dataUrl) {
          download(dataUrl, `${data?.address}.png`);
        })
        .catch(console.error);
    }
  };
  if (!type)
    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center mb-4">Create Paper Wallet</h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Choose a wallet type to get started. Encrypted wallets offer additional security.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={() => setType("encrypted")}
            variant="outline"
            className="flex flex-col items-center p-6 h-auto"
          >
            <LockClosedIcon className="size-12 mb-2" />
            <span className="font-semibold">Encrypted</span>
            <span className="text-xs text-gray-500">With Password</span>
          </Button>
          <Button
            onClick={() => {
              setType("unencrypted");
              handleGenerateClick();
            }}
            variant="outline"
            className="flex flex-col items-center p-6 h-auto"
          >
            <LockOpen1Icon className="size-12 mb-2" />
            <span className="font-semibold">Unencrypted</span>
            <span className="text-xs text-gray-500">No Password</span>
          </Button>
        </div>
        <Link
          href="/paper/generate"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "w-full justify-center items-center mt-4"
          )}
        >
          <TokensIcon className="mr-2 size-5" />
          Generate Batch
        </Link>
      </div>
    );

  return (
    <div className="max-w-lg mx-auto p-4">
      {!data && (
        <>
          <h2 className="text-2xl font-bold text-center mb-4">
            {type === "encrypted" ? "Create Encrypted Wallet" : "Generating Unencrypted Wallet"}
          </h2>
          <EncryptedPaperWalletForm
            onSubmit={(data) => handleGenerateClick(data.password)}
          />
        </>
      )}
      {data && (
        <div className="rounded-lg flex flex-col items-center gap-6">
          <p className="text-destructive text-center font-semibold">
            Warning: Do not share your wallet. Loss of the Wallet means loss of funds.
          </p>
          <div className="my-8 scale-90 sm:scale-100">
            <QRCard ref={printRef} id="qrCard" account={data} />
          </div>
          <div className="w-full space-y-4">
            <p className="text-sm text-center text-gray-500">
              Secure your wallet by printing or downloading it.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={handlePrint} className="w-full sm:w-auto">
                <PrinterIcon size={18} className="mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto print:hidden"
                onClick={downloadQRCard}
              >
                <DownloadIcon className="mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
