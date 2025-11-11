"use client";

import { Copy, MapPin, QrCode, Share2 } from "lucide-react";
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

/**
 * Public profile data structure
 */
export interface PublicProfile {
  given_names: string | null;
  location_name: string | null;
  address: string;
  avatar: string | null;
}

/**
 * Profile header component props
 */
interface ProfileHeaderProps {
  user: PublicProfile;
  address: string;
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
export function ProfileHeader({ user, address }: ProfileHeaderProps) {
  const [showQRDialog, setShowQRDialog] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    } catch {
      toast.error("Failed to copy address");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: user.given_names ?? "User Profile",
      text: `Check out ${user.given_names ?? "this user"}'s profile on Sarafu Network`,
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
      <div className="bg-gradient-to-br from-primary/5 via-background to-background border border-border rounded-2xl overflow-hidden">
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
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  {user.given_names || "Anonymous User"}
                </h1>

                {user.location_name && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{user.location_name}</span>
                  </div>
                )}

                <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2 border border-border">
                  <Address address={address} forceTruncate className="text-sm font-mono" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleCopyAddress}
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full"
                >
                  <Copy className="w-4 h-4" />
                  Copy Address
                </Button>

                <Button
                  onClick={() => setShowQRDialog(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full"
                >
                  <QrCode className="w-4 h-4" />
                  QR Code
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full"
                >
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
            <DialogDescription>

            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6 bg-muted/30 rounded-lg">
            <AddressQRCode address={address}  size={256}  />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
