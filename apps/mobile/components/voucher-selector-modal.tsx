import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { formatTokenAmount, type VoucherBalance } from "@/lib/token";
import {
  colors,
  type as typeScale,
  spacing,
  radius,
  shadow,
} from "@/lib/theme";
import type { Address } from "viem";

interface VoucherSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  currentVoucher?: string;
  vouchers: VoucherBalance[];
}

export function VoucherSelectorModal({
  visible,
  onClose,
  currentVoucher,
  vouchers,
}: VoucherSelectorModalProps) {
  const utils = trpc.useUtils();
  const updatePrimary = trpc.me.updatePrimary.useMutation({
    onSuccess: () => {
      utils.me.get.invalidate();
      onClose();
    },
    onError: (err) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", err.message);
    },
  });

  function handleSelect(address: Address) {
    if (address.toLowerCase() === currentVoucher?.toLowerCase()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updatePrimary.mutate({ default_voucher: address });
  }

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Drag handle */}
        <View style={styles.dragHandleWrap}>
          <View style={styles.dragHandle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Primary Voucher</Text>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && styles.closeBtnPressed,
            ]}
          >
            <FontAwesome
              name="times"
              size={14}
              color={colors.secondaryLabel as string}
            />
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Choose which voucher to display as your primary balance
        </Text>

        <FlatList
          data={vouchers}
          keyExtractor={(item) => item.address}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isCurrent =
              item.address.toLowerCase() === currentVoucher?.toLowerCase();
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.voucherCard,
                  isCurrent && styles.voucherCardCurrent,
                  pressed && styles.voucherCardPressed,
                ]}
                onPress={() => handleSelect(item.address)}
                disabled={updatePrimary.isPending}
              >
                {isCurrent && <View style={styles.accentBar} />}
                <View style={styles.voucherContent}>
                  <View style={styles.voucherLeft}>
                    <Text
                      style={[
                        styles.voucherSymbol,
                        isCurrent && styles.voucherSymbolCurrent,
                      ]}
                    >
                      {item.symbol}
                    </Text>
                    <Text style={styles.voucherName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  <View style={styles.voucherRight}>
                    <Text style={styles.voucherBalance}>
                      {formatTokenAmount(item.balance, item.decimals)}
                    </Text>
                    {isCurrent && (
                      <FontAwesome
                        name="check-circle"
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </View>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <FontAwesome
                  name="ticket"
                  size={28}
                  color={colors.tertiaryLabel as string}
                />
              </View>
              <Text style={styles.emptyText}>No vouchers held</Text>
            </View>
          }
        />

        {/* Loading overlay */}
        {updatePrimary.isPending && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dragHandleWrap: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.opaqueSeparator,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerSpacer: {
    width: 30,
  },
  headerTitle: {
    ...typeScale.headline,
    color: colors.label,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.tertiaryFill as string,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnPressed: {
    backgroundColor: colors.secondaryFill as string,
  },
  subtitle: {
    ...typeScale.footnote,
    color: colors.secondaryLabel as string,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  voucherCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.sm,
  },
  voucherCardCurrent: {
    backgroundColor: colors.primarySoft as string,
  },
  voucherCardPressed: {
    opacity: 0.8,
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  voucherContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  voucherLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  voucherSymbol: {
    ...typeScale.headline,
    color: colors.label,
  },
  voucherSymbolCurrent: {
    color: colors.primary,
  },
  voucherName: {
    ...typeScale.caption1,
    color: colors.secondaryLabel as string,
    marginTop: 2,
  },
  voucherRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  voucherBalance: {
    ...typeScale.subheadline,
    fontWeight: "600",
    color: colors.label,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: spacing.xxxl + spacing.xl,
    gap: spacing.md,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.quaternaryFill as string,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    ...typeScale.subheadline,
    color: colors.tertiaryLabel as string,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});
