"use client";

import { AlertTriangleIcon } from "lucide-react";
import Address from "~/components/address";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { addressFromQRContent } from "~/utils/paper-wallet";
import ENSName from "../ens-name";

interface WalletInfo {
  address: `0x${string}`;
  ensName: string;
}

interface NFCOverwriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  existingData?: string;
  newWallet?: WalletInfo;
}

export function NFCOverwriteDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  existingData,
  newWallet,
}: NFCOverwriteDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };
  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };
  const existingAddress = existingData
    ? addressFromQRContent(existingData)
    : undefined;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm sm:max-w-lg mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangleIcon className="w-5 h-5" />
            NFC Tag Contains Data
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-3">
            <p>
              This NFC tag already contains data. Overwriting will permanently
              replace the existing data with the new wallet information.
            </p>

            {/* New Wallet Information */}
            {newWallet && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 text-sm mb-2">
                  New Wallet Data
                </h4>
                <div className="space-y-2">
                  <InfoRow
                    label="Address"
                    value={
                      <Address
                        disableENS
                        address={newWallet.address}
                        forceTruncate
                        className="font-mono text-green-800 text-xs"
                      />
                    }
                  />
                  <InfoRow
                    label="ENS Name"
                    value={
                      <Badge variant="secondary" className="font-mono text-xs">
                        <ENSName address={newWallet.address} />
                      </Badge>
                    }
                  />
                </div>
              </div>
            )}

            {/* Existing Data */}
            {existingData && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 text-sm mb-2">
                  Existing Data (Will be Lost)
                </h4>
                <div className="space-y-2">
                  <InfoRow
                    label="Address"
                    value={
                      <Address
                        truncate
                        disableENS
                        address={existingAddress}
                        className="font-mono text-red-800 text-xs"
                      />
                    }
                  />
                  <InfoRow
                    label="ENS Name"
                    value={
                      <ENSName
                        address={existingAddress}
                        className="font-mono text-red-800 text-xs"
                      />
                    }
                  />
                  <InfoRow
                    label="Current Data"
                    value={
                      <Badge
                        variant="outline"
                        className="font-mono text-xs break-all"
                      >
                        {existingData.length > 50
                          ? `${existingData.slice(0, 50)}...`
                          : existingData}
                      </Badge>
                    }
                  />
                  <InfoRow
                    label="Data Type"
                    value={
                      <Badge variant="secondary">
                        {existingData.startsWith("http") ? "URL" : "Text"}
                      </Badge>
                    }
                  />
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogAction
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </AlertDialogAction>
          <AlertDialogAction
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            Overwrite Data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <Label className="text-amber-700 text-xs shrink-0">{label}:</Label>
      <div className="text-right">{value}</div>
    </div>
  );
}
