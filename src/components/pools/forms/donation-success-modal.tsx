import { motion } from "framer-motion";
import { PartyPopper } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface DonationSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DonationSuccessModal({
  open,
  onOpenChange,
}: DonationSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="flex justify-center"
            >
              <div className="bg-primary/10 p-3 rounded-full">
                <PartyPopper className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
          </DialogTitle>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DialogTitle className="text-2xl font-bold text-center mt-4">
              Thank You for Your Donation!
            </DialogTitle>
            <DialogDescription className="text-center mt-2">
              Your generosity helps make a real difference. We appreciate your
              support!
            </DialogDescription>
          </motion.div>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <Button
            variant="default"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Continue Browsing
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
