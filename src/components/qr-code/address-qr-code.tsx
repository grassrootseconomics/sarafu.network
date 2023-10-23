import dynamic from "next/dynamic";
import { buildEthUrl } from "~/lib/eth-url-parser";
const QRCode = dynamic(() => import("react-qr-code"), {
  ssr: false,
});
const AddressQRCode = ({
  id,
  address,
  className,
  size,
}: {
  id?: string;
  address: string;
  className?: string;
  size?: number;
}) => {
  const uri = buildEthUrl({
    target_address: address,
  });
  return (
    <QRCode id={id} className={className} value={uri} size={size ?? 128} />
  );
};
export default AddressQRCode;
