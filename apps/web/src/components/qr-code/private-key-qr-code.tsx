import dynamic from "next/dynamic";

const QRCode = dynamic(() => import("react-qr-code"), {
  ssr: false,
});
const PrivateKeyQRCode = ({
  id,
  text,
  className,
  size,
  style,
}: {
  id?: string;
  text: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}) => {
  return (
    <QRCode
      id={id}
      style={style}
      className={className}
      value={text}
      size={size ?? 170}
    />
  );
};
export default PrivateKeyQRCode;
