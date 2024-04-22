import { ResetIcon } from "@radix-ui/react-icons";
import { PrinterIcon } from "lucide-react";
import Head from "next/head";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { generatePrivateKey, privateKeyToAddress } from "viem/accounts";
import {
  GenerateWalletsForm,
  type GenerateWalletsFormTypes,
} from "~/components/forms/generate-wallets-form";
import QRCard from "~/components/paper/qr-card";
import { Button } from "~/components/ui/button";

const StaffPage = () => {
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
    content: () => printRef.current,
  });
  return (
    <div className="mx-4">
      <Head>
        <title>{`Generate Accounts`}</title>
        <meta
          name="description"
          content="Sarafu Network Staff Portal"
          key="desc"
        />
        <meta property="og:title" content="Staff Portal" />
        <meta property="og:description" content="Sarafu Network Staff Portal" />
      </Head>
      <h1 className="text-center text-3xl mt-8 mb-4 font-extrabold">
        Generate Accounts
      </h1>
      {wallets.length == 0 && <GenerateWalletsForm onSubmit={handleSubmit} />}
      {wallets.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-2 justify-between">
            {/* Print Button with ICon */}
            <Button onClick={handlePrint}>
              <PrinterIcon size={15} className="mr-2" />
              Print
            </Button>
            <Button variant={"ghost"} onClick={() => setWallets([])}>
              <ResetIcon className="mr-2" />
              Reset
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
  );
};

export default StaffPage;
