import Image from "next/image";
import { useRef, type PropsWithChildren } from "react";
import { useReactToPrint } from "react-to-print";
import { cn } from "~/lib/utils";
import { type PaperWalletQRCodeContent } from "~/utils/paper-wallet";
import PrivateKeyQRCode from "../qr-code/private-key-qr-code";
interface BusinessCardProps {
  account: PaperWalletQRCodeContent;
  title: string;
  logo: string;
  custom_text?: string;
  website: string;
}
export const CardDimensions = (
  props: PropsWithChildren<{ className?: string }>
) => {
  return (
    <div
      className={cn(
        props.className,
        "bg-white dark:bg-gray-800 p-1 rounded-lg shadow-lg w-[86mm] h-[56mm] print:outline-dashed print:p-1 print:outline-2 print:outline-gray-400 print:rounded-none print:shadow-none  print:w-[86mm] print:h-[56mm]"
      )}
      style={{ aspectRatio: "86/56", pageBreakInside: "avoid" }}
    >
      {props.children}
    </div>
  );
};
export default function QRCard({
  account,
  custom_text,
  title: name = "Sarafu Network",
  logo = "/logo.svg",
  website = "https://sarafu.network",
}: BusinessCardProps) {
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  return (
    <div ref={printRef} onClick={handlePrint} className="flex p-1 print:p-0">
      <CardDimensions className="flex flex-col justify-between outline-gray-400 outline-2 outline-dashed">
        <h5 className="text-xs font-light text-center text-gray-700 dark:text-gray-300">
          {website}
        </h5>
        <div className="flex justify-between">
          <div className="flex flex-col justify-evenly gap-1 items-center mx-auto">
            <Image
              alt="Sarafu"
              className="rounded-full"
              height={120}
              src={logo}
              objectFit="cover"
              width={120}
              quality={100}
            />
            <div>
              <h5 className="text-md font-medium text-gray-700 dark:text-gray-300">
                {name}
              </h5>
              {custom_text && (
                <h5 className="text-xs font-light text-gray-700 dark:text-gray-300">
                  {custom_text}
                </h5>
              )}
            </div>
          </div>
          <div className="mt-auto">
            <PrivateKeyQRCode
              size={160}
              className="mx-auto"
              style={{
                aspectRatio: "128/128",
                objectFit: "cover",
              }}
              id={"addressQRCodeId"}
              text={JSON.stringify(account)}
            />
          </div>
        </div>
        <p className="text-center">
          <span className="font-light text-xs text-center text-gray-700 dark:text-gray-300">
            {account.address}
          </span>
        </p>
      </CardDimensions>
    </div>
  );
}
