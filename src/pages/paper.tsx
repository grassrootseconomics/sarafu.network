import { type NextPage } from "next/types";
import { useRef, useState } from "react";

import { useReactToPrint } from "react-to-print";
import { createPublicClient, http } from "viem";
import AddressQRCode from "../components/qr-code/address-qr-code";
import PrivateKeyQRCode from "../components/qr-code/private-key-qr-code";

import { PrinterIcon } from "lucide-react";
import { PaperWalletForm } from "~/components/forms/paper-wallet-form";
import { Button } from "~/components/ui/button";
import { PaperWallet, type PaperWalletQRCodeContent } from "~/utils/paper-wallet";
import { getViemChain } from "../lib/web3";

export const publicClient = createPublicClient({
  chain: getViemChain(),
  transport: http(),
});

const PrivateKeyPage: NextPage = () => {
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
  const qrText = JSON.stringify(data);
  return (
    <div className="mt-2 p-2">
      <PaperWalletForm
        onSubmit={(data) => handleGenerateClick(data.password)}
      />
      {data && (
        <div className="relative shadow-lg rounded-md m-2">
          <div ref={printRef} className=" p-8">
            <div className="flex items-center justify-evenly">
              <PrivateKeyQRCode text={qrText} />

              <div className="flex flex-col justify-evenly align-middle items-center ">
                <AddressQRCode address={data.address} />
                <p className="text-center">{data.address}</p>
              </div>
            </div>
          </div>
          <Button
            className="absolute top-2 right-2"
            variant={"ghost"}
            onClick={handlePrint}
          >
            <PrinterIcon color="lightgray" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PrivateKeyPage;
