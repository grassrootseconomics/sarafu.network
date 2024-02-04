import { useRef, useState } from "react";

import {
  DownloadIcon,
  LockClosedIcon,
  LockOpen1Icon,
} from "@radix-ui/react-icons";
import * as htmlToImage from "html-to-image";
import { PrinterIcon } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { EncryptedPaperWalletForm } from "~/components/forms/paper-wallet-form";
import { Button } from "~/components/ui/button";
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
        // Handle the error appropriately here
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
      <div className="flex flex-col md:flex-row justify-center items-center gap-3">
        <Button
          onClick={() => {
            setType("encrypted");
          }}
          variant={"secondary"}
          className="flex w-full flex-1 flex-col h-[unset] justify-center items-center"
        >
          <LockClosedIcon className="flex grow h-10 w-10" />
          Encrypted
        </Button>
        <Button
          onClick={() => {
            setType("unencrypted");
            handleGenerateClick();
          }}
          variant={"secondary"}
          className="flex w-full flex-1 flex-col h-[unset] justify-center items-center"
        >
          <LockOpen1Icon className="flex grow h-10 w-10" />
          Unencrypted
        </Button>
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
        <div className="rounded-md my-2 flex flex-col items-center gap-3">
          <p className="text-destructive text-center">
            Do not share your private key with anyone. If you lose your private
            key, you will lose access to your funds.
          </p>
          <div className="my-14 scale-75 sm:scale-100">
            <QRCard ref={printRef} id={"qrCard"} account={data} />
          </div>
          <div className="flex w-full flex-col justify-end gap-3">
            <p className="text-sm text-center p-2 text-gray-500">
              Print or download your paper wallet.
            </p>
            <div className="flex justify-evenly w-full">
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
