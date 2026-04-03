"use client";

import * as htmlToImage from "html-to-image";
import { Download, PrinterIcon, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { generatePrivateKey, privateKeyToAddress } from "viem/accounts";
import {
  GenerateWalletsForm,
  type GenerateWalletsFormTypes,
} from "~/components/forms/generate-wallets-form";
import { ContentContainer } from "~/components/layout/content-container";
import { CreatePaperWallet } from "~/components/paper";
import QRCard from "~/components/paper/qr-card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { download } from "~/utils/download";

interface BatchWallet {
  account: {
    address: `0x${string}`;
    privateKey: string;
  };
  title: string;
  logo: string;
  custom_text?: string;
  website: string;
}

export default function CreatePaperWalletPage() {
  const [batchWallets, setBatchWallets] = useState<BatchWallet[]>([]);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  function handleDownloadImage() {
    if (!printRef.current) return;
    htmlToImage
      .toPng(printRef.current, { skipFonts: true, backgroundColor: "#ffffff" })
      .then((dataUrl) => {
        download(dataUrl, "paper-wallet.png");
      })
      .catch(console.error);
  }

  function handleBatchSubmit(data: GenerateWalletsFormTypes) {
    const wallets = [];
    for (let i = 0; i < data.amount; i++) {
      const privateKey = generatePrivateKey();
      const address = privateKeyToAddress(privateKey);
      wallets.push({
        title: data.title,
        logo: data.logo,
        custom_text: data.custom_text,
        website: data.website,
        account: {
          address: address,
          privateKey: privateKey,
        },
      });
    }
    setBatchWallets(wallets);
  }

  return (
    <ContentContainer title="Create Paper Wallets">
      <h1 className="text-center text-3xl mt-8 mb-4 font-extrabold">
        Create Paper Wallets
      </h1>
      <div className="mx-4 pt-4">
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="flex mx-auto w-fit">
            <TabsTrigger value="single">Single Wallet</TabsTrigger>
            <TabsTrigger value="batch">Batch Generation</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-6">
            <CreatePaperWallet />
          </TabsContent>

          <TabsContent value="batch" className="mt-6">
            {batchWallets.length === 0 && (
              <GenerateWalletsForm onSubmit={handleBatchSubmit} />
            )}
            {batchWallets.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-2 justify-between">
                  <div className="flex gap-2">
                    <Button onClick={() => handlePrint()}>
                      <PrinterIcon size={15} className="mr-2" />
                      Print
                    </Button>
                    <Button variant="outline" onClick={handleDownloadImage}>
                      <Download size={15} className="mr-2" />
                      Download Image
                    </Button>
                  </div>
                  <Button variant="ghost" onClick={() => setBatchWallets([])}>
                    <RotateCcw className="mr-2" />
                    Reset
                  </Button>
                </div>
                <div className="flex justify-center p-1">
                  <div
                    ref={printRef}
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${Math.min(batchWallets.length, 4)}, max-content)`,
                      width: "fit-content",
                    }}
                  >
                    {batchWallets.map((wallet) => (
                      <QRCard key={wallet.account.address} {...wallet} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ContentContainer>
  );
}
