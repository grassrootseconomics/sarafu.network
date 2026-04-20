import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { TransactionItem } from "@/components/transaction-item";
import {
  colors,
  type as typeScale,
  spacing,
  radius,
  shadow,
} from "@/lib/theme";

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

type ActiveTab = "vouchers" | "activity";

export default function PublicProfileScreen() {
  const { address } = useLocalSearchParams<{ address: string }>();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("vouchers");
  const [refreshing, setRefreshing] = useState(false);

  const utils = trpc.useUtils();

  const { data: stats, isLoading: statsLoading } =
    trpc.profile.getUserStats.useQuery(
      { address: address! },
      { enabled: !!address }
    );

  const { data: vouchers, isLoading: vouchersLoading } =
    trpc.profile.getUserVouchers.useQuery(
      { address: address! },
      { enabled: !!address }
    );

  const txQuery = trpc.profile.getUserTransactions.useInfiniteQuery(
    { address: address!, limit: 20 },
    {
      getNextPageParam: (last) => last.nextCursor,
      enabled: !!address,
    }
  );
  const transactions =
    txQuery.data?.pages.flatMap((p) => p.transactions) ?? [];

  async function handleCopy() {
    if (address) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Clipboard.setStringAsync(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const onRefresh = useCallback(async () => {
    if (!address) return;
    setRefreshing(true);
    await Promise.all([
      utils.profile.getUserStats.invalidate({ address }),
      utils.profile.getUserVouchers.invalidate({ address }),
      utils.profile.getUserTransactions.invalidate({ address }),
    ]);
    setRefreshing(false);
  }, [address, utils]);

  function handleTabChange(tab: ActiveTab) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  }

  const totalPartners =
    (stats?.uniquePartnersInward ?? 0) + (stats?.uniquePartnersOutward ?? 0);
  const totalTx =
    (stats?.transactionsIn ?? 0) + (stats?.transactionsOut ?? 0);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header bar */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.backBtnPressed,
          ]}
        >
          <FontAwesome
            name="chevron-left"
            size={16}
            color={colors.secondaryLabel as string}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Avatar + Address */}
      <View style={styles.profileSection}>
        <LinearGradient
          colors={["#34C759", "#16a34a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <FontAwesome name="user" size={28} color="#fff" />
        </LinearGradient>

        <Pressable onPress={handleCopy} style={styles.addressPill}>
          <Text style={styles.addressText}>
            {address ? truncateAddress(address) : ""}
          </Text>
          <FontAwesome
            name={copied ? "check" : "copy"}
            size={12}
            color={
              copied ? colors.green : (colors.secondaryLabel as string)
            }
          />
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Linking.openURL(`https://celoscan.io/address/${address}`);
          }}
          style={styles.celoscanBtn}
        >
          <Text style={styles.celoscanText}>View on Celoscan</Text>
          <FontAwesome name="external-link" size={10} color={colors.blue} />
        </Pressable>
      </View>

      {/* Stats grid */}
      {statsLoading ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={{ marginVertical: spacing.lg }}
        />
      ) : stats ? (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: `${colors.green}14` },
              ]}
            >
              <FontAwesome name="users" size={14} color={colors.green} />
            </View>
            <Text style={styles.statValue}>{totalPartners}</Text>
            <Text style={styles.statLabel}>Partners</Text>
            <View style={styles.statSub}>
              <Text style={styles.statSubIn}>
                {stats.uniquePartnersInward} in
              </Text>
              <Text style={styles.statSubOut}>
                {stats.uniquePartnersOutward} out
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: `${colors.green}14` },
              ]}
            >
              <FontAwesome name="line-chart" size={14} color={colors.green} />
            </View>
            <Text style={styles.statValue}>{totalTx}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
            <View style={styles.statSub}>
              <Text style={styles.statSubIn}>
                {stats.transactionsIn} in
              </Text>
              <Text style={styles.statSubOut}>
                {stats.transactionsOut} out
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: `${colors.blue}14` },
              ]}
            >
              <FontAwesome name="refresh" size={14} color={colors.blue} />
            </View>
            <Text style={styles.statValue}>{stats.totalSwaps}</Text>
            <Text style={styles.statLabel}>Swaps</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: `${colors.purple}14` },
              ]}
            >
              <FontAwesome
                name="credit-card"
                size={14}
                color={colors.purple}
              />
            </View>
            <Text style={styles.statValue}>{stats.totalVouchersHeld}</Text>
            <Text style={styles.statLabel}>Holdings</Text>
          </View>
        </View>
      ) : null}

      {/* Segmented control tabs */}
      <View style={styles.segmentedOuter}>
        <View style={styles.segmentedTrack}>
          <Pressable
            onPress={() => handleTabChange("vouchers")}
            style={[
              styles.segmentedTab,
              activeTab === "vouchers" && styles.segmentedTabActive,
            ]}
          >
            <Text
              style={[
                styles.segmentedText,
                activeTab === "vouchers" && styles.segmentedTextActive,
              ]}
            >
              Vouchers
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleTabChange("activity")}
            style={[
              styles.segmentedTab,
              activeTab === "activity" && styles.segmentedTabActive,
            ]}
          >
            <Text
              style={[
                styles.segmentedText,
                activeTab === "activity" && styles.segmentedTextActive,
              ]}
            >
              Activity
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Tab content */}
      {activeTab === "vouchers" && (
        <View style={styles.tabContent}>
          {vouchersLoading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ marginTop: spacing.xl }}
            />
          ) : !vouchers?.length ? (
            <Text style={styles.emptyText}>No vouchers held</Text>
          ) : (
            vouchers.map((v) => (
              <View key={v.voucher_address} style={styles.voucherCard}>
                <View style={styles.voucherRow}>
                  <View style={styles.voucherInfo}>
                    <Text style={styles.voucherSymbol}>{v.symbol}</Text>
                    <Text style={styles.voucherName} numberOfLines={1}>
                      {v.voucher_name}
                    </Text>
                  </View>
                  <View style={styles.voucherBadge}>
                    <Text style={styles.voucherBadgeText}>
                      {v.voucher_type}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {activeTab === "activity" && (
        <View style={styles.tabContent}>
          {txQuery.isLoading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ marginTop: spacing.xl }}
            />
          ) : transactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions</Text>
          ) : (
            <View style={styles.activityCard}>
              {transactions.map((tx) => (
                <TransactionItem
                  key={`${tx.tx_hash}-${tx.id}`}
                  event={tx}
                  userAddress={address ?? ""}
                />
              ))}
              {txQuery.hasNextPage && (
                <Pressable
                  style={styles.loadMore}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    txQuery.fetchNextPage();
                  }}
                  disabled={txQuery.isFetchingNextPage}
                >
                  {txQuery.isFetchingNextPage ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={styles.loadMoreText}>Load more</Text>
                  )}
                </Pressable>
              )}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.tertiaryFill as string,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnPressed: {
    backgroundColor: colors.secondaryFill as string,
  },
  headerTitle: {
    ...typeScale.headline,
    color: colors.label,
  },
  headerSpacer: {
    width: 36,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator as string,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  addressPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.tertiaryFill as string,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  addressText: {
    ...typeScale.footnote,
    fontFamily: "monospace",
    color: colors.label,
  },
  celoscanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: spacing.sm,
    paddingVertical: 4,
  },
  celoscanText: {
    ...typeScale.caption1,
    color: colors.blue,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    padding: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
    ...shadow.sm,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: {
    ...typeScale.title2,
    color: colors.label,
    marginTop: 2,
  },
  statLabel: {
    ...typeScale.caption1,
    color: colors.secondaryLabel as string,
  },
  statSub: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: 4,
  },
  statSubIn: {
    ...typeScale.caption2,
    color: colors.green,
  },
  statSubOut: {
    ...typeScale.caption2,
    color: colors.secondaryLabel as string,
  },
  segmentedOuter: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  segmentedTrack: {
    flexDirection: "row",
    backgroundColor: colors.tertiaryFill as string,
    borderRadius: radius.sm,
    padding: 3,
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: radius.sm - 2,
  },
  segmentedTabActive: {
    backgroundColor: colors.surface,
    ...shadow.sm,
  },
  segmentedText: {
    ...typeScale.subheadline,
    fontWeight: "500",
    color: colors.secondaryLabel as string,
  },
  segmentedTextActive: {
    color: colors.label,
    fontWeight: "600",
  },
  tabContent: {
    paddingHorizontal: spacing.lg,
  },
  voucherCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  voucherRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  voucherInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  voucherSymbol: {
    ...typeScale.subheadline,
    fontWeight: "700",
    color: colors.primary,
  },
  voucherName: {
    ...typeScale.subheadline,
    color: colors.secondaryLabel as string,
    flex: 1,
  },
  voucherBadge: {
    backgroundColor: colors.quaternaryFill as string,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  voucherBadgeText: {
    ...typeScale.caption2,
    fontWeight: "500",
    color: colors.secondaryLabel as string,
    textTransform: "capitalize",
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.sm,
  },
  emptyText: {
    textAlign: "center",
    ...typeScale.subheadline,
    color: colors.tertiaryLabel as string,
    marginTop: spacing.xxl,
  },
  loadMore: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  loadMoreText: {
    ...typeScale.subheadline,
    fontWeight: "500",
    color: colors.primary,
  },
});
