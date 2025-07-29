"use client";
import { type Result } from "@zxing/library";
import { QrCodeIcon, NfcIcon } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { useIsMounted } from "~/hooks/useIsMounted";
import { addressFromQRContent } from "~/utils/paper-wallet";
import { ResponsiveModal } from "../modal";
import QrReader from "../qr-code/reader";
import { isMediaDevicesSupported } from "../qr-code/reader/utils";
import { Button } from "../ui/button";
import { useNFC } from "~/lib/nfc/use-nfc";

interface ScanAddressDialogProps {
  disabled?: boolean;
  onAddress: (address: `0x${string}`) => void;
  button?: React.ReactNode;
}

function ScanAddressDialog({
  onAddress,
  button,
  disabled,
}: ScanAddressDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scanMode, setScanMode] = useState<'qr' | 'nfc'>('qr');
  const isMounted = useIsMounted();
  const { nfcStatus, readData, error: nfcError, startReading, stopReading, clearData } = useNFC();

  const handleOnResult = useCallback(
    (result?: Result | null, _error?: Error | null) => {
      const text = result?.getText();
      if (!text) return;
      try {
        const address = addressFromQRContent(text);
        onAddress(address);
      } catch (error) {
        console.error("Error processing QR code result:", error);
        toast.error((error as Error).message);
      } finally {
        setIsOpen(false);
      }
    },
    [onAddress]
  );

  const handleNFCRead = useCallback(async () => {
    try {
      await startReading();
    } catch (error) {
      console.error("Error starting NFC reading:", error);
      toast.error("Failed to start NFC reading");
    }
  }, [startReading]);

  React.useEffect(() => {
    if (readData && scanMode === 'nfc') {
      try {
        const address = addressFromQRContent(readData);
        onAddress(address);
        setIsOpen(false);
        clearData();
      } catch (error) {
        console.error("Error processing NFC data:", error);
        toast.error((error as Error).message);
      }
    }
  }, [readData, scanMode, onAddress, clearData]);

  React.useEffect(() => {
    if (nfcError) {
      toast.error(nfcError);
    }
  }, [nfcError]);

  // Auto-start NFC scanning when NFC tab is opened
  React.useEffect(() => {
    if (isOpen && scanMode === 'nfc' && nfcStatus.isSupported && !nfcStatus.isReading && !readData) {
      void handleNFCRead();
    }
  }, [isOpen, scanMode, nfcStatus.isSupported, nfcStatus.isReading, readData, handleNFCRead]);

  // Stop NFC scanning when dialog closes or tab switches
  React.useEffect(() => {
    if (!isOpen && nfcStatus.isReading) {
      void stopReading();
      clearData();
    }
    if (scanMode !== 'nfc' && nfcStatus.isReading) {
      void stopReading();
      clearData();
    }
  }, [isOpen, scanMode, nfcStatus.isReading, stopReading, clearData]);
  if (!isMounted) {
    return null;
  }

  const hasQRSupport = isMediaDevicesSupported();
  const hasNFCSupport = nfcStatus.isSupported;

  if (!hasQRSupport && !hasNFCSupport) {
    return null;
  }

  const defaultButton = (
    <Button
      disabled={disabled}
      variant="outline"
      onClick={() => setIsOpen(true)}
    >
      <QrCodeIcon />
    </Button>
  );

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={setIsOpen}
      button={button || defaultButton}
      title="Scan Address"
      description="Choose your scanning method to read a wallet address."
    >
      {isOpen && (
        <div className="space-y-4">
          {/* Scan Mode Selector */}
          <div className="flex gap-2">
            {hasQRSupport && (
              <Button
                variant={scanMode === 'qr' ? 'default' : 'outline'}
                onClick={() => setScanMode('qr')}
                className="flex-1"
              >
                <QrCodeIcon className="w-4 h-4 mr-2" />
                QR Code
              </Button>
            )}
            {hasNFCSupport && (
              <Button
                variant={scanMode === 'nfc' ? 'default' : 'outline'}
                onClick={() => setScanMode('nfc')}
                className="flex-1"
              >
                <NfcIcon className="w-4 h-4 mr-2" />
                NFC
              </Button>
            )}
          </div>

          {/* Scan Content */}
          {scanMode === 'qr' && hasQRSupport && (
            <div className="p-0">
              <QrReader className="overflow-clip" onResult={handleOnResult} />
            </div>
          )}

          {scanMode === 'nfc' && hasNFCSupport && (
            <div className="p-4 text-center space-y-4 min-h-[40vh]">
              <div className="text-sm text-muted-foreground">
                {nfcStatus.message}
              </div>
              <div className="space-y-2">
                <div className="flex justify-center">
                  <NfcIcon className={`w-8 h-8 ${nfcStatus.isReading ? 'animate-pulse text-blue-500' : 'text-gray-400'}`} />
                </div>
                {nfcStatus.isReading ? (
                  <>
                    <p className="text-sm">Hold your device near an NFC card...</p>
                    <Button
                      variant="outline"
                      onClick={stopReading}
                      className="w-full"
                    >
                      Stop Reading
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {nfcStatus.isSupported ? 'Ready to scan NFC cards' : 'NFC not supported'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </ResponsiveModal>
  );
}

export default ScanAddressDialog;
