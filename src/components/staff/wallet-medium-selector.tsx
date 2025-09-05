"use client";

import { FileTextIcon, NfcIcon } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { WalletMedium } from "./wallet-creation-types";
import { useWalletCreationContext } from "./wallet-creation-context";

export function WalletMediumSelector() {
  const { handleMediumSelect, nfcStatus } = useWalletCreationContext();
  const MediumCard = ({
    medium,
    icon: Icon,
    title,
    description,
    disabled,
  }: {
    medium: WalletMedium;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    disabled?: boolean;
  }) => (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow hover:border-blue-300",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !disabled && handleMediumSelect(medium)}
    >
      <CardContent className="flex flex-col items-center p-8 text-center">
        <Icon className="w-16 h-16 mb-4 text-blue-500" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Wallet Medium</h2>
        <p className="text-gray-600">Select how you want to store the wallet</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <MediumCard
          medium="paper"
          icon={FileTextIcon}
          title="Paper Wallet"
          description="Printed QR code that can be stored physically"
        />

        <MediumCard
          medium="nfc"
          disabled={!nfcStatus.isSupported}
          icon={NfcIcon}
          title="NFC Wallet"
          description="Digital wallet stored on NFC chip or card"
        />
      </div>
    </div>
  );
}
