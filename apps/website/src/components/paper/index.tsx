import { PaperWallet } from "@grassroots/paper-wallet";
import type { PaperWalletQRCodeContent } from "@grassroots/paper-wallet/wallet";
import {
  DownloadIcon,
  LockClosedIcon,
  LockOpen1Icon,
  TokensIcon,
} from "@radix-ui/react-icons";
import * as htmlToImage from "html-to-image";
import { PrinterIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";

import { EncryptedPaperWalletForm } from "~/components/forms/paper-wallet-form";
import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { download } from "~/utils/download";
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
      "qrCard",
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
      <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
        <Button
          onClick={() => {
            setType("encrypted");
          }}
          variant={"secondary"}
          className="flex h-[unset] w-full flex-1 flex-col items-center justify-center"
        >
          <LockClosedIcon className="flex size-10 grow" />
          Encrypted
        </Button>
        <Button
          onClick={() => {
            setType("unencrypted");
            handleGenerateClick();
          }}
          variant={"secondary"}
          className="flex h-[unset] w-full flex-1 flex-col items-center justify-center"
        >
          <LockOpen1Icon className="flex size-10 grow" />
          Unencrypted
        </Button>
        <Link
          href="/paper/generate"
          className={cn(
            buttonVariants({
              variant: "secondary",
            }),
            "flex h-[unset] w-full flex-1 flex-col items-center justify-center",
          )}
        >
          <TokensIcon className="flex size-10 grow" />
          Batch
        </Link>
      </div>
    );
  return (
    <div className="max-w-[93vw]">
      {!data && (
        <EncryptedPaperWalletForm
          onSubmit={(data) => handleGenerateClick(data.password)}
        />
      )}
      {data && (
        <div className="my-2 flex flex-col items-center gap-3 rounded-md">
          <p className="text-center text-destructive">
            Do not share your private key with anyone. If you lose your private
            key, you will lose access to your funds.
          </p>
          <div className="my-14 scale-75 sm:scale-100">
            <QRCard ref={printRef} id={"qrCard"} account={data} />
          </div>
          <div className="flex w-full flex-col justify-end gap-3">
            <p className="p-2 text-center text-sm text-gray-500">
              Print or download your paper wallet.
            </p>
            <div className="flex w-full justify-evenly">
              <Button onClick={handlePrint}>
                <PrinterIcon size={15} className="mr-2" />
                Print
              </Button>
              <Button
                variant={"ghost"}
                className="print:hidden"
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
