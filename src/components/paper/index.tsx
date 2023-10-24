import { useRef, useState } from "react";

import { useReactToPrint } from "react-to-print";
import { createPublicClient, http } from "viem";
import AddressQRCode from "~/components/qr-code/address-qr-code";
import PrivateKeyQRCode from "~/components/qr-code/private-key-qr-code";

import { DownloadIcon } from "@radix-ui/react-icons";
import { PrinterIcon } from "lucide-react";
import { PaperWalletForm } from "~/components/forms/paper-wallet-form";
import { Button } from "~/components/ui/button";
import {
  PaperWallet,
  type PaperWalletQRCodeContent,
} from "~/utils/paper-wallet";
import { getViemChain } from "../../lib/web3";
import { downloadSVGAsPNG } from "../qr-code/download";

export const publicClient = createPublicClient({
  chain: getViemChain(),
  transport: http(),
});

export const CreatePaperWallet = () => {
  const [data, setData] = useState<PaperWalletQRCodeContent | null>(null);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleGenerateClick = (password: string) => {
    PaperWallet.generate(password)
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.error(error);
        // Handle the error appropriately here
      });
  };
  const downloadPrivateKeyQR = () => {
    const privateKeyQRCode = document.getElementById(
      "privateKeyQRCodeId"
    ) as unknown as SVGSVGElement;
    if (privateKeyQRCode) {
      downloadSVGAsPNG(privateKeyQRCode, "private-key.png");
    }
  };
  const downloadAddressQR = () => {
    const addressQRCode = document.getElementById(
      "addressQRCodeId"
    ) as unknown as SVGSVGElement;
    if (addressQRCode) {
      downloadSVGAsPNG(addressQRCode, "address.png");
    }
  };
  const qrText = JSON.stringify(data);

  return (
    <div className="">
      {!data && (
        <PaperWalletForm
          onSubmit={(data) => handleGenerateClick(data.password)}
        />
      )}
      {data && (
        <div className="rounded-md my-2">
          <div ref={printRef} className="pt-8 flex">
            <div className="flex-grow space-y-3 font-bold text-lg flex flex-col items-center justify-evenly">
              <div className="flex flex-col space-y-3 items-center">
                <h2 className="text-center">Private Key</h2>
                <PrivateKeyQRCode id={"privateKeyQRCodeId"} text={qrText} />
                <Button
                  variant={"ghost"}
                  className="print:hidden"
                  onClick={downloadPrivateKeyQR}
                >
                  <DownloadIcon className="mr-2" />
                  Download
                </Button>
              </div>
              <div className="flex flex-col print:pt-40 space-y-3 items-center">
                <h2 className="text-center">Address</h2>
                <AddressQRCode id={"addressQRCodeId"} address={data.address} />
                <p className="text-sm font-normal break-all text-center">
                  {data.address}
                </p>
                <Button
                  variant={"ghost"}
                  className="print:hidden"
                  onClick={downloadAddressQR}
                >
                  <DownloadIcon className="mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-around">
            <Button onClick={handlePrint}>
              <PrinterIcon size={15} className="mr-2" />
              Print
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
