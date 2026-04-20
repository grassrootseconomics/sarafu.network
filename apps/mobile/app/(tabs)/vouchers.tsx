import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { getApiBaseUrl } from "@/lib/api-url";
import {
  colors,
  spacing,
  radius,
  shadow,
  type as typography,
} from "@/lib/theme";

type Tab = "offers" | "vouchers";

export default function MarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>("offers");
  const [search, setSearch] = useState("");

  const handleTabSwitch = useCallback(
    (newTab: Tab) => {
      if (newTab !== tab) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTab(newTab);
      }
    },
    [tab]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.largeTitle}>Marketplace</Text>

      <View style={styles.searchBar}>
        <FontAwesome
          name="search"
          size={15}
          color={colors.tertiaryLabel as string}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={
            tab === "offers" ? "Search offers..." : "Search vouchers..."
          }
          placeholderTextColor={colors.tertiaryLabel as string}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {search.length > 0 && Platform.OS === "android" && (
          <Pressable onPress={() => setSearch("")} hitSlop={8}>
            <FontAwesome
              name="times-circle"
              size={16}
              color={colors.tertiaryLabel as string}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.segmentedControl}>
        <Pressable
          style={[styles.segment, tab === "offers" && styles.segmentActive]}
          onPress={() => handleTabSwitch("offers")}
        >
          <Text
            style={[
              styles.segmentText,
              tab === "offers" && styles.segmentTextActive,
            ]}
          >
            Offers
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segment, tab === "vouchers" && styles.segmentActive]}
          onPress={() => handleTabSwitch("vouchers")}
        >
          <Text
            style={[
              styles.segmentText,
              tab === "vouchers" && styles.segmentTextActive,
            ]}
          >
            Vouchers
          </Text>
        </Pressable>
      </View>

      {tab === "offers" ? (
        <OffersTab search={search} />
      ) : (
        <VouchersTab search={search} />
      )}
    </View>
  );
}

function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${getApiBaseUrl()}${url}`;
  return null;
}

function OfferImage({ uri }: { uri: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return (
      <View style={styles.offerImagePlaceholder}>
        <FontAwesome
          name="image"
          size={28}
          color={colors.quaternaryLabel as string}
        />
      </View>
    );
  }

  return (
    <Image
      source={uri}
      style={styles.offerImage}
      contentFit="cover"
      transition={200}
      onError={() => setFailed(true)}
    />
  );
}

function OffersTab({ search }: { search: string }) {
  const router = useRouter();
  const {
    data: offers,
    isLoading,
    refetch,
    isRefetching,
  } = trpc.products.nearbyOffers.useQuery({ limit: 50 });

  const filtered = (offers ?? []).filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.title?.toLowerCase().includes(q) ||
      o.description?.toLowerCase().includes(q) ||
      o.provider?.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      columnWrapperStyle={styles.gridRow}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [
            styles.offerCard,
            pressed && styles.offerCardPressed,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/offer/${item.id}` as any);
          }}
        >
          <OfferImage uri={resolveImageUrl(item.image)} />
          {item.trending && (
            <View style={styles.trendingBadge}>
              <Text style={styles.trendingText}>New</Text>
            </View>
          )}
          <View style={styles.offerContent}>
            <Text style={styles.offerTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {item.price !== null &&
              item.price !== undefined &&
              item.price > 0 && (
                <Text style={styles.offerPrice}>
                  {item.price}{" "}
                  <Text style={styles.offerPriceUnit}>
                    {item.vouchers?.[0] ?? ""}
                  </Text>
                </Text>
              )}
            <View style={styles.offerMeta}>
              <FontAwesome
                name="map-marker"
                size={11}
                color={colors.tertiaryLabel as string}
              />
              <Text style={styles.offerProvider} numberOfLines={1}>
                {item.provider}
              </Text>
            </View>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <FontAwesome
              name="shopping-bag"
              size={32}
              color={colors.tertiaryLabel as string}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {search ? "No results" : "No offers yet"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {search
              ? "Try adjusting your search terms"
              : "Offers from nearby providers will appear here"}
          </Text>
        </View>
      }
    />
  );
}

function VouchersTab({ search }: { search: string }) {
  const {
    data: vouchers,
    isLoading,
    refetch,
    isRefetching,
  } = trpc.voucher.list.useQuery({
    sortBy: "transactions",
    sortDirection: "desc",
  });

  const filtered = (vouchers ?? []).filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.voucher_name?.toLowerCase().includes(q) ||
      v.symbol?.toLowerCase().includes(q) ||
      v.location_name?.toLowerCase().includes(q)
    );
  });

  const handleCardPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.voucher_address}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
      renderItem={({ item }) => (
        <Pressable style={styles.voucherCard} onPress={handleCardPress}>
          <View style={styles.voucherRow}>
            <View style={styles.voucherSymbolContainer}>
              <Text style={styles.voucherSymbol}>{item.symbol}</Text>
            </View>
            <View style={styles.voucherInfo}>
              <Text style={styles.voucherName} numberOfLines={1}>
                {item.voucher_name}
              </Text>
              {item.voucher_description ? (
                <Text style={styles.voucherDesc} numberOfLines={2}>
                  {item.voucher_description}
                </Text>
              ) : null}
              <View style={styles.voucherFooter}>
                {item.location_name ? (
                  <View style={styles.footerItem}>
                    <FontAwesome
                      name="map-marker"
                      size={11}
                      color={colors.tertiaryLabel as string}
                    />
                    <Text style={styles.footerText}>{item.location_name}</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <View style={styles.txnBadge}>
              <Text style={styles.txnBadgeCount}>
                {item.transaction_count ?? 0}
              </Text>
              <Text style={styles.txnBadgeLabel}>txns</Text>
            </View>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <FontAwesome
              name="ticket"
              size={32}
              color={colors.tertiaryLabel as string}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {search ? "No results" : "No vouchers found"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {search
              ? "Try adjusting your search terms"
              : "Community vouchers will appear here"}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  largeTitle: {
    ...typography.largeTitle,
    color: colors.label,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 40,
    backgroundColor: colors.tertiaryFill as string,
    borderRadius: radius.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.label,
    padding: 0,
    height: 40,
  },
  segmentedControl: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.fill as string,
    borderRadius: radius.sm,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: radius.sm - 2,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    ...shadow.sm,
  },
  segmentText: {
    ...typography.subheadline,
    fontWeight: "500",
    color: colors.secondaryLabel as string,
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  gridRow: {
    gap: spacing.md,
  },
  offerCard: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: "hidden",
    maxWidth: "49%",
    ...shadow.md,
  },
  offerCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  offerImage: {
    width: "100%",
    height: 130,
    backgroundColor: colors.tertiaryFill as string,
  },
  offerImagePlaceholder: {
    width: "100%",
    height: 130,
    backgroundColor: colors.quaternaryFill as string,
    alignItems: "center",
    justifyContent: "center",
  },
  trendingBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  trendingText: {
    ...typography.caption2,
    fontWeight: "700",
    color: colors.surface,
  },
  offerContent: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  offerTitle: {
    ...typography.subheadline,
    fontWeight: "600",
    color: colors.label,
  },
  offerPrice: {
    ...typography.subheadline,
    fontWeight: "700",
    color: colors.primary,
  },
  offerPriceUnit: {
    ...typography.caption1,
    fontWeight: "400",
    color: colors.secondaryLabel as string,
  },
  offerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: 2,
  },
  offerProvider: {
    ...typography.caption2,
    color: colors.tertiaryLabel as string,
    flex: 1,
  },
  voucherCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.md,
  },
  voucherRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  voucherSymbolContainer: {
    backgroundColor: colors.primarySoft as string,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.xs,
    alignSelf: "flex-start",
  },
  voucherSymbol: {
    ...typography.headline,
    fontWeight: "700",
    color: colors.primary,
  },
  voucherInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  voucherName: {
    ...typography.headline,
    color: colors.label,
  },
  voucherDesc: {
    ...typography.footnote,
    color: colors.secondaryLabel as string,
    lineHeight: 18,
  },
  voucherFooter: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: 2,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  footerText: {
    ...typography.caption1,
    color: colors.tertiaryLabel as string,
  },
  txnBadge: {
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  txnBadgeCount: {
    ...typography.headline,
    color: colors.secondaryLabel as string,
  },
  txnBadgeLabel: {
    ...typography.caption2,
    color: colors.tertiaryLabel as string,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: spacing.xxl,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.quaternaryFill as string,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.headline,
    color: colors.label,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.subheadline,
    color: colors.secondaryLabel as string,
    textAlign: "center",
    lineHeight: 22,
  },
});
