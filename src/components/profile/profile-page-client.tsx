"use client";

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
        <div className="space-y-8 py-8">
          {/* Profile Header */}
          <ProfileHeader address={address} />

          {/* Profile Tabs with all content */}
          <ProfileTabs
            statsContent={<ProfileStats address={address} />}
            transactionsContent={<UserTransactionList address={address} />}
            vouchersContent={<UserVoucherGrid address={address} />}
            balancesContent={<UserBalances address={address} />}
            poolsContent={<UserPoolList address={address} />}
            reportsContent={<UserReportsList address={address} />}
            settingsContent={isOwnProfile ? <ProfileEditTab /> : undefined}
            defaultTab="balances"
          />
        </div>
      </div>
    </ContentContainer>
  );
}
