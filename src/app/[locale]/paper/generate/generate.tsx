"use client";
import { ResetIcon } from "@radix-ui/react-icons";
import { PrinterIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { generatePrivateKey, privateKeyToAddress } from "viem/accounts";
import {
  GenerateWalletsForm,
  type GenerateWalletsFormTypes,
} from "~/components/forms/generate-wallets-form";
import { ContentContainer } from "~/components/layout/content-container";
import QRCard from "~/components/paper/qr-card";
import { Button } from "~/components/ui/button";

export const Generate = () => {
  const t = useTranslations("paperWallet");
  const tButtons = useTranslations("buttons");
  const [wallets, setWallets] = useState<
    {
      account: {
        address: `0x${string}`;
        privateKey: string;
      };
      title: string;
      logo: string;
      custom_text?: string;
      website: string;
    }[]
  >([]);

  function handleSubmit(data: GenerateWalletsFormTypes) {
    const wxs = [];
    for (let i = 0; i < data.amount; i++) {
      const privateKey = generatePrivateKey();
      const address = privateKeyToAddress(privateKey);
      wxs.push({
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
    setWallets(wxs);
  }
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });
  return (
    <ContentContainer title={t("createAccounts")}>
      <div className="mx-4 pt-4">
        {wallets.length == 0 && <GenerateWalletsForm onSubmit={handleSubmit} />}
        {wallets.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-2 justify-between">
              {/* Print Button with ICon */}
              <Button onClick={() => handlePrint()}>
                <PrinterIcon size={15} className="mr-2" />
                {tButtons("print")}
              </Button>
              <Button variant={"ghost"} onClick={() => setWallets([])}>
                <ResetIcon className="mr-2" />
                {tButtons("reset")}
              </Button>
            </div>
            <div
              ref={printRef}
              className="flex p-1 flex-wrap justify-center gap-x-0 gap-y-0 m-auto"
            >
              {wallets.map((wallet) => {
                return <QRCard key={wallet.account.address} {...wallet} />;
              })}
            </div>
          </div>
        )}
      </div>
    </ContentContainer>
  );
};
