import dynamic from "next/dynamic";
const QRCode = dynamic(
  () => import("react-qrcode-logo").then((mod) => mod.QRCode),
  {
    ssr: false,
  }
);
const PrivateKeyQRCode = ({
  encryptedPubicKey,
}: {
  encryptedPubicKey: string;
}) => {
  return (
    <QRCode
      value={encryptedPubicKey}
      logoImage="/qr/private.png"
      qrStyle="dots"
    />
  );
};
export default PrivateKeyQRCode;
