import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors, type as typeScale, spacing } from "@/lib/theme";

type Event = {
  tx_hash: string;
  date_block: string;
  event_type: string;
  from_address: string;
  to_address: string;
  token_in_address: string;
  token_out_address: string;
  token_in_value: string;
  token_out_value: string;
  id: number;
  tx_id: number | null;
};

const EVENT_CONFIG: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  token_transfer: { icon: "arrow-right", label: "Transfer", color: "#6b7280" },
  token_mint: { icon: "plus-circle", label: "Mint", color: colors.green },
  token_burn: { icon: "fire", label: "Burn", color: colors.red },
  pool_deposit: { icon: "arrow-up", label: "Pool Deposit", color: colors.purple },
  pool_swap: { icon: "refresh", label: "Swap", color: colors.blue },
  faucet_give: { icon: "gift", label: "Faucet", color: colors.orange },
};

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatAmount(raw: string): string {
  const n = Number(raw);
  if (isNaN(n)) return raw;
  const val = n / 1e18;
  if (val < 0.01 && val > 0) return "<0.01";
  return val.toFixed(2);
}

export function TransactionItem({
  event,
  userAddress,
}: {
  event: Event;
  userAddress: string;
}) {
  const router = useRouter();
  const config = EVENT_CONFIG[event.event_type] ?? {
    icon: "exchange",
    label: event.event_type,
    color: "#6b7280",
  };

  const isIncoming =
    event.to_address?.toLowerCase() === userAddress.toLowerCase();
  const counterparty = isIncoming ? event.from_address : event.to_address;
  const isSwap = event.event_type === "pool_swap";

  function openExplorer() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`https://celoscan.io/tx/${event.tx_hash}`);
  }

  function openProfile() {
    if (counterparty) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/profile/${counterparty}` as any);
    }
  }

  return (
    <Pressable
      onPress={openExplorer}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
      <View
        style={[
          styles.icon,
          { backgroundColor: `${config.color}14` },
        ]}
      >
        <FontAwesome
          name={config.icon as any}
          size={16}
          color={config.color}
        />
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.label}>{config.label}</Text>
          {isSwap ? (
            <View style={styles.swapAmount}>
              <Text style={styles.amountOut}>
                -{formatAmount(event.token_in_value)}
              </Text>
              <View style={styles.swapArrow}>
                <FontAwesome
                  name="long-arrow-right"
                  size={10}
                  color={colors.tertiaryLabel as string}
                />
              </View>
              <Text style={styles.amountIn}>
                +{formatAmount(event.token_out_value)}
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.amount,
                { color: isIncoming ? colors.green : colors.red },
              ]}
            >
              {isIncoming ? "+" : "-"}
              {formatAmount(event.token_in_value || event.token_out_value)}
            </Text>
          )}
        </View>

        <View style={styles.bottomRow}>
          {counterparty ? (
            <Pressable onPress={openProfile} hitSlop={6}>
              <Text style={styles.counterparty}>
                {truncateAddress(counterparty)}
              </Text>
            </Pressable>
          ) : (
            <Text style={styles.counterpartyEmpty}>--</Text>
          )}
          <View style={styles.timestampRow}>
            <Text style={styles.timestamp}>
              {formatDate(event.date_block)}
            </Text>
            <FontAwesome
              name="external-link"
              size={9}
              color={colors.tertiaryLabel as string}
              style={styles.explorerIcon}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator as string,
    gap: spacing.md,
    alignItems: "center",
  },
  containerPressed: {
    backgroundColor: colors.quaternaryFill as string,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    ...typeScale.subheadline,
    fontWeight: "600",
    color: colors.label,
  },
  amount: {
    ...typeScale.subheadline,
    fontWeight: "700",
  },
  swapAmount: {
    flexDirection: "row",
    alignItems: "center",
  },
  swapArrow: {
    marginHorizontal: 6,
  },
  amountOut: {
    ...typeScale.subheadline,
    fontWeight: "700",
    color: colors.red,
  },
  amountIn: {
    ...typeScale.subheadline,
    fontWeight: "700",
    color: colors.green,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  counterparty: {
    ...typeScale.caption1,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: colors.blue,
  },
  counterpartyEmpty: {
    ...typeScale.caption1,
    color: colors.tertiaryLabel as string,
  },
  timestampRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timestamp: {
    ...typeScale.caption2,
    color: colors.tertiaryLabel as string,
  },
  explorerIcon: {
    marginLeft: 5,
  },
});
