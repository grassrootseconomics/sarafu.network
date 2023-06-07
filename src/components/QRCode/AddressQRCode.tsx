import dynamic from "next/dynamic";
const QRCode = dynamic(
  () => import("react-qrcode-logo").then((mod) => mod.QRCode),
  {
    ssr: false,
  }
);
const AddressQRCode = ({ address }: { address: string }) => {
  return <QRCode value={address} logoImage="/qr/address.png" qrStyle="dots" />;
};
export default AddressQRCode;
