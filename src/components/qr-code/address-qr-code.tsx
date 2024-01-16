import dynamic from "next/dynamic";
const QRCode = dynamic(() => import("react-qr-code"), {
  ssr: false,
});
const AddressQRCode = ({
  id,
  address,
  className,
  size,
  style
}: {
  id?: string;
  address: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}) => {
  return (
    <QRCode id={id} style={style} className={className} value={address} size={size ?? 128} />
  );
};
export default AddressQRCode;
