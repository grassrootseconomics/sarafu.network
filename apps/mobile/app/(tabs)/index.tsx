import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import {
  useVoucherBalances,
  formatTokenAmount,
  type VoucherBalance,
} from "@/lib/token";
import { SendModal } from "@/components/send-modal";
import { ReceiveModal } from "@/components/receive-modal";
import { VoucherSelectorModal } from "@/components/voucher-selector-modal";
import { TransactionItem } from "@/components/transaction-item";
import {
  colors,
  type as typeScale,
  spacing,
  radius,
  shadow,
  sectionHeader,
} from "@/lib/theme";
import type { Address } from "viem";

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { address } = useAuth();
  const [sendVisible, setSendVisible] = useState(false);
  const [receiveVisible, setReceiveVisible] = useState(false);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const utils = trpc.useUtils();
  const { data: me } = trpc.me.get.useQuery();
  const { data: gasStatus } = trpc.me.gasStatus.useQuery();
  const requestGas = trpc.me.requestGas.useMutation();
  const { vouchers, isLoading: balancesLoading } = useVoucherBalances(address);

  const eventsQuery = trpc.me.events.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (last) => last.nextCursor }
  );
  const events = eventsQuery.data?.pages.flatMap((p) => p.events) ?? [];

  const primaryAddress = me?.default_voucher;
  const primaryVoucher = vouchers.find(
    (v) => v.address.toLowerCase() === primaryAddress?.toLowerCase()
  );
  const primaryBalance = primaryVoucher
    ? formatTokenAmount(primaryVoucher.balance, primaryVoucher.decimals)
    : "0";
  const primarySymbol = primaryVoucher?.symbol ?? "---";

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      utils.me.get.invalidate(),
      utils.me.events.invalidate(),
      utils.me.vouchers.invalidate(),
      utils.me.gasStatus.invalidate(),
    ]);
    setRefreshing(false);
  }, [utils]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Balance Card */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectorVisible(true);
          }}
          style={({ pressed }) => [pressed && { opacity: 0.95 }]}
        >
          <LinearGradient
            colors={["#16a34a", "#15803d"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              {balancesLoading ? "..." : primaryBalance}
            </Text>
            <Text style={styles.balanceSymbol}>{primarySymbol}</Text>
            {vouchers.length > 1 && (
              <View style={styles.switchHintRow}>
                <FontAwesome
                  name="exchange"
                  size={10}
                  color="rgba(255,255,255,0.5)"
                />
                <Text style={styles.switchHint}>Tap to switch voucher</Text>
              </View>
            )}
            {address && (
              <View style={styles.addressPill}>
                <Text style={styles.addressText}>
                  {truncateAddress(address)}
                </Text>
              </View>
            )}
          </LinearGradient>
        </Pressable>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSendVisible(true);
            }}
          >
            <View style={styles.actionIconCircle}>
              <FontAwesome name="arrow-up" size={18} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Send</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setReceiveVisible(true);
            }}
          >
            <View style={styles.actionIconCircle}>
              <FontAwesome name="arrow-down" size={18} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Receive</Text>
          </Pressable>
        </View>

        {/* Gas Banner */}
        {gasStatus === "NONE" && (
          <Pressable
            style={({ pressed }) => [
              styles.gasBanner,
              pressed && styles.gasBannerPressed,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              requestGas.mutate();
            }}
            disabled={requestGas.isPending}
          >
            <View style={styles.gasBannerIcon}>
              <FontAwesome name="bolt" size={12} color={colors.orange} />
            </View>
            <Text style={styles.gasBannerText}>
              {requestGas.isPending
                ? "Requesting gas..."
                : "You need gas to transact. Tap to request."}
            </Text>
            <FontAwesome
              name="chevron-right"
              size={10}
              color={colors.tertiaryLabel as string}
            />
          </Pressable>
        )}

        {/* My Holdings */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>MY HOLDINGS</Text>
          <View style={styles.holdingsCard}>
            {balancesLoading ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ paddingVertical: spacing.xl }}
              />
            ) : vouchers.length === 0 ? (
              <View style={styles.emptyHoldings}>
                <FontAwesome
                  name="ticket"
                  size={24}
                  color={colors.tertiaryLabel as string}
                />
                <Text style={styles.emptyText}>No vouchers held yet</Text>
              </View>
            ) : (
              vouchers.map((v, i) => {
                const bal = formatTokenAmount(v.balance, v.decimals);
                const isPrimary =
                  v.address.toLowerCase() === primaryAddress?.toLowerCase();
                const isLast = i === vouchers.length - 1;
                return (
                  <View
                    key={v.address}
                    style={[
                      styles.holdingRow,
                      !isLast && styles.holdingRowBorder,
                    ]}
                  >
                    <View style={styles.holdingLeft}>
                      <View
                        style={[
                          styles.holdingSymbolBadge,
                          isPrimary && styles.holdingSymbolBadgePrimary,
                        ]}
                      >
                        <Text
                          style={[
                            styles.holdingSymbol,
                            isPrimary && styles.holdingSymbolPrimary,
                          ]}
                        >
                          {v.symbol}
                        </Text>
                      </View>
                      <View style={styles.holdingInfo}>
                        <Text style={styles.holdingName} numberOfLines={1}>
                          {v.name}
                        </Text>
                        {isPrimary && (
                          <Text style={styles.holdingPrimaryBadge}>
                            Primary
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.holdingBalance}>{bal}</Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          <View style={styles.activityCard}>
            {eventsQuery.isLoading ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ paddingVertical: spacing.xl }}
              />
            ) : events.length === 0 ? (
              <View style={styles.emptyHoldings}>
                <FontAwesome
                  name="exchange"
                  size={24}
                  color={colors.tertiaryLabel as string}
                />
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            ) : (
              <>
                {events.slice(0, 10).map((e) => (
                  <TransactionItem
                    key={`${e.tx_hash}-${e.id}`}
                    event={e as any}
                    userAddress={address ?? ""}
                  />
                ))}
                {(eventsQuery.hasNextPage || events.length > 10) && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.loadMore,
                      pressed && styles.loadMorePressed,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      eventsQuery.fetchNextPage();
                    }}
                    disabled={eventsQuery.isFetchingNextPage}
                  >
                    {eventsQuery.isFetchingNextPage ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text style={styles.loadMoreText}>View all activity</Text>
                    )}
                  </Pressable>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <SendModal
        visible={sendVisible}
        onClose={() => setSendVisible(false)}
        vouchers={vouchers}
        defaultVoucher={primaryAddress as Address | undefined}
        userAddress={address ?? ""}
      />
      <ReceiveModal
        visible={receiveVisible}
        onClose={() => setReceiveVisible(false)}
        address={address ?? ""}
      />
      <VoucherSelectorModal
        visible={selectorVisible}
        onClose={() => setSelectorVisible(false)}
        currentVoucher={primaryAddress}
        vouchers={vouchers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.xxxl + spacing.xl,
  },
  // Balance card
  balanceCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    ...shadow.lg,
  },
  balanceLabel: {
    ...typeScale.footnote,
    color: "rgba(255,255,255,0.7)",
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
  },
  balanceSymbol: {
    ...typeScale.headline,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  switchHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  switchHint: {
    ...typeScale.caption2,
    color: "rgba(255,255,255,0.5)",
  },
  addressPill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  addressText: {
    ...typeScale.caption1,
    fontFamily: "monospace",
    color: "rgba(255,255,255,0.7)",
  },
  // Actions
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xxl + spacing.md,
    paddingVertical: spacing.xl,
  },
  actionButton: {
    alignItems: "center",
    gap: spacing.sm,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.colored(colors.primary),
  },
  actionLabel: {
    ...typeScale.caption1,
    fontWeight: "600",
    color: colors.label,
  },
  // Gas banner
  gasBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    ...shadow.sm,
  },
  gasBannerPressed: {
    opacity: 0.8,
  },
  gasBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.orange}14`,
    alignItems: "center",
    justifyContent: "center",
  },
  gasBannerText: {
    ...typeScale.footnote,
    color: colors.secondaryLabel as string,
    flex: 1,
  },
  // Section
  sectionWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...sectionHeader,
    marginBottom: spacing.sm,
  },
  // Holdings card
  holdingsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.sm,
  },
  holdingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  holdingRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator as string,
  },
  holdingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
    marginRight: spacing.md,
  },
  holdingSymbolBadge: {
    backgroundColor: colors.tertiaryFill as string,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.xs,
  },
  holdingSymbolBadgePrimary: {
    backgroundColor: colors.primarySoft as string,
  },
  holdingSymbol: {
    ...typeScale.footnote,
    fontWeight: "700",
    color: colors.secondaryLabel as string,
  },
  holdingSymbolPrimary: {
    color: colors.primary,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingName: {
    ...typeScale.subheadline,
    fontWeight: "500",
    color: colors.label,
  },
  holdingPrimaryBadge: {
    ...typeScale.caption2,
    color: colors.primary,
    marginTop: 1,
  },
  holdingBalance: {
    ...typeScale.subheadline,
    fontWeight: "700",
    color: colors.label,
  },
  // Activity card
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.sm,
  },
  // Empty
  emptyHoldings: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    ...typeScale.subheadline,
    color: colors.tertiaryLabel as string,
  },
  // Load more
  loadMore: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  loadMorePressed: {
    opacity: 0.7,
  },
  loadMoreText: {
    ...typeScale.subheadline,
    fontWeight: "500",
    color: colors.primary,
  },
});
