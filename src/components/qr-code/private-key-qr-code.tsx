import dynamic from "next/dynamic";
// import QRCode from "react-qr-code";

const QRCode = dynamic(() => import("react-qr-code"), {
  ssr: false,
});
const PrivateKeyQRCode = ({ text, id }: { text: string; id?: string }) => {
  return <QRCode id={id} value={text} size={170} />;
};
export default PrivateKeyQRCode;
