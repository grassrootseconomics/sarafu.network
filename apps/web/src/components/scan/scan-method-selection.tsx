"use client";
import { ChevronLeftIcon, NfcIcon, QrCodeIcon } from "lucide-react";
import { nfcService } from "~/lib/nfc/nfc-service";
import { isMediaDevicesSupported } from "../qr-code/reader/utils";
import { Button } from "../ui/button";

export function ScanMethodSelection(props: {
  onSelectMethod: (method: "qr" | "nfc") => void;
  onBack: () => void;
}) {
  const isNFCSupported = nfcService.isNFCSupported();
  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Scan Wallet</h2>
        <p className="text-sm text-gray-600">
          Choose how you want to scan the wallet
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => props.onSelectMethod("qr")}
          disabled={!isMediaDevicesSupported()}
          className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200"
          variant="outline"
        >
          <QrCodeIcon className="w-8 h-8" />
          <div className="text-center">
            <div className="font-semibold">QR Code</div>
            <div className="text-xs text-blue-600">Camera scan</div>
          </div>
        </Button>

        <Button
          onClick={() => props.onSelectMethod("nfc")}
          disabled={!isNFCSupported}
          className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200"
          variant="outline"
        >
          <NfcIcon className="w-8 h-8" />
          <div className="text-center">
            <div className="font-semibold">NFC Card</div>
            <div className="text-xs text-purple-600">Tap to scan</div>
          </div>
        </Button>

        {(!isMediaDevicesSupported() || !isNFCSupported) && (
          <div className="text-xs text-gray-500 text-center mt-4">
            {!isMediaDevicesSupported() && "Camera not available. "}
            {!isNFCSupported && "NFC not supported. "}
          </div>
        )}
      </div>

      <Button variant="outline" onClick={props.onBack} className="w-full mt-6">
        <ChevronLeftIcon className="w-4 h-4 mr-2" />
        Back
      </Button>
    </div>
  );
}
