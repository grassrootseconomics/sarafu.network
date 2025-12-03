import dynamic from "next/dynamic";
import { type QRCodeProps } from "react-qr-code";
const QRCode = dynamic(() => import("react-qr-code"), {
  ssr: false,
});
const AddressQRCode = ({
  id,
  address,
  size,
  ...props
}: {
  id?: string;
  address: string;
} & Omit<QRCodeProps, "value">) => {
  return (
    <QRCode
      id={id}
      size={size}
      value={address}
      {...props}
    />
  );
};
export default AddressQRCode;
