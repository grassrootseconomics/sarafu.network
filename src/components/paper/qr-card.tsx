import Image from "next/image";
import React, { type PropsWithChildren } from "react";
import { cn } from "~/lib/utils";
import {
  toQRContent,
  type PaperWalletQRCodeContent,
} from "~/utils/paper-wallet";
import PrivateKeyQRCode from "../qr-code/private-key-qr-code";

interface BusinessCardProps {
  id?: string;
  account: PaperWalletQRCodeContent;
  title?: string;
  logo?: string;
  custom_text?: string;
  website?: string;
}

export const CardDimensions = (
  props: PropsWithChildren<{ className?: string }>
) => {
  return (
    <div
      className={cn(
        props.className,
        "bg-white dark:bg-gray-800 p-1 rounded-lg shadow-2xl w-[86mm] h-[56mm] print:outline-dashed print:p-1 print:outline-2 print:outline-gray-400 print:rounded-none print:shadow-none  print:w-[86mm] print:h-[56mm]"
      )}
      style={{ aspectRatio: "86/56", pageBreakInside: "avoid" }}
    >
      {props.children}
    </div>
  );
};

const QRCard = React.forwardRef<React.ElementRef<"div">, BusinessCardProps>(
  ({ id, account, custom_text, title, logo, website }, ref) => {
    const name = title ?? "Sarafu";
    logo = logo ?? "/logo.svg";
    website = website ?? "https://sarafu.network";

    return (
      <div id={id} ref={ref} className="flex p-1 print:p-0">
        <CardDimensions className="flex flex-col justify-between ">
          <div className="flex justify-center my-auto">
            <div className="flex flex-col justify-end gap-1 items-center mx-auto">
              <Image
                alt="Sarafu"
                className="p-2"
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
                {website && (
                  <h5 className="text-xs font-light text-center text-gray-700 dark:text-gray-300">
                    {website}
                  </h5>
                )}
              </div>
            </div>
            <div className="mt-auto">
              <PrivateKeyQRCode
                size={160}
                className="mx-auto p-2"
                style={{
                  aspectRatio: "128/128",
                  objectFit: "cover",
                }}
                text={toQRContent(account)}
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
);
QRCard.displayName = "QRCard";

export default QRCard;
