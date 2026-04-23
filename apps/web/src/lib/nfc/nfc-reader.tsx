import { NfcIcon } from "lucide-react";
import { useNFCReader } from "./use-nfc-reader";

export const NfcReader = ({
  onResult,
}: {
  onResult: (result: string) => void;
}) => {
  const { isSupported } = useNFCReader({
    onReadingSuccess: onResult,
  });
  if (!isSupported) return null;
  return (
    <div className="text-center space-y-6 py-12 pb-16">
      <div className="mx-auto w-32 h-32 bg-purple-50 rounded-full flex items-center justify-center">
        <NfcIcon className={`w-16 h-16 ${"animate-pulse text-purple-600"}`} />
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Hold Near NFC Card</h3>
        <p className="text-sm text-gray-600">
          {"Hold your device near the NFC card..."}
        </p>
      </div>
    </div>
  );
};
