import dynamic from "next/dynamic";
import { buildEthUrl } from "~/lib/eth-url-parser";
const QRCode = dynamic(() => import("react-qr-code"), {
  ssr: false,
});
const AddressQRCode = ({
  address,
  className,
  size,
}: {
  address: string;
  className?: string;
  size?: number;
}) => {
  const uri = buildEthUrl({
    target_address: address,
  });
  return <QRCode className={className} value={uri} size={size ?? 128} />;
};
export default AddressQRCode;
