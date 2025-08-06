"use client";

import { LockIcon, LockOpenIcon } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { useAuth } from "~/hooks/useAuth";
import type { WalletEncryption, WalletMedium } from "./wallet-creation-types";

interface WalletEncryptionSelectorProps {
  medium: WalletMedium;
  onSelect: (encryption: WalletEncryption, autoApproveGas?: boolean) => void;
  onBack: () => void;
}

export function WalletEncryptionSelector({
  medium,
  onSelect,
  onBack,
}: WalletEncryptionSelectorProps) {
  const auth = useAuth();
  const [autoApprove, setAutoApprove] = useState(false);

  const EncryptionCard = ({
    encryption,
    icon: Icon,
    title,
    description,
  }: {
    encryption: WalletEncryption;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }) => (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow hover:border-blue-300"
      onClick={() => onSelect(encryption, autoApprove)}
    >
      <CardContent className="flex flex-col items-center p-6 text-center">
        <Icon className="w-12 h-12 mb-3 text-blue-500" />
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">
          Choose Encryption for {medium === "paper" ? "Paper" : "NFC"} Wallet
        </h2>
        <p className="text-gray-600">
          {medium === "paper"
            ? "Encrypt your paper wallet for additional security"
            : "Encrypt your NFC wallet to require a password"}
        </p>
      </div>

      {/* Staff Auto-Approve Checkbox */}
      {auth?.isStaff && (
        <div className="flex items-center justify-center space-x-2">
          <Checkbox
            id="auto-approve"
            checked={autoApprove}
            onCheckedChange={(checked) => setAutoApprove(checked === true)}
          />
          <Label
            htmlFor="auto-approve"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Auto-approve gas sponsorship
          </Label>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <EncryptionCard
          encryption="encrypted"
          icon={LockIcon}
          title="Encrypted"
          description="Requires password to access wallet"
        />

        <EncryptionCard
          encryption="none"
          icon={LockOpenIcon}
          title="No Encryption"
          description="Direct access without password"
        />
      </div>
    </div>
  );
}
