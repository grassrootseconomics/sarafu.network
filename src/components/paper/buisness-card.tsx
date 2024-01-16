import { AtSignIcon } from "lucide-react";
import { PropsWithChildren, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useAccount } from "wagmi";
import { RouterOutputs } from "~/utils/api";
import { Icons } from "../icons";
import AddressQRCode from "../qr-code/address-qr-code";

interface BusinessCardProps {
  me: RouterOutputs["me"]["get"];
}
export const CardDimensions = (props: PropsWithChildren) => {
  return (
    <div
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-[86mm] w-[56mm] print:outline-dashed print:p-1 print:outline-2 print:outline-gray-400 print:rounded-none print:shadow-none  print:h-[86mm] print:w-[56mm]"
      style={{ aspectRatio: "56/86" }}
    >
      {props.children}
    </div>
  );
};
export default function BusinessCard(props: BusinessCardProps) {
  const address = useAccount();
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  return (
    <div ref={printRef} onClick={handlePrint} className="flex p-1">
      <CardDimensions>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {props.me?.given_names}
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Sarafu Network
            </p>
          </div>
          <div>
            {/* <img
            alt="Sarafu"
            className="rounded-full"
            height="48"
            src="/logo.svg"
            style={{
              aspectRatio: "48/48",
              objectFit: "cover",
            }}
            width="48"
          /> */}
            <Icons.logo
              prefix="buisness-card"
              className="rounded-full"
              height="48"
              style={{
                aspectRatio: "48/48",
                objectFit: "cover",
              }}
              width="48"
            />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <AtSignIcon className="h-4 w-4 inline-block mr-1" />
            {props.me?.vpa}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            <PhoneIcon className="h-4 w-4 inline-block mr-1" />
            +254723522717
          </p>
        </div>
        <div className="mt-6">
          <AddressQRCode
            size={128}
            className="mx-auto"
            style={{
              aspectRatio: "128/128",
              objectFit: "cover",
            }}
            id={"addressQRCodeId"}
            address={address.address}
          />
        </div>
      </CardDimensions>
      <CardDimensions>
        <div className="flex items-center align-middle w-full h-full justify-between">
          <div className="mx-auto my-auto flex flex-col">
            <Icons.logo
              prefix="buisness-card"
              className="rounded-full"
              height="120"
              width="120"
              style={{
                aspectRatio: "1/1",
                objectFit: "cover",
              }}
            />
            <span className="mt-8 hidden text-lg text-center font-light sm:inline-block">
              Sarafu Network
            </span>
          </div>
        </div>
      </CardDimensions>
    </div>
  );
}

function MailIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
