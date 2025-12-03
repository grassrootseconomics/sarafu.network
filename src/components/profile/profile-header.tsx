"use client";

import { Copy, QrCode, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Address from "~/components/address";
import Identicon from "~/components/identicon";
import AddressQRCode from "~/components/qr-code/address-qr-code";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useENS } from "~/lib/sarafu/resolver";

/**
 * Profile header component props
 */
interface ProfileHeaderProps {
  address: `0x${string}`;
}

/**
 * Profile header component displaying user information and action buttons
 *
 * Modern, clean design with:
 * - Large avatar with subtle shadow
 * - Clear typography hierarchy
 * - Compact action buttons
 * - Responsive layout
 */
export function ProfileHeader({ address }: ProfileHeaderProps) {
  const [showQRDialog, setShowQRDialog] = useState(false);
  const { data: ens } = useENS({ address });
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    } catch {
      toast.error("Failed to copy address");
    }
  };
  const displayName = ens?.name || address.slice(0, 10) + "...";
  const handleShare = async () => {
    const shareData = {
      title: displayName ?? "User Profile",
      text: `Check out this user's profile on Sarafu Network`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to share profile");
        }
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied to clipboard");
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <>
      <div className="">
        <div className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-2 border-border shadow-lg">
                  <Identicon address={address} size={128} />
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex flex-1 flex-col min-w-0 justify-evenly">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                <Address truncate address={address} className="" />
              </h1>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleCopyAddress} variant="outline" size="sm">
                  <Copy className="w-4 h-4" />
                  Copy Address
                </Button>

                <Button
                  onClick={() => setShowQRDialog(true)}
                  variant="outline"
                  size="sm"
                >
                  <QrCode className="w-4 h-4" />
                  QR Code
                </Button>

                <Button onClick={handleShare} variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile QR Code</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6 bg-muted/30 rounded-lg">
            <AddressQRCode address={address} size={256} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
