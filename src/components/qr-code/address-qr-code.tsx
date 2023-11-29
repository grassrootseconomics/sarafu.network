import dynamic from "next/dynamic";
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
  return (
    <QRCode id={id} className={className} value={address} size={size ?? 128} />
  );
};
export default AddressQRCode;
