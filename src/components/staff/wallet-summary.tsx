"use client";

import { ShieldCheckIcon } from "lucide-react";
import Address from "~/components/address";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

interface CreatedWallet {
  address: `0x${string}`;
  privateKey: `0x${string}`;
  ensName: string;
}

interface WalletSummaryProps {
  wallet: CreatedWallet;
  onReset: () => void;
}

export function WalletSummary({ wallet, onReset }: WalletSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-3">
          Wallet Created Successfully!
        </h3>

        <div className="space-y-3 text-sm">
          <WalletInfoRow
            label="Address"
            value={
              <Address
                disableENS
                address={wallet.address}
                forceTruncate
                className="font-mono text-green-800"
              />
            }
          />

          <WalletInfoRow
            label="ENS Name"
            value={
              <Badge variant="secondary" className="font-mono">
                {wallet.ensName}
              </Badge>
            }
          />

          <WalletInfoRow
            label="Gas Approved"
            value={
              <Badge variant="default" className="bg-green-600">
                <ShieldCheckIcon className="w-3 h-3 mr-1" />
                Yes
              </Badge>
            }
          />
        </div>
      </div>

      <Button onClick={onReset} variant="outline" className="w-full">
        Create Another Wallet
      </Button>
    </div>
  );
}

function WalletInfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center">
      <Label className="text-green-700">{label}:</Label>
      {value}
    </div>
  );
}
