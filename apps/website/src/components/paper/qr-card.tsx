import type { PaperWalletQRCodeContent } from "@grassroots/paper-wallet/wallet";
import type { PropsWithChildren } from "react";
import React from "react";
import Image from "next/image";
import { toQRContent } from "@grassroots/paper-wallet/wallet";

import { cn } from "~/lib/utils";
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
  props: PropsWithChildren<{ className?: string }>,
) => {
  return (
    <div
      className={cn(
        props.className,
        "h-[56mm] w-[86mm] rounded-lg bg-white p-1 shadow-2xl dark:bg-gray-800 print:h-[56mm] print:w-[86mm] print:rounded-none print:p-1 print:shadow-none print:outline-dashed print:outline-2 print:outline-gray-400",
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
        <CardDimensions className="flex flex-col justify-between">
          <div className="my-auto flex justify-center">
            <div className="mx-auto flex flex-col items-center justify-end gap-1">
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
                  <h5 className="text-center text-xs font-light text-gray-700 dark:text-gray-300">
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
            <span
              className="text-center font-light text-gray-700 dark:text-gray-300"
              style={{
                fontSize: "3.2mm",
              }}
            >
              {account.address}
            </span>
          </p>
        </CardDimensions>
      </div>
    );
  },
);
QRCard.displayName = "QRCard";

export default QRCard;
