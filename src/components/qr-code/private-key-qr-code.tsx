import dynamic from "next/dynamic";
// import QRCode from "react-qr-code";

const QRCode = dynamic(() => import("react-qr-code"), {
  ssr: false,
});
const PrivateKeyQRCode = ({ text }: { text: string }) => {
  return <QRCode value={text} size={170} />;
};
export default PrivateKeyQRCode;
