"use client";

import { motion } from "framer-motion";
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

// Apple-like spring animation
const smoothSpring = {
  type: "spring" as const,
  stiffness: 150,
  damping: 25,
};

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
      <div className="px-2 md:px-0">
        <div className="py-4 md:py-6">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center md:items-start">
            {/* Avatar - Clean, minimal design */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              transition={smoothSpring}
            >
              <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-[1.75rem] overflow-hidden ring-1 ring-border/20 shadow-xl">
                <Identicon address={address} size={144} />
              </div>
            </motion.div>

            {/* User Info */}
            <div className="flex flex-1 flex-col min-w-0 items-center md:items-start gap-5">
              <motion.h1
                className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...smoothSpring, delay: 0.1 }}
              >
                <Address truncate address={address} className="" />
              </motion.h1>

              {/* Action Buttons - Pill style */}
              <motion.div
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...smoothSpring, delay: 0.2 }}
              >
                <Button
                  onClick={handleCopyAddress}
                  variant="outline"
                  size="sm"
                  className="rounded-full px-5 border-border/40 hover:border-border hover:bg-accent/5 transition-all duration-300"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>

                <Button
                  onClick={() => setShowQRDialog(true)}
                  variant="outline"
                  size="sm"
                  className="rounded-full px-5 border-border/40 hover:border-border hover:bg-accent/5 transition-all duration-300"
                >
                  <QrCode className="w-4 h-4" />
                  QR Code
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="rounded-full px-5 border-border/40 hover:border-border hover:bg-accent/5 transition-all duration-300"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </motion.div>
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
