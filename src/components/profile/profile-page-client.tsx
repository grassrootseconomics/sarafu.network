"use client";

import { motion } from "framer-motion";
import { getAddress } from "viem";
import { ContentContainer } from "~/components/layout/content-container";
import { useAuth } from "~/hooks/useAuth";
import { ProfileEditTab } from "./profile-edit-tab";
import { ProfileHeader } from "./profile-header";
import { ProfileStats } from "./profile-stats";
import { ProfileTabs } from "./profile-tabs";
import { UserBalances } from "./user-balances";
import { UserPoolList } from "./user-pool-list";
import { UserReportsList } from "./user-reports-list";
import { UserTransactionList } from "./user-transaction-list";
import { UserVoucherGrid } from "./user-voucher-grid";

// Apple-like animation configurations
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 20,
    },
  },
};

/**
 * Props for ProfilePageClient component
 */
interface ProfilePageClientProps {
  address: `0x${string}`;
}

/**
 * Client-side profile page component
 *
 * This component handles the interactive parts of the profile page
 * while receiving initial data from the server for SEO and performance.
 *
 * Features:
 * - Profile header with user information
 * - Profile statistics (trading partners, transactions, balances, swaps)
 * - Tabbed navigation (Transactions, Vouchers, Pools, Reports)
 * - Integrated transaction list, voucher grid, and pool list components
 * - Edit mode when viewing your own profile (shows Settings tab)
 *
 */
export function ProfilePageClient({ address }: ProfilePageClientProps) {
  const auth = useAuth();

  // Check if viewing own profile
  const isOwnProfile =
    auth?.account?.address &&
    getAddress(auth.account.address) === getAddress(address);

  return (
    <ContentContainer>
      <div className="w-full max-w-7xl mx-auto sm:px-6 lg:px-8">
        <motion.div
          className="space-y-12 md:space-y-16 py-10 md:py-14"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Profile Header */}
          <motion.div variants={fadeInUp}>
            <ProfileHeader address={address} />
          </motion.div>

          {/* Profile Tabs with all content */}
          <motion.div variants={fadeInUp}>
            <ProfileTabs
              statsContent={<ProfileStats address={address} />}
              transactionsContent={<UserTransactionList address={address} />}
              vouchersContent={<UserVoucherGrid address={address} isOwnProfile={isOwnProfile} />}
              balancesContent={<UserBalances address={address} isOwnProfile={isOwnProfile} />}
              poolsContent={<UserPoolList address={address} isOwnProfile={isOwnProfile} />}
              reportsContent={<UserReportsList address={address} isOwnProfile={isOwnProfile} />}
              settingsContent={isOwnProfile ? <ProfileEditTab /> : undefined}
              defaultTab="balances"
              isOwnProfile={isOwnProfile}
            />
          </motion.div>
        </motion.div>
      </div>
    </ContentContainer>
  );
}
