"use client";

import { getAddress } from "viem";
import { ContentContainer } from "~/components/layout/content-container";
import { useAuth } from "~/hooks/useAuth";
import { ProfileEditTab } from "./profile-edit-tab";
import { ProfileHeader, type PublicProfile } from "./profile-header";
import { ProfileTabs } from "./profile-tabs";
import { UserPoolList } from "./user-pool-list";
import { UserReportsList } from "./user-reports-list";
import { UserTransactionList } from "./user-transaction-list";
import { UserVoucherGrid } from "./user-voucher-grid";

/**
 * Props for ProfilePageClient component
 */
interface ProfilePageClientProps {
  address: string;
  initialProfile: PublicProfile;
}

/**
 * Client-side profile page component
 *
 * This component handles the interactive parts of the profile page
 * while receiving initial data from the server for SEO and performance.
 *
 * Features:
 * - Profile header with user information
 * - Tabbed navigation (Transactions, Vouchers, Pools)
 * - Integrated transaction list, voucher grid, and pool list components
 * - Edit mode when viewing your own profile (shows Settings tab)
 *
 * OPTIMIZED: Now uses actual components instead of placeholders
 * MERGED: Combines public profile view and personal wallet profile edit
 */
export function ProfilePageClient({
  address,
  initialProfile,
}: ProfilePageClientProps) {
  const auth = useAuth();

  // Check if viewing own profile
  const isOwnProfile =
    auth?.account?.address &&
    getAddress(auth.account.address) === getAddress(address);

  return (
    <ContentContainer>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Profile Header */}
        <ProfileHeader user={initialProfile} address={address} />

        {/* Profile Tabs with actual components */}
        <ProfileTabs
          transactionsContent={<UserTransactionList address={address} />}
          vouchersContent={<UserVoucherGrid address={address} />}
          poolsContent={<UserPoolList address={address} />}
          reportsContent={<UserReportsList address={address} />}
          settingsContent={
            isOwnProfile ? <ProfileEditTab /> : undefined
          }
          defaultTab="transactions"
        />
      </div>
    </ContentContainer>
  );
}
